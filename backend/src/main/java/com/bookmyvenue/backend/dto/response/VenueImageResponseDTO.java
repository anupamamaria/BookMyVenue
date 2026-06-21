package com.bookmyvenue.backend.dto.response;
import lombok.Data;

@Data
public class VenueImageResponseDTO {

    private Long imageId;

    private String imagePath;

    private boolean isProfile;
}
