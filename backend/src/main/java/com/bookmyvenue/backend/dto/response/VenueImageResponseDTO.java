package com.bookmyvenue.backend.dto.response;
import com.bookmyvenue.backend.entity.VenueImage;
import lombok.Data;

@Data
public class VenueImageResponseDTO {

    public VenueImageResponseDTO(VenueImage venueImage){
        this.imageId = venueImage.getImageId();
        this.imagePath = venueImage.getImagePath();
        this.isProfile = venueImage.isProfile();
    }

    private Long imageId;

    private String imagePath;

    private boolean isProfile;
}
