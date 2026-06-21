package com.bookmyvenue.backend.dto.request;

import com.bookmyvenue.backend.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignUpRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    private String location;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10}$")
    private String mobile;

    @NotNull
    private Role role;

}
