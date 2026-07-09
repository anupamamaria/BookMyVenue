package com.bookmyvenue.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminVenueCountResponseDTO {

    private Long pending;
    private Long approved;
    private Long rejected;
}
