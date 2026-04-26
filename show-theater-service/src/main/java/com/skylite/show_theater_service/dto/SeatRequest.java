package com.skylite.show_theater_service.dto;

import lombok.Data;

@Data
public class SeatRequest {
    private String rowLabel;
    private Integer seatNumber;
    private String seatType; // "Normal" or "VIP"
}