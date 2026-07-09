package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.Venue;
import com.bookmyvenue.backend.enums.VenueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

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
//    @Query("SELECT v FROM Venue v " +
//            "WHERE v.venueStatus = VenueStatus.APPROVED " +
//            "AND (:location IS NULL OR LOWER(v.location) = LOWER(:location)) " +
//            "AND (:type IS NULL OR LOWER(v.type) = LOWER(:type)) " +
//            "AND (:name IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
//            "AND (:capacity IS NULL OR v.capacity >= :capacity) " +
//            "AND (:carParking IS NULL OR v.carParking = :carParking) " +
//            "AND (:swimmingPool IS NULL OR v.swimmingPool = :swimmingPool)")
//    List<Venue> findUserDashboardVenues(
//            @Param("location") String location,
//            @Param("type") String type,
//            @Param("name") String name,
//            @Param("capacity") Integer capacity,
//            @Param("carParking") Boolean carParking,
//            @Param("swimmingPool") Boolean swimmingPool
//    );

    @Query("SELECT v FROM Venue v " +
            "WHERE v.venueStatus = VenueStatus.APPROVED " +
            "AND (:location IS NULL OR LOWER(v.location) = LOWER(CAST(:location AS string))) " +
            "AND (:type IS NULL OR LOWER(v.type) = LOWER(CAST(:type AS string))) " +
            "AND (:name IS NULL OR LOWER(v.name) ILIKE LOWER(CONCAT('%', CAST(:name AS string), '%'))) " +
            "AND (:capacity IS NULL OR v.capacity >= :capacity) " +
            "AND (:carParking IS NULL OR v.carParking = :carParking) " +
            "AND (:swimmingPool IS NULL OR v.swimmingPool = :swimmingPool)")
    List<Venue> findUserDashboardVenues(
            @Param("location") String location,
            @Param("type") String type,
            @Param("name") String name,
            @Param("capacity") Integer capacity,
            @Param("carParking") Boolean carParking,
            @Param("swimmingPool") Boolean swimmingPool
    );

    List<Venue> findByVenueIdIn(Set<Long> venueIds);
    @Query("""
    SELECT v.location
    FROM Venue v
    WHERE v.venueStatus = VenueStatus.APPROVED
    GROUP BY v.location
    HAVING COUNT(v) >= 5
    ORDER BY v.location
    """)
    List<String> findLocations(Pageable pageable);

    List<Venue> findByLocationAndVenueStatusOrderByCreatedAtDesc(
            String location,
            VenueStatus venueStatus,
            Pageable pageable
    );

    @Query("SELECT v FROM Venue v WHERE (:location IS NULL OR v.location = :location) " +
            "AND (:type IS NULL OR v.type = :type) " +
            "AND (:venueStatus IS NULL OR v.venueStatus = :venueStatus)")
    Page<Venue> findAllVenuesForAdmin(
            @Param("location") String location,
            @Param("type") String type,
            @Param("venueStatus") VenueStatus venueStatus,
            Pageable pageable
    );

    @Query("""
SELECT v.venueStatus, COUNT(v)
FROM Venue v
GROUP BY v.venueStatus
""")
    List<Object[]> countVenuesByStatus();
    }

