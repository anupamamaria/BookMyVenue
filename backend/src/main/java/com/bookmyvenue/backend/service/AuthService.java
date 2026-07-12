package com.bookmyvenue.backend.service;
import java.util.Date;


import com.bookmyvenue.backend.dto.request.LoginRequestDTO;
import com.bookmyvenue.backend.dto.request.SignUpRequestDTO;
import com.bookmyvenue.backend.dto.response.LoginResponseDTO;
import com.bookmyvenue.backend.entity.User;
import com.bookmyvenue.backend.exception.BadRequestException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void addUser(SignUpRequestDTO request){
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLocation(request.getLocation());
        user.setMobile(request.getMobile());
        user.setRole(request.getRole());

        userRepository.save(user);
    }
    public LoginResponseDTO login(LoginRequestDTO request) {
      User user = userRepository.findByEmail(request.getEmail())
              .orElseThrow(() -> new NotFoundException("User not found"));
      if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
          throw new BadRequestException("Invalid Password");
      }
      LoginResponseDTO response = new LoginResponseDTO();
      response.setToken(generateToken(user));
      response.setName(user.getName());
      response.setEmail(user.getEmail());
      response.setLocation(user.getLocation());
      response.setRole(user.getRole());
      return response;
    }

    public String generateToken(User user){
        return Jwts.builder()
                .claim("userId", user.getUserId())
                .claim("role",user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getSecretKey())
                .compact();
    }

    @Value("${jwt.secret}")
    private String jwtSecret;

    private SecretKey getSecretKey(){
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
}
