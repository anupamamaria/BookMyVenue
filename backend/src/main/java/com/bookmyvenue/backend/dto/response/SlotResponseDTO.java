package com.bookmyvenue.backend.dto.response;


import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import lombok.Data;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SlotResponseDTO {

    private Long slotId;
    private SlotType slotType;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer minSlotTime;
    private Integer maxSlotTime;
    private BigDecimal minSlotPrice;
    private Integer bufferTime;
    private BigDecimal totalSlotPrice;
    private SlotStatus slotStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
