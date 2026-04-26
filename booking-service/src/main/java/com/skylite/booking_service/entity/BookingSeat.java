package com.skylite.booking_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "booking_seats")
@Data
@NoArgsConstructor
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnore // Prevents infinite recursion when returning JSON
    private Booking booking;

    @Column(name = "seat_id", nullable = false)
    private Integer seatId;

    public BookingSeat(Booking booking, Integer seatId) {
        this.booking = booking;
        this.seatId = seatId;
    }
}