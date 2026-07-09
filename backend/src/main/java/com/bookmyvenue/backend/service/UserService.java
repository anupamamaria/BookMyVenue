package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.response.*;
import com.bookmyvenue.backend.entity.*;
import com.bookmyvenue.backend.enums.BookingStatus;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.enums.VenueStatus;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final SlotRepository slotRepository;
    private final VenueImageRepository venueImageRepository;
    private final BookingRepository bookingRepository;

    public Page<UserDashboardResponseDTO> getUserDashboard(
            Long userId, String  location, String type, String name,
            Integer capacity, Boolean carParking, Boolean swimmingPool,
            LocalDate startDate, LocalDate endDate, int page, int size
            ) {
        User user = null;

        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User Not Found"));
        }
        if (user!=null && (location == null || location.isBlank())) {
            location = user.getLocation();
        }
        Pageable pageable = PageRequest.of(page, size);
        List<Venue> venues;
        List<Slot> slots;
        boolean noFiltersApplied =
                (location == null || location.isBlank()) &&
                        (type == null || type.isBlank()) &&
                        (name == null || name.isBlank()) &&
                        capacity == null &&
                        carParking == null &&
                        swimmingPool == null &&
                        startDate == null &&
                        endDate == null;
        if (user == null && noFiltersApplied) {

            List<String> locations = venueRepository.findLocations(PageRequest.of(0, 3));

            venues = new ArrayList<>();

            for (String loc : locations) {
                venues.addAll(
                        venueRepository.findByLocationAndVenueStatusOrderByCreatedAtDesc(
                                loc,
                                VenueStatus.APPROVED,
                                PageRequest.of(0, 5)
                        )
                );
            }

        } else {
            venues = venueRepository.findUserDashboardVenues(location,type,name,
                    capacity, carParking, swimmingPool);
        }
        if(venues.isEmpty()){
            return Page.empty(pageable);
        }
        boolean dateFilterApplied =
                startDate != null || endDate != null;
        if(!dateFilterApplied){
            List<UserDashboardResponseDTO> response = venues.stream()
                    .map(venue ->
                    {
                        Optional<VenueImage> profileImage = venueImageRepository
                                .findByVenueVenueIdAndIsProfileTrue(venue.getVenueId());

                        String imagePath = null;

                        if (profileImage.isPresent()) {
                            imagePath = profileImage.get().getImagePath();
                        }
                      return  new UserDashboardResponseDTO(venue, imagePath);
                    })
                    .toList();
            return new PageImpl<>(response, pageable, response.size());
        }
        else {
            List<Long> venueIds = venues.stream()
                    .map(venue -> venue.getVenueId())
                    .toList();
            LocalDateTime searchStart = startDate.atStartOfDay();

            LocalDateTime searchEnd = (endDate != null ? endDate : startDate)
                    .atTime(LocalTime.MAX);
            slots = slotRepository.findByVenueVenueIdIn(venueIds, searchStart, searchEnd);
            Set<Long> matchingVenueIds  = slots.stream().map(slot -> slot.getVenue().getVenueId())
                    .collect(Collectors.toSet());
            List<Venue> matchingVenues = venueRepository.findByVenueIdIn(matchingVenueIds);
            List<UserDashboardResponseDTO> response = matchingVenues.stream()
                    .map(matchingVenue ->
                    {
                        Optional<VenueImage> profileImage = venueImageRepository
                                .findByVenueVenueIdAndIsProfileTrue(matchingVenue.getVenueId());

                        String imagePath = null;

                        if (profileImage.isPresent()) {
                            imagePath = profileImage.get().getImagePath();
                        }
                       return new UserDashboardResponseDTO(matchingVenue, imagePath);
                    })
                    .toList();
            return new PageImpl<>(response, pageable, response.size());
        }
    }

    public UserVenueDetailsResponseDTO getVenueDetails(
            Long venueId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue not found"));
        if (startDate == null) {
            throw new BadRequestException("Start date is required.");
        }
        if (endDate == null) {
            throw new BadRequestException("End date is required.");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past.");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date.");
        }
        long days = ChronoUnit.DAYS.between(startDate, endDate);

        if (days > 365) {
            throw new BadRequestException("Date range cannot exceed one year.");
        }

            LocalDateTime searchStart = startDate.atStartOfDay();

            LocalDateTime searchEnd = endDate.atTime(LocalTime.MAX);

        List<UserSlotResponseDTO> slotResponse = buildUserSlotResponse(venueId, searchStart, searchEnd);
        List<VenueImage> images = venueImageRepository.findByVenueVenueId(venueId);
        List<VenueImageResponseDTO> imageResponseDTOs = images.stream()
                .map(img -> new VenueImageResponseDTO(img)).
                collect(Collectors.toList());

//        List<String> imagePaths = images.stream()
//                .map(image -> image.getImagePath())
//                .toList();

        return new UserVenueDetailsResponseDTO(venue, imageResponseDTOs, slotResponse);
    }

    public List<UserSlotResponseDTO> getVenueSlots(
            Long venueId, LocalDate startDate, LocalDate endDate) {
            LocalDateTime searchStart = startDate.atStartOfDay();

            LocalDateTime searchEnd = endDate.atTime(LocalTime.MAX);
            List<UserSlotResponseDTO> slotResponse = buildUserSlotResponse(venueId, searchStart, searchEnd);
            return slotResponse;

    }

    private List<UserSlotResponseDTO> buildUserSlotResponse(
            Long venueId,
            LocalDateTime searchStart,
            LocalDateTime searchEnd
    ) {
        // fetch slots
        List <Slot> slots = slotRepository.findVenueSlotsByDateRange(
                venueId,
                searchStart,
                searchEnd
        );
        List<UserSlotResponseDTO> slotResponse = new ArrayList<>();

        // populate bookings for flexible slots
        for(Slot slot : slots){
            UserSlotResponseDTO dto = new UserSlotResponseDTO(slot);
            if(slot.getSlotType() == SlotType.FLEXIBLE){
                List<Booking> bookings = bookingRepository.findBookingsForSlot(
                        slot.getSlotId(), venueId, searchStart, searchEnd
                );
                List<UserSlotBookingResponseDTO> bookingResponse = bookings.stream()
                        .map(booking -> new UserSlotBookingResponseDTO(booking))
                        .toList();
                dto.setBookings(bookingResponse);
            }
            slotResponse.add(dto);
        }
        // return DTOs
        return slotResponse;
    }

    public List<UserBookingResponseDTO> getAllBookings(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Booking> allBookings = bookingRepository.findByUserUserIdOrderByStartDateTimeDesc(userId);
        return  allBookings.stream()
                .map(booking ->
                {
                    String imagePath =venueImageRepository.findByVenueVenueIdAndIsProfileTrue(
                                    booking.getVenue().getVenueId())
                            .map(img -> img.getImagePath())
                            .orElse(null);
                    return new UserBookingResponseDTO(booking, imagePath);

                })
                .toList();

    }

    public UserBookingResponseDTO getUpcomingBooking(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Optional<Booking> booking = bookingRepository.findFirstByUserUserIdAndBookingStatusInAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
                userId,
                List.of(BookingStatus.CONFIRMED, BookingStatus.RESERVED),
                LocalDateTime.now()
        );
        if(booking.isEmpty()){
            return null;
        }
        String imagePath = venueImageRepository.findByVenueVenueIdAndIsProfileTrue(
                booking.get().getVenue().getVenueId())
                .map(img -> img.getImagePath())
                .orElse(null);
        UserBookingResponseDTO upcomingBooking = new UserBookingResponseDTO(booking.get(), imagePath);
        return upcomingBooking;
    }
}