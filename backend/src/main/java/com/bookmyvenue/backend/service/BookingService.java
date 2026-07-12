package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.BookingMessage;
import com.bookmyvenue.backend.dto.request.BookingRequestDTO;
import com.bookmyvenue.backend.dto.response.BookingResponseDTO;
import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.enums.BookingStatus;
import com.bookmyvenue.backend.enums.PaymentStatus;
import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.BookingRepository;
import com.bookmyvenue.backend.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final BookingAvailabilityService bookingAvailabilityService;
    private final RabbitMQService rabbitMQService;

    private void validateFixedSlot(
            Slot slot,
            BookingRequestDTO bookingRequest) {

        if (slot.getSlotStatus() != SlotStatus.AVAILABLE) {
            throw new BadRequestException("Slot is not available.");
        }

        if (!bookingRequest.getStartDateTime().equals(slot.getStartDateTime())
                || !bookingRequest.getEndDateTime().equals(slot.getEndDateTime())) {
            throw new BadRequestException("Invalid slot timing.");
        }
        if (slot.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book a past slot.");
        }
    }

    private void validateFlexibleSlot(
            Slot slot,
            BookingRequestDTO bookingRequest) {

        if (bookingRequest.getStartDateTime().isBefore(slot.getStartDateTime())
                || bookingRequest.getEndDateTime().isAfter(slot.getEndDateTime())) {

            throw new BadRequestException("Requested time is outside slot availability.");
        }
        if (bookingRequest.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book a past slot.");
        }
        long durationMinutes = Duration.between(
                bookingRequest.getStartDateTime(),
                bookingRequest.getEndDateTime()
        ).toMinutes();
        if (durationMinutes < slot.getMinSlotTime()) {
            throw new BadRequestException("Minimum booking duration not met.");
        }
        if (durationMinutes > slot.getMaxSlotTime()) {
            throw new BadRequestException("Maximum booking duration exceeded.");
        }
    }



    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO bookingRequest){
        Slot slot = slotRepository.findById(bookingRequest.getSlotId())
                .orElseThrow(() -> new NotFoundException("Slot not found"));
        if (!slot.getVenue().getVenueId().equals(bookingRequest.getVenueId())) {
            throw new BadRequestException("Slot does not belong to the selected venue.");
        }
        if (slot.getSlotType() == SlotType.FIXED) {
            validateFixedSlot(slot, bookingRequest);
        } else {
            validateFlexibleSlot(slot, bookingRequest);
        }
        bookingAvailabilityService.checkSlotAvailability(slot, bookingRequest);
        BookingMessage bookingMessage = new BookingMessage(
                userId,
                bookingRequest.getVenueId(),
                bookingRequest.getSlotId(),
                bookingRequest.getStartDateTime(),
                bookingRequest.getEndDateTime()
        );

        return rabbitMQService.publishBooking(bookingMessage);
    }

    @Transactional
    public void expirePendingBookings() {

        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(15);

        List<Booking> bookings =
                bookingRepository.findByBookingStatusAndPaymentStatusAndCreatedAtLessThanEqual(
                BookingStatus.RESERVED,
                PaymentStatus.PENDING,
                expiryTime
        );

        for (Booking booking : bookings) {

            booking.setPaymentStatus(PaymentStatus.FAILED);
            booking.setBookingStatus(BookingStatus.PAYMENT_FAILED);

            if (booking.getSlot().getSlotType() == SlotType.FIXED) {
                booking.getSlot().setSlotStatus(SlotStatus.AVAILABLE);
            }
        }

        bookingRepository.saveAll(bookings);
    }
}
