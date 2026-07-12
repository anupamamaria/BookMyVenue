package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VenueImageRepository extends JpaRepository<VenueImage, Long> {

    Optional<VenueImage> findByVenueVenueIdAndIsProfileTrue(Long venueId);

    List<VenueImage> findByVenueVenueId(Long venueId);
}
