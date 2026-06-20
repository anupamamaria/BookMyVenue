package com.bookmyvenue.backend.entity;

import com.bookmyvenue.backend.enums.VenueStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"address", "location"}))
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long venueId;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner; // we can do venue.getOwner().getName()

    private String name;
    private String type;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String location;
    private int capacity; //use primitive if it isn't nullable
    private boolean carParking;
    private boolean swimmingPool;
    private boolean outsideServicesAllowed;
    private boolean cateringProvided;

    @Column(columnDefinition = "TEXT")
    private String additional;

    @Enumerated(EnumType.STRING)
    private VenueStatus venueStatus;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
