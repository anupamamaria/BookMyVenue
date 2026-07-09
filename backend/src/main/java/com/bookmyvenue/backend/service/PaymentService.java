package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.VerifyPaymentRequestDTO;
import com.bookmyvenue.backend.dto.response.CreatePaymentOrderResponseDTO;
import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.*;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.BookingRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final BookingRepository bookingRepository;
    private final RazorpayClient razorpayClient;

    @Transactional
    public CreatePaymentOrderResponseDTO createOrder(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found."));

        if (booking.getBookingStatus() != BookingStatus.RESERVED) {
            throw new BadRequestException("Booking is not reserved.");
        }

        if (booking.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Booking is already paid.");
        }
        if (booking.getRazorpayOrderId() != null) {
            return new CreatePaymentOrderResponseDTO(
                    booking.getBookingId(),
                    booking.getRazorpayOrderId()
            );
        }
        try {
            JSONObject options = new JSONObject();
            options.put(
                    "amount",
                    booking.getTotalPrice()
                            .multiply(BigDecimal.valueOf(100))
                            .longValue()
            );

            options.put("currency", "INR");

            options.put("receipt", booking.getBookingId().toString());

            Order order = razorpayClient.orders.create(options);

            booking.setRazorpayOrderId(order.get("id"));

            bookingRepository.save(booking);

            return new CreatePaymentOrderResponseDTO(
                    booking.getBookingId(),
                    order.get("id").toString()
            );

        } catch (RazorpayException e) {
            throw new RuntimeException("Unable to create Razorpay order.", e);
        }
    }

    @Transactional
    public void verifyPayment(VerifyPaymentRequestDTO request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NotFoundException("Booking not found."));

        if (request.getPaymentResult() == PaymentResult.FAILED) {

            booking.setPaymentStatus(PaymentStatus.FAILED);
            booking.setBookingStatus(BookingStatus.PAYMENT_FAILED);
            if(booking.getSlotType()==SlotType.FIXED){
                booking.getSlot().setSlotStatus(SlotStatus.AVAILABLE);
            }

            bookingRepository.save(booking);

            return;
        }

        if (!booking.getRazorpayOrderId().equals(request.getRazorpayOrderId())) {
            throw new BadRequestException("Invalid Razorpay Order.");
        }

        // Verify Razorpay Signature
        validateSignature(request);

        booking.setPaymentStatus(PaymentStatus.SUCCESS);

        booking.setRazorpayPaymentId(request.getRazorpayPaymentId());

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        if(booking.getSlotType()==SlotType.FIXED){
            booking.getSlot().setSlotStatus(SlotStatus.BOOKED);
        }
        bookingRepository.save(booking);

    }

    private void validateSignature(VerifyPaymentRequestDTO request) {

        JSONObject options = new JSONObject();

        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        try {
            boolean valid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!valid) {
                throw new BadRequestException("Invalid payment signature.");
            }

        } catch (RazorpayException e) {
            throw new RuntimeException("Unable to verify payment signature.", e);
        }
    }
}