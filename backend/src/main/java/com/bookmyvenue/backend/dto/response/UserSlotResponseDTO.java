package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Slot;
import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserSlotResponseDTO {

    private Long slotId;
    private SlotType slotType;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private Integer minSlotTime;
    private Integer maxSlotTime;
    private Integer bufferTime;
    private BigDecimal minSlotPrice;

    private BigDecimal totalSlotPrice;

    private SlotStatus slotStatus;

    private List<UserSlotBookingResponseDTO> bookings;

    public UserSlotResponseDTO(Slot slot) {
        this.slotId = slot.getSlotId();
        this.slotType = slot.getSlotType();
        this.startDateTime = slot.getStartDateTime();
        this.endDateTime = slot.getEndDateTime();
        this.minSlotTime = slot.getMinSlotTime();
        this.maxSlotTime = slot.getMaxSlotTime();
        this.bufferTime = slot.getBufferTime();
        this.minSlotPrice = slot.getMinSlotPrice();
        this.totalSlotPrice = slot.getTotalSlotPrice();
        this.slotStatus = slot.getSlotStatus();
    }
}
