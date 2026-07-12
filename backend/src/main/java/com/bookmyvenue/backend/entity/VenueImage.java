package com.bookmyvenue.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
public class VenueImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String imagePath;

    private boolean isProfile;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
