package com.bookmyvenue.backend.controller;

import com.bookmyvenue.backend.dto.request.AdminReviewVenueRequestDTO;
import com.bookmyvenue.backend.dto.response.AdminDashboardResponseDTO;
import com.bookmyvenue.backend.dto.response.AdminVenueCountResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDashboardResponseDTO;
import com.bookmyvenue.backend.enums.VenueStatus;
import com.bookmyvenue.backend.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("admin/dashboard")
    public ResponseEntity<Page<AdminDashboardResponseDTO>> getAdminDashboard(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) VenueStatus venueStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request
    ) {
        Long userId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(adminService.getAdminDashboard(userId,location,type,
                venueStatus, page, size));
    }

    @GetMapping("admin/venue-status-count")
    public ResponseEntity<AdminVenueCountResponseDTO> getVenueStatusCount(
            HttpServletRequest request
    ) {

        Long userId = (long) request.getAttribute("userId");
        return ResponseEntity.ok(
                adminService.getVenueStatusCount(userId)
        );
    }

    @PatchMapping("admin/venue/{venueId}/review")
    public ResponseEntity<String> reviewVenue(
            HttpServletRequest request,
            @PathVariable Long venueId,
            @Valid @RequestBody AdminReviewVenueRequestDTO adminReviewVenueRequest
            ){
        Long userId = (Long) request.getAttribute("userId");
        adminService.reviewVenue(userId, venueId, adminReviewVenueRequest);
        return ResponseEntity.ok("Venue status update by Admin successful");

    }
}
