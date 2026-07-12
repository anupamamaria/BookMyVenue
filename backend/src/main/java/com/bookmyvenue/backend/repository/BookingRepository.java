package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.Booking;
import com.bookmyvenue.backend.enums.BookingStatus;
import com.bookmyvenue.backend.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking,Long> {
    @Query("SELECT b FROM Booking b " +
            "WHERE b.slot.slotId = :slotId " +
            "AND b.venue.venueId = :venueId " +
            "AND b.startDateTime < :searchEnd " +
            "AND b.endDateTime > :searchStart " +
            "AND b.bookingStatus IN (" +
            "BookingStatus.RESERVED, " +
            "BookingStatus.CONFIRMED)")
    List<Booking> findBookingsForSlot(
            @Param("slotId") Long slotId,
            @Param("venueId") Long venueId,
            @Param("searchStart") LocalDateTime searchStart,
            @Param("searchEnd") LocalDateTime searchEnd
    );

    @Query("SELECT b FROM Booking b " +
            "WHERE b.slot.slotId = :slotId " +
            "AND b.venue.venueId = :venueId " +
            "AND b.bookingStatus IN (" +
            "BookingStatus.RESERVED, " +
            "BookingStatus.CONFIRMED, " +
            "BookingStatus.CANCELLED)")
    List<Booking> findAllBookingsForSlot(
            @Param("slotId") Long slotId,
            @Param("venueId") Long venueId
    );

    @Query("""
    SELECT b
    FROM Booking b
    WHERE b.slot.slotId = :slotId
    AND b.venue.venueId = :venueId
    AND b.bookingStatus IN (
        BookingStatus.RESERVED,
        BookingStatus.CONFIRMED
    )
    ORDER BY b.startDateTime
    """)
    List<Booking> findActiveBookings(
            @Param("slotId") Long slotId,
            @Param("venueId") Long venueId
    );

    List<Booking> findByUserUserIdOrderByStartDateTimeDesc(Long userId);

    Optional<Booking> findFirstByUserUserIdAndBookingStatusInAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
            Long userId,
            List<BookingStatus> bookingStatuses,
            LocalDateTime now
    );

    Page<Booking> findByVenueVenueIdAndBookingStatusInAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
            Long venueId,
            List<BookingStatus> bookingStatuses,
            LocalDateTime now,
            Pageable pageable
    );

    Page<Booking> findByVenueVenueIdAndBookingStatusAndEndDateTimeLessThanOrderByEndDateTimeDesc(
            Long venueId,
            BookingStatus bookingStatus,
            LocalDateTime now,
            Pageable pageable
    );

    boolean existsBySlotSlotId(Long slotId);

    List<Booking> findByBookingStatusAndPaymentStatusAndCreatedAtLessThanEqual(
            BookingStatus bookingStatus,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt
    );
}
