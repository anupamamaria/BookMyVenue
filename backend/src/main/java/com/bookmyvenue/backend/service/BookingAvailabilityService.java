package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.BookingMessage;
import com.bookmyvenue.backend.dto.request.BookingRequestDTO;
import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingAvailabilityService {

    private final BookingRepository bookingRepository;

    public void checkFixedSlotAvailability(Slot slot) {

        if (slot.getSlotStatus() != SlotStatus.AVAILABLE) {
            throw new BadRequestException("Slot is not available.");
        }
    }
    public void checkFlexibleSlotAvailability(
            Slot slot,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd) {

        List<Booking> bookings =
                bookingRepository.findActiveBookings(
                        slot.getSlotId(),
                        slot.getVenue().getVenueId());

        for (Booking booking : bookings) {

            LocalDateTime blockedStart =
                    booking.getStartDateTime()
                            .minusMinutes(slot.getBufferTime());

            LocalDateTime blockedEnd =
                    booking.getEndDateTime()
                            .plusMinutes(slot.getBufferTime());

            if (requestedStart.isBefore(blockedEnd)
                    && requestedEnd.isAfter(blockedStart)) {

                throw new BadRequestException(
                        "Requested time overlaps an existing booking or violates the required buffer time.");
            }
        }
    }
    public void checkSlotAvailability(
            Slot slot,
            BookingRequestDTO bookingRequest) {

        if (slot.getSlotType() == SlotType.FIXED) {
            checkFixedSlotAvailability(slot);
        } else {
            checkFlexibleSlotAvailability(slot,
                    bookingRequest.getStartDateTime(),
                    bookingRequest.getEndDateTime());
        }
    }

    public void checkSlotAvailability(
            Slot slot,
            BookingMessage bookingMessage) {

        if (slot.getSlotType() == SlotType.FIXED) {
            checkFixedSlotAvailability(slot);
        } else {
            checkFlexibleSlotAvailability(slot,
                    bookingMessage.getStartDateTime(),
                    bookingMessage.getEndDateTime());
        }
    }
}
