package com.bookmyvenue.backend.scheduler;

import com.bookmyvenue.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingService bookingService;

    @Scheduled(fixedRate = 60000)
    public void expirePendingBookings() {
        bookingService.expirePendingBookings();
    }
}