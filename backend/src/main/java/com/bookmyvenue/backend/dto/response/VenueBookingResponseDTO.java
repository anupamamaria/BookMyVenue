package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.BookingStatus;
import com.bookmyvenue.backend.enums.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VenueBookingResponseDTO {

    private Long bookingId;
    private String userName;
    private String userEmail;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BigDecimal totalPrice;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;

    public VenueBookingResponseDTO(
            Booking booking) {

        this.bookingId = booking.getBookingId();
        this.userName = booking.getUser().getName();
        this.userEmail = booking.getUser().getEmail();
        this.startDateTime = booking.getStartDateTime();
        this.endDateTime = booking.getEndDateTime();
        this.totalPrice = booking.getTotalPrice();
        this.bookingStatus = booking.getBookingStatus();
        this.paymentStatus = booking.getPaymentStatus();

    }
}
