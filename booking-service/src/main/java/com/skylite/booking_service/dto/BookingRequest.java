package com.skylite.booking_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class BookingRequest {
    private Integer userId;
    private Integer showId;
    private List<Integer> seatIds; // The list of seats the user selected
    private Double totalAmount;
}