package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.request.LoginRequestDTO;
import com.bookmyvenue.backend.dto.request.SignUpRequestDTO;
import com.bookmyvenue.backend.dto.response.LoginResponseDTO;
import com.bookmyvenue.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignUpRequestDTO request)
    {
        authService.addUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("user Registration Successful");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request)
    {
       LoginResponseDTO response = authService.login(request);
       return ResponseEntity.ok(response);
    }
}
