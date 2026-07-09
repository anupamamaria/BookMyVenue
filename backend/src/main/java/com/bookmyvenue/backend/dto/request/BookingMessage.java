package com.bookmyvenue.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingMessage {

    private Long userId;
    private Long venueId;
    private Long slotId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
}
