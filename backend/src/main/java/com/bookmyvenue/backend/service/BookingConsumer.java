package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.config.RabbitMQConfig;
import com.bookmyvenue.backend.dto.request.BookingMessage;
import com.bookmyvenue.backend.dto.response.BookingResponseDTO;
import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.entity.User;
import com.bookmyvenue.backend.enums.BookingStatus;
import com.bookmyvenue.backend.enums.PaymentStatus;
import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.BookingRepository;
import com.bookmyvenue.backend.repository.SlotRepository;
import com.bookmyvenue.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class BookingConsumer {

    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BookingAvailabilityService availabilityService;
    private final PricingService pricingService;

    @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
    @Transactional
    public BookingResponseDTO processBooking(BookingMessage message) {
        Slot slot = slotRepository.findBySlotIdForUpdate(message.getSlotId())
                .orElseThrow(() -> new NotFoundException("Slot Not Found"));
        User user = userRepository.findById(message.getUserId())
                .orElseThrow(() -> new NotFoundException("User Not Found"));
        availabilityService.checkSlotAvailability(slot, message);
        LocalDateTime startDateTime = message.getStartDateTime();
        LocalDateTime endDateTime = message.getEndDateTime();
        BigDecimal totalPrice = pricingService.calculatePrice(slot, startDateTime, endDateTime);
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVenue(slot.getVenue());
        booking.setSlot(slot);
        booking.setSlotType(slot.getSlotType());
        booking.setStartDateTime(message.getStartDateTime());
        booking.setEndDateTime(message.getEndDateTime());
        booking.setTotalPrice(totalPrice);
        booking.setBookingStatus(BookingStatus.RESERVED);
        booking.setPaymentStatus(PaymentStatus.PENDING);

        bookingRepository.save(booking);
        if (slot.getSlotType() == SlotType.FIXED) {
            slot.setSlotStatus(SlotStatus.RESERVED);
            slotRepository.save(slot);
        }

        return new BookingResponseDTO(
                booking.getBookingId(),
                booking.getBookingStatus(),
                booking.getTotalPrice()
        );
    }
}
