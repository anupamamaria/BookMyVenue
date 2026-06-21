package com.bookmyvenue.backend.repository;

import com.bookmyvenue.backend.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByVenueVenueIdAndStartDateTimeBeforeAndEndDateTimeAfter(
            Long venueId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    List<Slot> findByVenueVenueId(Long venueId);
}
