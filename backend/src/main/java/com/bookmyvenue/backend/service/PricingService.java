package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.BookingMessage;
import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.enums.SlotType;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PricingService {

    private final SlotRepository slotRepository;

    public BigDecimal calculatePrice(Slot slot, LocalDateTime startDateTime,
                                     LocalDateTime endDateTime){
        long durationMinutes = Duration.between(
                startDateTime,
                endDateTime
        ).toMinutes();
//        long durationHours = durationMinutes/60;
        if(slot.getSlotType() == SlotType.FIXED){
            return slot.getTotalSlotPrice();
        }
        else {
            long totalDurationMinutes = Duration.between(slot.getStartDateTime(), slot.getEndDateTime())
                    .toMinutes();
//            long totalDurationHours = totalDurationMinutes/60;
            if(durationMinutes == totalDurationMinutes){
                return slot.getTotalSlotPrice();
            }
            else{
                long extraMinutes = durationMinutes - slot.getMinSlotTime();
                BigDecimal pricePerMinute = slot.getMinSlotPrice().divide(
                        BigDecimal.valueOf(slot.getMinSlotTime()),
                        2,
                        RoundingMode.HALF_UP
                );
                BigDecimal extraPrice = pricePerMinute.multiply(
                        BigDecimal.valueOf(extraMinutes)
                );

                BigDecimal totalPrice = slot.getMinSlotPrice().add(extraPrice);
                return totalPrice;

            }
        }
    }

    public BigDecimal getPrice(Long slotId, LocalDateTime startDateTime, LocalDateTime endDateTime){
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new NotFoundException("Slot Not Found"));
        return calculatePrice(slot, startDateTime, endDateTime);

    }
}
