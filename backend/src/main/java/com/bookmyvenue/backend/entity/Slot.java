package com.bookmyvenue.backend.entity;

import com.bookmyvenue.backend.enums.SlotStatus;
import com.bookmyvenue.backend.enums.SlotType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long slotId;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Enumerated(EnumType.STRING)
    private SlotType slotType;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private Integer minSlotTime;
    private Integer maxSlotTime;
    private BigDecimal minSlotPrice;
    private Integer bufferTime;
    private BigDecimal totalSlotPrice;

    @Enumerated(EnumType.STRING)
    private SlotStatus slotStatus;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
