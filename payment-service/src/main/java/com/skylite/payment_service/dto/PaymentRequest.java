package com.skylite.payment_service.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Integer bookingId;
    private Double amount;
    private String paymentMethod;

    // Transient fields used only for mock processing, NEVER saved to DB
    private String cardNumber;
    private String expiryDate;
    private String cvv;
}