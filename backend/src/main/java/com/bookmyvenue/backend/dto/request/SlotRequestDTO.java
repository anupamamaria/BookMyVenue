package com.bookmyvenue.backend.dto.request;

import com.bookmyvenue.backend.enums.SlotType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
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
}
