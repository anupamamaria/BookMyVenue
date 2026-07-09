package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.request.BookingRequestDTO;
import com.bookmyvenue.backend.dto.response.BookingResponseDTO;
import com.bookmyvenue.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/booking")
    public ResponseEntity<BookingResponseDTO> createBooking(
            HttpServletRequest request,
            @Valid @RequestBody BookingRequestDTO bookingRequest
            ){
        Long userId = (Long) request.getAttribute("userId");
        BookingResponseDTO response = bookingService.createBooking(userId, bookingRequest);
        return ResponseEntity.ok(response);

    }
}
