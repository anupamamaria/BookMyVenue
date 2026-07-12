package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.enums.VenueStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VenueDetailsResponseDTO {

    private Long venueId;
    private String name;
    private String type;
    private String address;
    private String location;
    private int capacity;
    private boolean carParking;
    private boolean swimmingPool;
    private boolean outsideServicesAllowed;
    private boolean cateringProvided;
    private String additional;
    private VenueStatus venueStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SlotResponseDTO> slots;
    private List<VenueImageResponseDTO> imagePaths;

    public VenueDetailsResponseDTO(
            Venue venue,
            List<VenueImageResponseDTO> imagePaths,
            List<SlotResponseDTO> slots
    ) {
        this.venueId = venue.getVenueId();
        this.name = venue.getName();
        this.type = venue.getType();
        this.location = venue.getLocation();
        this.address = venue.getAddress();
        this.capacity = venue.getCapacity();
        this.carParking = venue.isCarParking();
        this.swimmingPool = venue.isSwimmingPool();
        this.outsideServicesAllowed = venue.isOutsideServicesAllowed();
        this.cateringProvided = venue.isCateringProvided();
        this.additional = venue.getAdditional();
        this.venueStatus = venue.getVenueStatus();
        this.createdAt = venue.getCreatedAt();
        this.updatedAt = venue.getUpdatedAt();

        this.imagePaths = imagePaths;
        this.slots = slots;
    }
    }
