package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.response.UserBookingResponseDTO;
import com.bookmyvenue.backend.dto.response.UserDashboardResponseDTO;
import com.bookmyvenue.backend.dto.response.UserSlotResponseDTO;
import com.bookmyvenue.backend.dto.response.UserVenueDetailsResponseDTO;
import com.bookmyvenue.backend.service.PricingService;
import com.bookmyvenue.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PricingService pricingService;

    @GetMapping("user/dashboard")
    public ResponseEntity<Page<UserDashboardResponseDTO>> getUserDashboard(
            HttpServletRequest request,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) Boolean carParking,
            @RequestParam(required = false) Boolean swimmingPool,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getUserDashboard(
                userId,location,type,name, capacity,carParking,
                swimmingPool,startDate,endDate,page,size
        ));
    }

    @GetMapping("/user/venues/{venueId}")
    public ResponseEntity<UserVenueDetailsResponseDTO> getVenueDetails(
            @PathVariable Long venueId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                userService.getVenueDetails(venueId, startDate, endDate)
        );
    }

    @GetMapping("/user/venues/{venueId}/slots")
    public ResponseEntity<List<UserSlotResponseDTO>> getVenueSlots(
            @PathVariable Long venueId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                userService.getVenueSlots(
                        venueId,
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/user/{slotId}/price")
    public ResponseEntity<BigDecimal> getPrice(
            @PathVariable Long slotId,
            @RequestParam LocalDateTime startDateTime,
            @RequestParam LocalDateTime endDateTime
    ){
        return ResponseEntity.ok(pricingService.getPrice(slotId, startDateTime, endDateTime));
    }

    @GetMapping("/user/bookings")
    public ResponseEntity<List<UserBookingResponseDTO>> getAllBookings(
            HttpServletRequest request
    ){
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getAllBookings(userId));

    }

    @GetMapping("/user/upcoming-booking")
    public ResponseEntity<UserBookingResponseDTO> getUpcomingBooking(
            HttpServletRequest request
    ){
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getUpcomingBooking(userId));

    }
}