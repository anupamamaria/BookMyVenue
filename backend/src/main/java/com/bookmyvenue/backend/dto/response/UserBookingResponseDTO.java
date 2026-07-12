package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserBookingResponseDTO {

    private Long bookingId;
    private String venueName;
    private String location;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BigDecimal totalPrice;
    private BookingStatus bookingStatus;
    private String imagePath;

    public UserBookingResponseDTO(
            Booking booking, String imagePath) {

        this.bookingId = booking.getBookingId();
        this.venueName = booking.getVenue().getName();
        this.location = booking.getVenue().getLocation();
        this.startDateTime = booking.getStartDateTime();
        this.endDateTime = booking.getEndDateTime();
        this.totalPrice = booking.getTotalPrice();
        this.bookingStatus = booking.getBookingStatus();
        this.imagePath = imagePath;
    }
}
