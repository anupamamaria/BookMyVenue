package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.dto.request.AdminReviewVenueRequestDTO;
import com.bookmyvenue.backend.dto.response.AdminDashboardResponseDTO;
import com.bookmyvenue.backend.dto.response.AdminVenueCountResponseDTO;
import com.bookmyvenue.backend.dto.response.VenueDashboardResponseDTO;
import com.bookmyvenue.backend.entity.User;
import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.enums.Role;
import com.bookmyvenue.backend.enums.VenueStatus;
import com.bookmyvenue.backend.exception.ForbiddenException;
import com.bookmyvenue.backend.exception.NotFoundException;
import com.bookmyvenue.backend.repository.UserRepository;
import com.bookmyvenue.backend.repository.VenueImageRepository;
import com.bookmyvenue.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final VenueImageRepository venueImageRepository;

    public void reviewVenue(Long userId, Long venueId, AdminReviewVenueRequestDTO request){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User Not Found"));
        if(user.getRole() != Role.ADMIN){
            throw new ForbiddenException("Only Admin is authorized to review venues");
        }
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new NotFoundException("Venue Not Found"));
        venue.setVenueStatus(request.getVenueStatus());
        venueRepository.save(venue);
    }

    public Page<AdminDashboardResponseDTO> getAdminDashboard(
            Long userId, String location, String type,
            VenueStatus venueStatus, int page, int size) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User Not Found"));

        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only Admin has access to this page");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<Venue> venues = venueRepository.findAllVenuesForAdmin( location, type,
                venueStatus, pageable);

        return venues.map(venue -> {
            AdminDashboardResponseDTO dto = new AdminDashboardResponseDTO();
            dto.setVenueId(venue.getVenueId());
            dto.setVenueOwnerName(venue.getOwner().getName());
            dto.setName(venue.getName());
            dto.setType(venue.getType());
            dto.setLocation(venue.getLocation());
            dto.setAddress(venue.getAddress());
            dto.setCapacity(venue.getCapacity());
            dto.setVenueStatus(venue.getVenueStatus());
            dto.setCreatedAt(venue.getCreatedAt());
            dto.setUpdatedAt(venue.getUpdatedAt());
            venueImageRepository.findByVenueVenueIdAndIsProfileTrue(venue.getVenueId())
                    .ifPresent(img -> dto.setImagePath(img.getImagePath()));
            return dto;
        });
    }

    public AdminVenueCountResponseDTO getVenueStatusCount(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User Not Found"));
        if( user.getRole() != Role.ADMIN){
            throw new ForbiddenException("Access restricted to Admin");
        }
        List<Object[]> results = venueRepository.countVenuesByStatus();

        long pending = 0;
        long approved = 0;
        long rejected = 0;

        for (Object[] row : results) {

            VenueStatus status = (VenueStatus) row[0];
            Long count = (Long) row[1];

            switch (status) {
                case PENDING -> pending = count;
                case APPROVED -> approved = count;
                case REJECTED -> rejected = count;
            }
        }

        return new AdminVenueCountResponseDTO(
                pending,
                approved,
                rejected
        );
    }
}
