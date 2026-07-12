package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.SlotRequestDTO;
import com.bookmyvenue.backend.dto.request.VenueRequestDTO;
import com.bookmyvenue.backend.dto.response.*;
import com.bookmyvenue.backend.entity.*;
import com.bookmyvenue.backend.enums.*;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.ForbiddenException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.*;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueOwnerService {

    public final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final SlotRepository slotRepository;
    private final CloudinaryService cloudinaryService;
    private final VenueImageRepository venueImageRepository;
    private final BookingRepository bookingRepository;
    private final SlotService slotService;

    private Venue validateVenueOwner(Long ownerId, Long venueId) {
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
        return venue;
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

        Venue venue = validateVenueOwner(ownerId, venueId);

        String warning = slotService.validateNewSlot(venueId, slotRequest, null);

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
        slot.setSlotStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        return null;
    }

    public String editSlot(Long ownerId, Long venueId, Long slotId,
                          boolean dryRun, SlotRequestDTO slotRequest) {

        Venue venue = validateVenueOwner(ownerId, venueId);
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Slot not found"));
        if (slot.getSlotStatus() == SlotStatus.DELETED) {
            throw new BadRequestException("Cannot edit a deleted slot.");
        }

        String warning = slotService.validateNewSlot(venueId, slotRequest, slotId);

        if (dryRun && warning != null) {
            return warning;
        }

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

    public String addMultipleSlots(
            Long ownerId,
            Long venueId,
            boolean dryRun,
            List<SlotRequestDTO> slotRequests) {

        Venue venue = validateVenueOwner(ownerId, venueId);

        String warning = slotService.validateMultipleSlots(
                venueId,
                slotRequests
        );

        if (dryRun && warning != null) {
            return warning;
        }

        List<Slot> slots = slotRequests.stream()
                .map(request -> slotService.buildSlot(venue, request))
                .toList();

        slotRepository.saveAll(slots);

        return "Slots Created Successfully";
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

    public Page<VenueDashboardResponseDTO>  getVenueDashboard(
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
            dto.setCapacity(venue.getCapacity());
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

        List<Slot> allSlots = slotRepository.findByVenueVenueId(venueId);
        List<SlotResponseDTO> slotResponse = new ArrayList<>();
        for(Slot slot : allSlots){
            SlotResponseDTO slotResponseDTO = new SlotResponseDTO(slot);

                List<Booking> bookings = bookingRepository.findAllBookingsForSlot(
                        slot.getSlotId(), venueId);
                List<VenueSlotBookingResponseDTO> bookingResponse = bookings.stream()
                        .map(booking -> new VenueSlotBookingResponseDTO(booking))
                        .toList();
                slotResponseDTO.setBookings(bookingResponse);

            slotResponse.add(slotResponseDTO);
        }

        List<VenueImage> allImages = venueImageRepository.findByVenueVenueId(venueId);
        List<VenueImageResponseDTO> imageResponseDTOs = allImages.stream()
                .map(img -> new VenueImageResponseDTO(img))
                .collect(Collectors.toList());

        return new VenueDetailsResponseDTO(venue, imageResponseDTOs, slotResponse);
    }

    public Page<VenueBookingResponseDTO> getPastBookings(Long ownerId, Long venueId, int page, int size){
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));

        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners have access to this page");
        }
        if(venue.getOwner().getUserId() != ownerId){
            throw new ForbiddenException("You don't own this venue");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("startDateTime").descending());
        Page<Booking> pastBookings = bookingRepository.findByVenueVenueIdAndBookingStatusAndEndDateTimeLessThanOrderByEndDateTimeDesc(
                venueId, BookingStatus.CONFIRMED, LocalDateTime.now(), pageable
        );

        return pastBookings
                .map(booking -> new VenueBookingResponseDTO(booking));
    }

    public Page<VenueBookingResponseDTO> getUpcomingBookings(Long ownerId, Long venueId, int page, int size){
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NotFoundException("Venue Owner Not Found"));

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));

        if (owner.getRole() != Role.VENUE_OWNER) {
            throw new ForbiddenException("Only venue owners have access to this page");
        }
        if(venue.getOwner().getUserId() != ownerId){
            throw new ForbiddenException("You don't own this venue");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("startDateTime").descending());
        Page<Booking> upcomingBookings = bookingRepository.findByVenueVenueIdAndBookingStatusInAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
                venueId, List.of(BookingStatus.CONFIRMED, BookingStatus.RESERVED), LocalDateTime.now(), pageable
        );
        return upcomingBookings
                .map(booking -> new VenueBookingResponseDTO(booking));
    }

    public String deleteSlot(
            Long ownerId,
            Long venueId,
            Long slotId) {

        validateVenueOwner(ownerId, venueId);

        return slotService.deleteSlot(slotId);
    }

    public String blockSlot(
            Long ownerId,
            Long venueId,
            Long slotId) {

        validateVenueOwner(ownerId, venueId);

        return slotService.blockSlot(slotId,venueId);
    }

    public String unblockSlot(
            Long ownerId,
            Long venueId,
            Long slotId,
            boolean dryRun) {

        validateVenueOwner(ownerId, venueId);

        return slotService.unblockSlot(slotId, venueId, dryRun);
    }
}
