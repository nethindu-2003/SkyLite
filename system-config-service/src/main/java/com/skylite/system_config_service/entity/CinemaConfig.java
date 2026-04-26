package com.skylite.system_config_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_config")
@Data
public class CinemaConfig {

    @Id
    private Integer id = 1;

    @Column(name = "cinema_name")
    private String cinemaName = "Sky Lite 3D Cinema";

    @Column(name = "cinema_address")
    private String cinemaAddress = "Matara, Sri Lanka";

    @Column(name = "contact_email")
    private String contactEmail = "support@skylite.com";

    @Column(name = "contact_phone")
    private String contactPhone = "0712345678";

    @Column(name = "booking_normal_price")
    private Double bookingNormalPrice = 1000.00;

    @Column(name = "booking_vip_price")
    private Double bookingVipPrice = 1500.00;

    @Column(name = "gate_normal_price")
    private Double gateNormalPrice = 900.00;

    @Column(name = "gate_vip_price")
    private Double gateVipPrice = 1400.00;

    @Column(name = "updated_at")
    @org.hibernate.annotations.UpdateTimestamp
    private java.time.LocalDateTime updatedAt;
}