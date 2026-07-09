package com.bookmyvenue.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderResponseDTO {

    private Long bookingId;

    private String orderId;

}
