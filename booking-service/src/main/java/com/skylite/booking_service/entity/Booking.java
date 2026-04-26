package com.skylite.booking_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Integer bookingId;

    // References to other microservices
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "show_id", nullable = false)
    private Integer showId;

    @CreationTimestamp
    @Column(name = "booking_date", updatable = false)
    private LocalDateTime bookingDate;

    @Column(name = "total_amount")
    private Double totalAmount;

    // "confirmed" or "cancelled"
    @Column(columnDefinition = "ENUM('confirmed', 'cancelled') DEFAULT 'confirmed'")
    private String status = "confirmed";

    // Cascade mapping for the seats
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingSeat> bookedSeats;
}