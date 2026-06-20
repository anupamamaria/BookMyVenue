package com.bookmyvenue.backend.dto.response;

import com.bookmyvenue.backend.enums.Role;
import lombok.Data;

@Data
public class LoginResponseDTO {
    private String token;
    private String email;
    private String name;
    private String location;
    private Role role;
}
