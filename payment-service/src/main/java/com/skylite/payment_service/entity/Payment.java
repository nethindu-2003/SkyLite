package com.skylite.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @Column(name = "booking_id", unique = true, nullable = false)
    private Integer bookingId;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // e.g., "CREDIT_CARD", "PAYPAL"

    // "pending", "completed", "failed"
    @Column(name = "payment_status", columnDefinition = "ENUM('pending', 'completed', 'failed') DEFAULT 'pending'")
    private String paymentStatus = "pending";

    @CreationTimestamp
    @Column(name = "payment_date", updatable = false)
    private LocalDateTime paymentDate;
}