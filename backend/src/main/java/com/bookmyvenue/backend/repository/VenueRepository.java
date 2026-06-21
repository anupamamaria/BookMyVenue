package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.enums.VenueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VenueRepository extends JpaRepository<Venue, Long> {
    boolean existsByAddressAndLocation(String address, String Location);
    Page<Venue> findByOwnerUserId(Long ownerId, Pageable pageable);

    @Query("SELECT v FROM Venue v WHERE v.owner.userId = :ownerId " +
            "AND (:location IS NULL OR v.location = :location) " +
            "AND (:type IS NULL OR v.type = :type) " +
            "AND (:venueStatus IS NULL OR v.venueStatus = :venueStatus)")
    Page<Venue> findByOwnerWithFilters(
            @Param("ownerId") Long ownerId,
            @Param("location") String location,
            @Param("type") String type,
            @Param("venueStatus") VenueStatus venueStatus,
            Pageable pageable
    );
}
