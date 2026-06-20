package com.bookmyvenue.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VenueRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String type;

    @NotBlank
    private String address;

    @NotBlank
    private String location;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotNull
    private Boolean carParking;

    @NotNull
    private Boolean swimmingPool;

    @NotNull
    private Boolean outsideServicesAllowed;

    @NotNull
    private Boolean cateringProvided;

    private String additional;
}
