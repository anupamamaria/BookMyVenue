package com.bookmyvenue.backend.service;

import com.bookmyvenue.backend.config.RabbitMQConfig;
import com.bookmyvenue.backend.dto.request.BookingMessage;
import com.bookmyvenue.backend.dto.response.BookingResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RabbitMQService {

    private final RabbitTemplate rabbitTemplate;

    public BookingResponseDTO publishBooking(
            BookingMessage bookingMessage) {

        return (BookingResponseDTO) rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.BOOKING_QUEUE,
                bookingMessage
        );
    }
}
