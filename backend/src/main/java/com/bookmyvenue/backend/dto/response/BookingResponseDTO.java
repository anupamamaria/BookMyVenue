package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponseDTO {

    private Long bookingId;

    private BookingStatus bookingStatus;

    private BigDecimal totalAmount;
}
