package com.bookmyvenue.backend.dto.request;

import com.bookmyvenue.backend.enums.VenueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminReviewVenueRequestDTO {

    @NotNull
    private VenueStatus venueStatus;
}
