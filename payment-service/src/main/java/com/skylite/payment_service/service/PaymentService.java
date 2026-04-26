package com.skylite.payment_service.service;

import com.skylite.payment_service.dto.PaymentRequest;
import com.skylite.payment_service.entity.Payment;
import com.skylite.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public Payment processPayment(PaymentRequest request) {

        // 1. Check if payment already exists for this booking to prevent double-charging
        if (paymentRepository.findByBookingId(request.getBookingId()).isPresent()) {
            throw new RuntimeException("Payment has already been processed for this booking.");
        }

        // 2. Create the initial payment record
        Payment payment = new Payment();
        payment.setBookingId(request.getBookingId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus("pending");

        payment = paymentRepository.save(payment);

        // 3. MOCK PAYMENT GATEWAY LOGIC (Simulating Stripe/Bank API)
        boolean isSuccess = mockBankProcessing(request.getCardNumber(), request.getCvv());

        // 4. Update status based on mock gateway response
        if (isSuccess) {
            payment.setPaymentStatus("completed");
        } else {
            payment.setPaymentStatus("failed");
            paymentRepository.save(payment);
            throw new RuntimeException("Payment failed. Card declined by the bank.");
        }

        return paymentRepository.save(payment);
    }

    // A simple mock method: If the card starts with '4' (Visa) and has a CVV, it passes.
    private boolean mockBankProcessing(String cardNumber, String cvv) {
        // Simulate network delay to the bank
        try {
            Thread.sleep(1500); // 1.5 seconds delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (cardNumber == null || cvv == null || cardNumber.trim().isEmpty()) {
            return false;
        }

        // Let's say any card starting with '9' simulates a declined card for testing purposes
        if (cardNumber.startsWith("9")) {
            return false;
        }

        return true;
    }

    // US-26: Admin View Payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentByBookingId(Integer bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No payment found for this booking."));
    }
}