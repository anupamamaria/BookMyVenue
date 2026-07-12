package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.BookingStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VenueSlotBookingResponseDTO {

    private Long bookingId;
    private Long userId;
    private String userName;
    private String email;
    private String mobile;
    private BookingStatus bookingStatus;

    // Only populated for FLEXIBLE bookings
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    public VenueSlotBookingResponseDTO(Booking booking) {
        this.bookingId = booking.getBookingId();
        this.userId = booking.getUser().getUserId();
        this.userName = booking.getUser().getName();
        this.email = booking.getUser().getEmail();
        this.mobile = booking.getUser().getMobile();
        this.bookingStatus = booking.getBookingStatus();
        this.startDateTime = booking.getStartDateTime();
        this.endDateTime = booking.getEndDateTime();
    }
}
