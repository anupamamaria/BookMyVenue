package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Venue;
import lombok.Data;

@Data
public class UserDashboardResponseDTO {

    public UserDashboardResponseDTO(Venue venue, String imagePath) {
        this.venueId = venue.getVenueId();
        this.name = venue.getName();
        this.type = venue.getType();
        this.location = venue.getLocation();
        this.capacity = venue.getCapacity();
        this.imagePath = imagePath;

    }
    private Long venueId;
    private String name;
    private String type;
    private String location;
    private String imagePath;
    private int capacity;
}