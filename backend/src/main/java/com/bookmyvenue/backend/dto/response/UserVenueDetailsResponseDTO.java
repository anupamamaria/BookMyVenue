package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.entity.Venue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserVenueDetailsResponseDTO {

    private Long venueId;
    private String name;
    private String type;
    private String location;
    private String address;
    private Integer capacity;
    private boolean carParking;
    private boolean swimmingPool;
    private boolean outsideServicesAllowed;
    private boolean cateringProvided;
    private String additional;

    private List<VenueImageResponseDTO> imagePaths;

    private List<UserSlotResponseDTO> slots;

    public UserVenueDetailsResponseDTO(
            Venue venue,
            List<VenueImageResponseDTO> imagePaths,
            List<UserSlotResponseDTO> slots
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

        this.imagePaths = imagePaths;
        this.slots = slots;
    }
}