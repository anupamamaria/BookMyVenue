package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.SlotRequestDTO;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.BookingRepository;
import com.bookmyvenue.backend.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final BookingRepository bookingRepository;


    public Slot buildSlot(Venue venue,
                           SlotRequestDTO request) {

        Slot slot = new Slot();

        slot.setVenue(venue);
        slot.setSlotType(request.getSlotType());
        slot.setStartDateTime(request.getStartDateTime());
        slot.setEndDateTime(request.getEndDateTime());
        slot.setBufferTime(request.getBufferTime());
        slot.setMinSlotTime(request.getMinSlotTime());
        slot.setMaxSlotTime(request.getMaxSlotTime());
        slot.setMinSlotPrice(request.getMinSlotPrice());
        slot.setTotalSlotPrice(request.getTotalSlotPrice());
        slot.setSlotStatus(SlotStatus.AVAILABLE);

        return slot;
    }

    private void checkOverlapBetweenRequestSlots(
            List<SlotRequestDTO> requests) {

        for (int i = 0; i < requests.size() - 1; i++) {

            SlotRequestDTO current = requests.get(i);
            SlotRequestDTO next = requests.get(i + 1);

            if (current.getEndDateTime().isAfter(next.getStartDateTime())) {

                throw new BadRequestException(
                        "Slots overlap within request.");
            }
        }
    }

    private String checkBufferConflictBetweenRequestSlots(
            List<SlotRequestDTO> requests) {

        for (int i = 0; i < requests.size() - 1; i++) {

            SlotRequestDTO current = requests.get(i);
            SlotRequestDTO next = requests.get(i + 1);

            int currentBuffer =
                    current.getBufferTime() == null ? 0 : current.getBufferTime();

            int nextBuffer =
                    next.getBufferTime() == null ? 0 : next.getBufferTime();

            LocalDateTime currentEndWithBuffer =
                    current.getEndDateTime().plusMinutes(currentBuffer);

            LocalDateTime currentStartWithBuffer =
                    current.getStartDateTime().minusMinutes(currentBuffer);

            boolean startNeedsCheck =
                    (next.getStartDateTime().isBefore(currentEndWithBuffer)
                            && next.getStartDateTime().isAfter(current.getEndDateTime()))
                            || next.getStartDateTime().equals(current.getEndDateTime());

            if (startNeedsCheck) {

                if (currentBuffer > 0 || nextBuffer > 0) {

                    throw new BadRequestException(
                            "Buffer conflict between request slots.");
                }

                return "No buffer between request slots.";
            }

            boolean endNeedsCheck =
                    (next.getEndDateTime().isAfter(currentStartWithBuffer)
                            && next.getEndDateTime().isBefore(current.getStartDateTime()))
                            || next.getEndDateTime().equals(current.getStartDateTime());

            if (endNeedsCheck) {

                if (currentBuffer > 0 || nextBuffer > 0) {

                    throw new BadRequestException(
                            "Buffer conflict between request slots.");
                }

                return "No buffer between request slots.";
            }
        }

        return null;
    }

    private void checkOverlapWithExistingSlots(
            List<Slot> existingSlots,
            List<SlotRequestDTO> requests) {

        List<Object> merged = new ArrayList<>();

        merged.addAll(existingSlots);
        merged.addAll(requests);

        merged.sort((a, b) -> {

            LocalDateTime first =
                    a instanceof Slot
                            ? ((Slot) a).getStartDateTime()
                            : ((SlotRequestDTO) a).getStartDateTime();

            LocalDateTime second =
                    b instanceof Slot
                            ? ((Slot) b).getStartDateTime()
                            : ((SlotRequestDTO) b).getStartDateTime();

            return first.compareTo(second);
        });

        for (int i = 0; i < merged.size() - 1; i++) {

            Object first = merged.get(i);
            Object second = merged.get(i + 1);

            if (first instanceof Slot && second instanceof Slot) {
                continue;
            }

            if (first instanceof SlotRequestDTO &&
                    second instanceof SlotRequestDTO) {
                continue;
            }

            LocalDateTime firstEnd =
                    first instanceof Slot
                            ? ((Slot) first).getEndDateTime()
                            : ((SlotRequestDTO) first).getEndDateTime();

            LocalDateTime secondStart =
                    second instanceof Slot
                            ? ((Slot) second).getStartDateTime()
                            : ((SlotRequestDTO) second).getStartDateTime();

            if (firstEnd.isAfter(secondStart)) {

                throw new BadRequestException(
                        "Slot overlaps with existing slot.");
            }
        }
    }

    private String checkBufferConflictWithExistingSlots(
            List<Slot> existingSlots,
            List<SlotRequestDTO> requests) {

        List<Object> merged = new ArrayList<>();

        merged.addAll(existingSlots);
        merged.addAll(requests);

        merged.sort((a, b) -> {

            LocalDateTime first =
                    a instanceof Slot
                            ? ((Slot) a).getStartDateTime()
                            : ((SlotRequestDTO) a).getStartDateTime();

            LocalDateTime second =
                    b instanceof Slot
                            ? ((Slot) b).getStartDateTime()
                            : ((SlotRequestDTO) b).getStartDateTime();

            return first.compareTo(second);
        });

        for (int i = 0; i < merged.size() - 1; i++) {

            Object first = merged.get(i);
            Object second = merged.get(i + 1);

            // Skip DB ↔ DB
            if (first instanceof Slot && second instanceof Slot) {
                continue;
            }

            // Skip Request ↔ Request
            if (first instanceof SlotRequestDTO &&
                    second instanceof SlotRequestDTO) {
                continue;
            }

            LocalDateTime firstStart =
                    first instanceof Slot
                            ? ((Slot) first).getStartDateTime()
                            : ((SlotRequestDTO) first).getStartDateTime();

            LocalDateTime firstEnd =
                    first instanceof Slot
                            ? ((Slot) first).getEndDateTime()
                            : ((SlotRequestDTO) first).getEndDateTime();

            int firstBuffer =
                    first instanceof Slot
                            ? (((Slot) first).getBufferTime() == null ? 0 : ((Slot) first).getBufferTime())
                            : (((SlotRequestDTO) first).getBufferTime() == null ? 0 : ((SlotRequestDTO) first).getBufferTime());

            LocalDateTime secondStart =
                    second instanceof Slot
                            ? ((Slot) second).getStartDateTime()
                            : ((SlotRequestDTO) second).getStartDateTime();

            LocalDateTime secondEnd =
                    second instanceof Slot
                            ? ((Slot) second).getEndDateTime()
                            : ((SlotRequestDTO) second).getEndDateTime();

            int secondBuffer =
                    second instanceof Slot
                            ? (((Slot) second).getBufferTime() == null ? 0 : ((Slot) second).getBufferTime())
                            : (((SlotRequestDTO) second).getBufferTime() == null ? 0 : ((SlotRequestDTO) second).getBufferTime());

            LocalDateTime firstEndWithBuffer =
                    firstEnd.plusMinutes(firstBuffer);

            LocalDateTime firstStartWithBuffer =
                    firstStart.minusMinutes(firstBuffer);

            boolean startNeedsCheck =
                    (secondStart.isBefore(firstEndWithBuffer)
                            && secondStart.isAfter(firstEnd))
                            || secondStart.equals(firstEnd);

            if (startNeedsCheck) {

                if (firstBuffer > 0 || secondBuffer > 0) {

                    throw new BadRequestException(
                            "Buffer conflict with existing slot.");
                }

                return "No buffer between slots.";
            }

            boolean endNeedsCheck =
                    (secondEnd.isAfter(firstStartWithBuffer)
                            && secondEnd.isBefore(firstStart))
                            || secondEnd.equals(firstStart);

            if (endNeedsCheck) {

                if (firstBuffer > 0 || secondBuffer > 0) {

                    throw new BadRequestException(
                            "Buffer conflict with existing slot.");
                }

                return "No buffer between slots.";
            }
        }

        return null;
    }

    public String validateMultipleSlots(
            Long venueId,
            List<SlotRequestDTO> requests) {

        String warning = null;

//         Basic validation
        for (SlotRequestDTO request : requests) {
            validateSlotBasics(request);
        }

        // Sort request slots
        requests.sort(
                Comparator.comparing(SlotRequestDTO::getStartDateTime)
        );

        // Request vs Request
        checkOverlapBetweenRequestSlots(requests);

        String requestWarning =
                checkBufferConflictBetweenRequestSlots(requests);

        if (warning == null) {
            warning = requestWarning;
        }

        // Existing slots
        List<Slot> existingSlots =
                slotRepository.findActiveSlotsForValidation(venueId);

        existingSlots.sort(
                Comparator.comparing(Slot::getStartDateTime)
        );

        // Request vs Existing
        checkOverlapWithExistingSlots(existingSlots, requests);

        String dbWarning =
                checkBufferConflictWithExistingSlots(existingSlots, requests);

        if (warning == null) {
            warning = dbWarning;
        }

        return warning;
    }

    private String checkBufferConflict(List<Slot> allSlots, SlotRequestDTO newSlot) {

        int newBuffer = newSlot.getBufferTime() != null ? newSlot.getBufferTime() : 0;

        for (Slot existing : allSlots) {
            int existingBuffer = existing.getBufferTime() != null ? existing.getBufferTime() : 0;

            LocalDateTime existingEndWithBuffer = existing.getEndDateTime().plusMinutes(existingBuffer);
            LocalDateTime existingStartWithBuffer = existing.getStartDateTime().minusMinutes(existingBuffer);

            // CHECK AFTER SIDE: new slot starts at or within buffer zone after existing ends
            // e.g. existing=2-6 buffer=30, new starts between 6:00 and 6:30, or exactly at 6:00
            boolean newStartNeedsCheck =
                    (newSlot.getStartDateTime().isBefore(existingEndWithBuffer) &&
                            newSlot.getStartDateTime().isAfter(existing.getEndDateTime()))
                            || newSlot.getStartDateTime().equals(existing.getEndDateTime());

            if (newStartNeedsCheck && (existingBuffer > 0 || newBuffer > 0)) {
                throw new BadRequestException(
                        "Cannot start slot at " + newSlot.getStartDateTime()
                                + ". Earliest allowed start: " + existingEndWithBuffer
                );
            } else if (newStartNeedsCheck && existingBuffer == 0 && newBuffer == 0) {
                return "No buffer between new slot and existing slot ending at "
                        + existing.getEndDateTime();
            }

            // CHECK BEFORE SIDE: new slot ends at or within buffer zone before existing starts
            // e.g. existing=2-6 buffer=60, new ends between 1:00 and 2:00, or exactly at 2:00
            boolean newEndNeedsCheck =
                    (newSlot.getEndDateTime().isAfter(existingStartWithBuffer) &&
                            newSlot.getEndDateTime().isBefore(existing.getStartDateTime()))
                            || newSlot.getEndDateTime().equals(existing.getStartDateTime());

            if (newEndNeedsCheck && (existingBuffer > 0 || newBuffer > 0)) {
                throw new BadRequestException(
                        "Cannot end slot at " + newSlot.getEndDateTime()
                                + ". Latest allowed end: " + existingStartWithBuffer
                );
            } else if (newEndNeedsCheck && existingBuffer == 0 && newBuffer == 0) {
                return "No buffer between new slot and existing slot starting at "
                        + existing.getStartDateTime();
            }
        }
        return null;
    }

    public String validateNewSlot(Long venueId, SlotRequestDTO slotRequest,
                                   Long excludedSlotId){
//         Basic validation
        validateSlotBasics(slotRequest);

//        No overlap with existing slots, below check supports multiDay slots
        List<Slot> overlappingSlots = slotRepository.
                findOverlappingSlots(venueId,
                        slotRequest.getEndDateTime(), slotRequest.getStartDateTime(), excludedSlotId);
        if (!overlappingSlots.isEmpty()) {
            Slot conflicting = overlappingSlots.get(0);
            throw new BadRequestException("Slot overlaps with existing slot: " +
                    conflicting.getStartDateTime() + " to " + conflicting.getEndDateTime());
        }
//        Buffer check with preceding slot (hard block if flexible, warning if fixed)
//        Buffer check with following slot (same logic)
        List<Slot> allSlots = slotRepository.findByVenueVenueIdExcludingSlot(venueId, excludedSlotId);
        String warning = checkBufferConflict(allSlots, slotRequest);
        return warning;

    }

    private void validateSlotBasics(SlotRequestDTO slotRequest){

//        End > Start (basic sanity)
        if (!slotRequest.getEndDateTime().isAfter(slotRequest.getStartDateTime())) {
            throw new BadRequestException("End time must be after start time");
        }
//        Not in the past
        if (slotRequest.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot create a slot in the past");
        }
//        For flexible: duration >= minSlotTime
        if (slotRequest.getSlotType() == SlotType.FLEXIBLE) {
            if (slotRequest.getMinSlotTime() == null) {
                throw new BadRequestException("MinSlotTime is required for flexible slot type");
            }
            if (slotRequest.getMinSlotPrice() == null) {
                throw new BadRequestException("MinSlotPrice is required for flexible slot type");
            }
            if (slotRequest.getMaxSlotTime() != null &&
                    slotRequest.getMaxSlotTime() < slotRequest.getMinSlotTime()) {
                throw new BadRequestException("MaxSlotTime should be greater than MinSlotTime");
            }
            long durationMinutes = Duration.between(slotRequest.getStartDateTime(),
                    slotRequest.getEndDateTime()).toMinutes();
            if (durationMinutes < slotRequest.getMinSlotTime()) {
                throw new BadRequestException("MinSlotTime cannot exceed Slot Duration");
            }
            if (slotRequest.getMaxSlotTime()!=null && durationMinutes < slotRequest.getMaxSlotTime()) {
                throw new BadRequestException("MaxSlotTime cannot exceed Slot Duration");
            }
        }
    }

    public String deleteSlot(Long slotId) {

        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() ->
                        new NotFoundException("Slot not found"));

        if (bookingRepository.existsBySlotSlotId(slotId)) {
            throw new BadRequestException(
                    "Cannot delete slot with existing bookings.");
        }
        slot.setSlotStatus(SlotStatus.DELETED);
        slotRepository.save(slot);
        return "Slot deleted successfully.";
    }

    public String blockSlot(Long slotId, Long venueId) {

        Slot slot = slotRepository.findBySlotIdAndVenueVenueId(slotId, venueId)
                .orElseThrow(() ->
                        new NotFoundException("Slot not found"));

        if (slot.getSlotStatus() == SlotStatus.BLOCKED) {
            throw new BadRequestException(
                    "Slot already blocked.");
        }
        slot.setSlotStatus(SlotStatus.BLOCKED);
        slotRepository.save(slot);
        return "Slot blocked successfully.";
    }

    public String unblockSlot(Long slotId, Long venueId, boolean dryRun) {

        Slot slot = slotRepository.findBySlotIdAndVenueVenueId(slotId, venueId)
                .orElseThrow(() ->
                        new NotFoundException("Slot not found"));
        if (slot.getSlotStatus() != SlotStatus.BLOCKED) {
            throw new BadRequestException(
                    "Slot is not blocked.");
        }

        SlotRequestDTO slotRequest = new SlotRequestDTO(slot);

        String warning = validateNewSlot(venueId, slotRequest, slotId);
        if (dryRun && warning != null) {
            return warning;
        }

        slot.setSlotStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
        return "Slot unblocked successfully.";
    }
}
