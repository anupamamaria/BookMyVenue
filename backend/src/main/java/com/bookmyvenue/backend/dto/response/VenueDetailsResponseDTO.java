package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.enums.VenueStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class VenueDetailsResponseDTO {

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
    private List<VenueImageResponseDTO> venueImages;
    }
