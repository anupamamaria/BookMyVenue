package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.request.SlotRequestDTO;
import com.bookmyvenue.backend.dto.request.VenueRequestDTO;
import com.bookmyvenue.backend.dto.response.VenueBookingResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDashboardResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDetailsResponseDTO;
import com.bookmyvenue.backend.enums.VenueStatus;
import com.bookmyvenue.backend.service.VenueOwnerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class VenueOwnerController {

    private final VenueOwnerService venueOwnerService;

    @PostMapping("/venue")
    ResponseEntity<Long> addVenue(HttpServletRequest request,
                                  @Valid @RequestBody VenueRequestDTO venueRequest) {

        Long ownerId = (Long) request.getAttribute("userId");
        Long venueId = venueOwnerService.addVenue(ownerId, venueRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(venueId);
    }

    @PostMapping("/venue/{venueId}/slot")
    ResponseEntity<String> addSlot(HttpServletRequest request,
                                   @PathVariable Long venueId,
                                   @RequestParam(defaultValue = "false") boolean dryRun,
                                   @Valid @RequestBody SlotRequestDTO slotRequest) {
        long ownerId = (Long) request.getAttribute("userId");
        String warning = venueOwnerService.addSlot(ownerId, venueId, dryRun, slotRequest);
        if(warning != null){
            return ResponseEntity.ok("WARNING "+ warning);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Slot Creation Successful");
    }

    @PutMapping("/venue/{venueId}/slot/{slotId}")
    ResponseEntity<String> editSlot(HttpServletRequest request,
                                   @PathVariable Long venueId,
                                    @PathVariable Long slotId,
                                   @RequestParam(defaultValue = "false") boolean dryRun,
                                   @Valid @RequestBody SlotRequestDTO slotRequest) {
        long ownerId = (Long) request.getAttribute("userId");
        String warning = venueOwnerService.editSlot(ownerId, venueId, slotId, dryRun, slotRequest);
        if(warning != null){
            return ResponseEntity.ok("WARNING "+ warning);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Slot Update Successful");
    }

    @PostMapping("/venue/{venueId}/images")
    public ResponseEntity<String> uploadImages(
            HttpServletRequest request,
            @PathVariable Long venueId,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("profileIndex") int profileIndex) {
        System.out.println("UPLOAD IMAGES CONTROLLER HIT");
        System.out.println("Venue ID: " + venueId);
        System.out.println("Image count: " + images.size());
        Long ownerId = (Long) request.getAttribute("userId");
        try{
            venueOwnerService.uploadVenueImage(ownerId, venueId, images, profileIndex);
            System.out.println("UPLOAD COMPLETED");
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Venue Images Upload successful");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/venue/dashboard")
    public ResponseEntity<Page<VenueDashboardResponseDTO>> getVenueDashboard(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false)VenueStatus venueStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10")int size,
            HttpServletRequest request
            ) {
        Long ownerId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(venueOwnerService.getVenueDashboard(ownerId,location,type,
        venueStatus, page, size));
    }

    @GetMapping("/venue/details/{venueId}")
    public ResponseEntity<VenueDetailsResponseDTO> getVenueDetails(
            @PathVariable Long venueId,
            HttpServletRequest request
    ) {
        Long ownerId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(venueOwnerService.getVenueDetails(ownerId, venueId));

    }

    @GetMapping("/venue/{venueId}/past-bookings")
    public ResponseEntity<Page<VenueBookingResponseDTO>> getPastBookings(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10")int size,
            HttpServletRequest request
    ) {
        Long ownerId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(venueOwnerService.getPastBookings(ownerId, venueId, page, size));

    }

    @GetMapping("/venue/{venueId}/upcoming-bookings")
    public ResponseEntity<Page<VenueBookingResponseDTO>> getUpcomingBookings(
            @PathVariable Long venueId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10")int size,
            HttpServletRequest request
    ) {
        Long ownerId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(venueOwnerService.getUpcomingBookings(ownerId, venueId, page, size));

    }

}
