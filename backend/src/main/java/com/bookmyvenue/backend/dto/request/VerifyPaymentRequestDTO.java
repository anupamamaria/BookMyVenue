package com.bookmyvenue.backend.dto.request;

import com.bookmyvenue.backend.enums.PaymentResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequestDTO {

    private Long bookingId;

    private PaymentResult paymentResult;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

}