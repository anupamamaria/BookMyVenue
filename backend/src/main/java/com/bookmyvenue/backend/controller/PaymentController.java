package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.request.CreatePaymentOrderRequestDTO;
import com.bookmyvenue.backend.dto.request.VerifyPaymentRequestDTO;
import com.bookmyvenue.backend.dto.response.CreatePaymentOrderResponseDTO;
import com.bookmyvenue.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders")
    public ResponseEntity<CreatePaymentOrderResponseDTO> createOrder(
            @RequestBody CreatePaymentOrderRequestDTO request) {

        return ResponseEntity.ok(
                paymentService.createOrder(request.getBookingId())
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(
            @RequestBody VerifyPaymentRequestDTO request) {

        paymentService.verifyPayment(request);

        return ResponseEntity.ok("Payment status verification successful");
    }
}