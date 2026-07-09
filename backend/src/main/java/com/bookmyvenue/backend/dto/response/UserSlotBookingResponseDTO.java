package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.BookingStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserSlotBookingResponseDTO {

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BookingStatus bookingStatus;

    public UserSlotBookingResponseDTO(Booking booking) {
        this.startDateTime = booking.getStartDateTime();
        this.endDateTime = booking.getEndDateTime();
        this.bookingStatus = booking.getBookingStatus();
    }
}
