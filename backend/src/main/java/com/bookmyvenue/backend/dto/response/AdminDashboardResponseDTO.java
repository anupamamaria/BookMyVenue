package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.enums.VenueStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdminDashboardResponseDTO {

    private Long venueId;
    private String venueOwnerName;
    private String name;
    private String type;
    private String location;
    private String address;
    private int capacity;
    private String imagePath;
    private VenueStatus venueStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
