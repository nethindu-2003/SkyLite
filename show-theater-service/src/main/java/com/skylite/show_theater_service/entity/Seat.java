package com.skylite.show_theater_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seat_id")
    private Integer seatId;

    @Column(name = "row_label", nullable = false, length = 2)
    private String rowLabel; // e.g., "A", "B"

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber; // e.g., 1, 2, 3

    // "VIP" or "Normal"
    @Column(name = "seat_type", columnDefinition = "ENUM('VIP', 'Normal') DEFAULT 'Normal'")
    private String seatType = "Normal";
}