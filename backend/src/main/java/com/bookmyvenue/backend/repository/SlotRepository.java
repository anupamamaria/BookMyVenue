package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.Slot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    // find ByVenueVenueId And StartDateTime Before And EndDateTime After
    @Query("""
SELECT s
FROM Slot s
WHERE s.venue.venueId = :venueId
AND s.slotStatus NOT IN (
    com.bookmyvenue.backend.enums.SlotStatus.BLOCKED,
    com.bookmyvenue.backend.enums.SlotStatus.DELETED
)
AND s.startDateTime < :endDateTime
AND s.endDateTime > :startDateTime
AND (:excludedSlotId IS NULL OR s.slotId <> :excludedSlotId)
""")
    List<Slot> findOverlappingSlots(
            @Param("venueId") Long venueId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime,
            @Param("excludedSlotId") Long excludedSlotId
    );

//    List<Slot> findByVenueVenueId(Long venueId);
@Query("""
SELECT s
FROM Slot s
WHERE s.venue.venueId = :venueId
AND s.slotStatus <> com.bookmyvenue.backend.enums.SlotStatus.DELETED
ORDER BY s.startDateTime
""")
List<Slot> findByVenueVenueId(Long venueId);

    @Query("""
SELECT s
FROM Slot s
WHERE s.venue.venueId = :venueId
AND s.slotStatus NOT IN (
    com.bookmyvenue.backend.enums.SlotStatus.BLOCKED,
    com.bookmyvenue.backend.enums.SlotStatus.DELETED
)
ORDER BY s.startDateTime
""")
    List<Slot> findActiveSlotsForValidation(Long venueId);

    @Query("""
SELECT s
FROM Slot s
WHERE s.venue.venueId = :venueId
AND s.slotStatus NOT IN (
    com.bookmyvenue.backend.enums.SlotStatus.BLOCKED,
    com.bookmyvenue.backend.enums.SlotStatus.DELETED
)
AND (:excludedSlotId IS NULL OR s.slotId <> :excludedSlotId)
""")
    List<Slot> findByVenueVenueIdExcludingSlot(
            @Param("venueId") Long venueId,
            @Param("excludedSlotId") Long excludedSlotId
    );

    @Query("SELECT s FROM Slot s " +
            "WHERE s.venue.venueId IN :venueIds " +
            "AND s.venue.venueStatus = VenueStatus.APPROVED " +
            "AND s.slotStatus = SlotStatus.AVAILABLE " +
            "AND s.startDateTime <= :searchEnd " +
            "AND s.endDateTime >= :searchStart")
    List<Slot> findByVenueVenueIdIn(
            @Param("venueIds") List<Long> venueIds,
            @Param("searchStart") LocalDateTime searchStart,
            @Param("searchEnd") LocalDateTime searchEnd
    );
//
//    @Query("SELECT s FROM Slot s " +
//            "WHERE s.venue.venueStatus = VenueStatus.APPROVED " +
//            "AND s.slotStatus = SlotStatus.AVAILABLE")
//    List<Slot> findSlotsForApprovedVenues();
@Query("SELECT s FROM Slot s " +
        "WHERE s.venue.venueId = :venueId " +
        "AND s.slotStatus IN (SlotStatus.AVAILABLE,SlotStatus.RESERVED,SlotStatus.BOOKED)" +
        "AND s.startDateTime <= :searchEnd " +
        "AND s.endDateTime >= :searchStart")
List<Slot> findVenueSlotsByDateRange(
        @Param("venueId") Long venueId,
        @Param("searchStart") LocalDateTime searchStart,
        @Param("searchEnd") LocalDateTime searchEnd
);

@Query("SELECT s FROM Slot s " +
        "WHERE s.venue.venueId = :venueId " +
        "AND s.slotStatus = SlotStatus.AVAILABLE " +
        "AND s.endDateTime >= :currentTime")
List<Slot> findFutureVenueSlots(
        @Param("venueId") Long venueId,
        @Param("currentTime") LocalDateTime currentTime
);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
SELECT s
FROM Slot s
WHERE s.slotId = :slotId
""")
    Optional<Slot> findBySlotIdForUpdate(Long slotId);

    Optional<Slot> findBySlotIdAndVenueVenueId(Long slotId, Long venueId);
}

