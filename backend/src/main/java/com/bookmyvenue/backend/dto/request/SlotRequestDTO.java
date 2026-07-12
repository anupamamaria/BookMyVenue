package com.bookmyvenue.backend.dto.request;

import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.enums.SlotType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class SlotRequestDTO {

    @NotNull
    private LocalDateTime startDateTime;

    @NotNull
    private LocalDateTime endDateTime;

    @NotNull
    private SlotType slotType;

    private Integer minSlotTime;
    private Integer maxSlotTime;
    private BigDecimal minSlotPrice;
    private Integer bufferTime;

    @NotNull
    private BigDecimal totalSlotPrice;

    public SlotRequestDTO(Slot slot) {
        this.slotType = slot.getSlotType();
        this.startDateTime = slot.getStartDateTime();
        this.endDateTime = slot.getEndDateTime();
        this.bufferTime = slot.getBufferTime();
        this.minSlotTime = slot.getMinSlotTime();
        this.maxSlotTime = slot.getMaxSlotTime();
        this.minSlotPrice = slot.getMinSlotPrice();
        this.totalSlotPrice = slot.getTotalSlotPrice();
    }
}
