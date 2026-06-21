package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.SlotRequestDTO;
import com.bookmyvenue.backend.dto.request.VenueRequestDTO;
import com.bookmyvenue.backend.dto.response.SlotResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDashboardResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDetailsResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueImageResponseDTO;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.entity.User;
import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.entity.VenueImage;
import com.bookmyvenue.backend.enums.Role;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.enums.VenueStatus;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.ForbiddenException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.SlotRepository;
import com.bookmyvenue.backend.repository.UserRepository;
import com.bookmyvenue.backend.repository.VenueImageRepository;
import com.bookmyvenue.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueOwnerService {

    public final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final SlotRepository slotRepository;
    private final CloudinaryService cloudinaryService;
    private final VenueImageRepository venueImageRepository;

    private String checkBufferConflict(List<Slot> allSlots, SlotRequestDTO newSlot) {

        int newBuffer = newSlot.getBufferTime() != null ? newSlot.getBufferTime() : 0;

        for (Slot existing : allSlots) {
            int existingBuffer = existing.getBufferTime() != null ? existing.getBufferTime() : 0;

            LocalDateTime existingEndWithBuffer = existing.getEndDateTime().plusMinutes(existingBuffer);
            LocalDateTime existingStartWithBuffer = existing.getStartDateTime().minusMinutes(existingBuffer);

            // CHECK AFTER SIDE: new slot starts at or within buffer zone after existing ends
            // e.g. existing=2-6 buffer=30, new starts between 6:00 and 6:30, or exactly at 6:00
            boolean newStartNeedsCheck =
                    (newSlot.getStartDateTime().isBefore(existingEndWithBuffer) &&
                            newSlot.getStartDateTime().isAfter(existing.getEndDateTime()))
                            || newSlot.getStartDateTime().equals(existing.getEndDateTime());

            if (newStartNeedsCheck && (existingBuffer > 0 || newBuffer > 0)) {
                throw new BadRequestException(
                        "Cannot start slot at " + newSlot.getStartDateTime()
                                + ". Earliest allowed start: " + existingEndWithBuffer
                );
            } else if (newStartNeedsCheck && existingBuffer == 0 && newBuffer == 0) {
                return "No buffer between new slot and existing slot ending at "
                        + existing.getEndDateTime();
            }

            // CHECK BEFORE SIDE: new slot ends at or within buffer zone before existing starts
            // e.g. existing=2-6 buffer=60, new ends between 1:00 and 2:00, or exactly at 2:00
            boolean newEndNeedsCheck =
                    (newSlot.getEndDateTime().isAfter(existingStartWithBuffer) &&
                            newSlot.getEndDateTime().isBefore(existing.getStartDateTime()))
                            || newSlot.getEndDateTime().equals(existing.getStartDateTime());

            if (newEndNeedsCheck && (existingBuffer > 0 || newBuffer > 0)) {
                throw new BadRequestException(
                        "Cannot end slot at " + newSlot.getEndDateTime()
                                + ". Latest allowed end: " + existingStartWithBuffer
                );
            } else if (newEndNeedsCheck && existingBuffer == 0 && newBuffer == 0) {
                return "No buffer between new slot and existing slot starting at "
                        + existing.getStartDateTime();
            }
        }
        return null;
    }

    private String validateNewSlot(Long venueId, SlotRequestDTO slotRequest){

//        End > Start (basic sanity)
        if (!slotRequest.getEndDateTime().isAfter(slotRequest.getStartDateTime())) {
            throw new BadRequestException("End time must be after start time");
        }
//        Not in the past
        if (slotRequest.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot create a slot in the past");
        }
//        For flexible: duration >= minSlotTime
        if (slotRequest.getSlotType() == SlotType.FLEXIBLE) {
            if (slotRequest.getMinSlotTime() == null) {
                throw new BadRequestException("MinSlotTime is required for flexible slot type");
            }
            if (slotRequest.getMinSlotPrice() == null) {
                throw new BadRequestException("MinSlotPrice is required for flexible slot type");
            }
            if (slotRequest.getMaxSlotTime() != null &&
                    slotRequest.getMaxSlotTime() < slotRequest.getMinSlotTime()) {
                throw new BadRequestException("MaxSlotTime should be greater than MinSlotTime");
            }
            long durationMinutes = Duration.between(slotRequest.getStartDateTime(),
                    slotRequest.getEndDateTime()).toMinutes();
            if (durationMinutes < slotRequest.getMinSlotTime()) {
                throw new BadRequestException("MinSlotTime cannot exceed Slot Duration");
            }
            if (durationMinutes < slotRequest.getMaxSlotTime()) {
                throw new BadRequestException("MaxSlotTime cannot exceed Slot Duration");
            }
        }
//        No overlap with existing slots, below check supports multiDay slots
            List<Slot> overlappingSlots = slotRepository.
                    findByVenueVenueIdAndStartDateTimeBeforeAndEndDateTimeAfter(venueId,
                            slotRequest.getEndDateTime(), slotRequest.getStartDateTime());
            if (!overlappingSlots.isEmpty()) {
                Slot conflicting = overlappingSlots.get(0);
                throw new BadRequestException("Slot overlaps with existing slot: " +
                        conflicting.getStartDateTime() + " to " + conflicting.getEndDateTime());
            }
//        Buffer check with preceding slot (hard block if flexible, warning if fixed)
//        Buffer check with following slot (same logic)
        List<Slot> allSlots = slotRepository.findByVenueVenueId(venueId);
        String warning = checkBufferConflict(allSlots, slotRequest);
        return warning;

    }

    public Long addVenue(Long ownerId, VenueRequestDTO venueRequest) {
        if (venueRepository.existsByAddressAndLocation(venueRequest.getAddress(), venueRequest.getLocation())) {
            throw new BadRequestException("A venue already exists at this address and location");
        }
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner not found"));
        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners can create venues");
        }

        Venue venue = new Venue();

        venue.setOwner(owner);
        venue.setName(venueRequest.getName());
        venue.setAddress(venueRequest.getAddress());
        venue.setLocation(venueRequest.getLocation());
        venue.setCapacity(venueRequest.getCapacity());
        venue.setType(venueRequest.getType());
        venue.setCarParking(venueRequest.getCarParking());
        venue.setOutsideServicesAllowed(venueRequest.getOutsideServicesAllowed());
        venue.setSwimmingPool(venueRequest.getSwimmingPool());
        venue.setCateringProvided(venueRequest.getCateringProvided());
        venue.setAdditional(venueRequest.getAdditional());
        venue.setVenueStatus(VenueStatus.PENDING);

        Venue addedVenue = venueRepository.save(venue);
        return addedVenue.getVenueId();
    }

    public String addSlot(Long ownerId, Long venueId,
                          boolean dryRun, SlotRequestDTO slotRequest) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));
        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners can create slots");
        }
        if (!owner.getUserId().equals(venue.getOwner().getUserId())) {
            throw new ForbiddenException("You don't own this venue");
        }

        String warning = validateNewSlot(venueId, slotRequest);

        if (dryRun && warning != null) {
            return warning;
        }

        Slot slot = new Slot();
        slot.setVenue(venue);
        slot.setSlotType(slotRequest.getSlotType());
        slot.setStartDateTime(slotRequest.getStartDateTime());
        slot.setEndDateTime(slotRequest.getEndDateTime());
        slot.setMinSlotPrice(slotRequest.getMinSlotPrice());
        slot.setMinSlotTime(slotRequest.getMinSlotTime());
        slot.setMaxSlotTime(slotRequest.getMaxSlotTime());
        slot.setBufferTime(slotRequest.getBufferTime());
        slot.setTotalSlotPrice(slotRequest.getTotalSlotPrice());
        slotRepository.save(slot);
        return null;
    }

    public void uploadVenueImage(Long ownerId, Long venueId,
                                List<MultipartFile> images, int profileIndex) throws IOException {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));
        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners can upload venue images");
        }
        if (!owner.getUserId().equals(venue.getOwner().getUserId())) {
            throw new ForbiddenException("You don't own this venue");
        }

        for(int i=0; i< images.size(); i++){
            String imageUrl = cloudinaryService.uploadImage(images.get(i));
            VenueImage venueImage = new VenueImage();
            venueImage.setVenue(venue);
            venueImage.setImagePath(imageUrl);
            venueImage.setProfile(i==profileIndex);

            venueImageRepository.save(venueImage);

        }



    }

    public Page<VenueDashboardResponseDTO> getVenueDashboard(
            Long ownerId, String location, String type,
            VenueStatus venueStatus, int page, int size) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));

        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners have access to this page");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<Venue> venues = venueRepository.findByOwnerWithFilters(ownerId, location,
                type, venueStatus, pageable);

        return venues.map(venue -> {
            VenueDashboardResponseDTO dto = new VenueDashboardResponseDTO();
            dto.setVenueId(venue.getVenueId());
            dto.setName(venue.getName());
            dto.setType(venue.getType());
            dto.setLocation(venue.getLocation());
            dto.setAddress(venue.getAddress());
            dto.setVenueStatus(venue.getVenueStatus());
            dto.setCreatedAt(venue.getCreatedAt());
            dto.setUpdatedAt(venue.getUpdatedAt());
            venueImageRepository.findByVenueVenueIdAndIsProfileTrue(venue.getVenueId())
                    .ifPresent(img -> dto.setImagePath(img.getImagePath()));
            return dto;
        });
    }

    public VenueDetailsResponseDTO getVenueDetails(Long ownerId, Long venueId) {

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));
        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners can access this page");
        }
        if (!owner.getUserId().equals(venue.getOwner().getUserId())) {
            throw new ForbiddenException("You don't own this venue");
        }

        VenueDetailsResponseDTO dto = new VenueDetailsResponseDTO();
        dto.setName(venue.getName());
        dto.setType(venue.getType());
        dto.setLocation(venue.getLocation());
        dto.setAddress(venue.getAddress());
        dto.setCapacity(venue.getCapacity());
        dto.setCarParking(venue.isCarParking());
        dto.setSwimmingPool(venue.isSwimmingPool());
        dto.setOutsideServicesAllowed(venue.isOutsideServicesAllowed());
        dto.setCateringProvided(venue.isCateringProvided());
        dto.setAdditional(venue.getAdditional());
        dto.setVenueStatus(venue.getVenueStatus());
        dto.setCreatedAt(venue.getCreatedAt());
        dto.setUpdatedAt(venue.getUpdatedAt());

        List<Slot> allSlots = slotRepository.findByVenueVenueId(venueId);
        List<SlotResponseDTO> slotResponseDTOS = allSlots.stream().map( slot -> {
            SlotResponseDTO slotResponseDTO = new SlotResponseDTO();
            slotResponseDTO.setSlotId(slot.getSlotId());
            slotResponseDTO.setSlotType(slot.getSlotType());
            slotResponseDTO.setStartDateTime(slot.getStartDateTime());
            slotResponseDTO.setEndDateTime(slot.getEndDateTime());
            slotResponseDTO.setTotalSlotPrice(slot.getTotalSlotPrice());
            slotResponseDTO.setCreatedAt(slot.getCreatedAt());
            slotResponseDTO.setUpdatedAt(slot.getUpdatedAt());
            if(slot.getSlotType()==SlotType.FLEXIBLE){
                slotResponseDTO.setMinSlotTime(slot.getMinSlotTime());
                slotResponseDTO.setMaxSlotTime(slot.getMaxSlotTime());
                slotResponseDTO.setMinSlotPrice(slot.getMinSlotPrice());
                slotResponseDTO.setBufferTime(slot.getBufferTime());
            }
            return slotResponseDTO;
        }).collect(Collectors.toList());
        dto.setSlots(slotResponseDTOS);

        List<VenueImage> allImages = venueImageRepository.findByVenueVenueId(venueId);
        List<VenueImageResponseDTO> imageResponseDTOs = allImages.stream().map(img -> {
            VenueImageResponseDTO imageResponseDTO = new VenueImageResponseDTO();
            imageResponseDTO.setImageId(img.getImageId());
            imageResponseDTO.setImagePath(img.getImagePath());
            imageResponseDTO.setProfile(img.isProfile());
            return imageResponseDTO;
        }).collect(Collectors.toList());
        dto.setVenueImages(imageResponseDTOs);

        return dto;
    }
}
