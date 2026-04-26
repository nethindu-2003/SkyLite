package com.skylite.booking_service.controller;

import com.skylite.booking_service.dto.BookingRequest;
import com.skylite.booking_service.entity.Booking;
import com.skylite.booking_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // --- PUBLIC ENDPOINTS (Used during booking flow) ---

    // Get unavailable seats for the SeatLayout.jsx UI
    @GetMapping("/shows/{showId}/booked-seats")
    public ResponseEntity<List<Integer>> getBookedSeats(@PathVariable Integer showId) {
        return ResponseEntity.ok(bookingService.getBookedSeatsForShow(showId));
    }

    // Submit a new booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking savedBooking = bookingService.createBooking(request);
            return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Returns 409 Conflict if a seat was already taken
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    // --- USER ENDPOINTS (Secured for logged-in users) ---

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Integer userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @PutMapping("/{bookingId}/cancel/user/{userId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingId, @PathVariable Integer userId) {
        try {
            Booking cancelledBooking = bookingService.cancelBooking(bookingId, userId);
            return ResponseEntity.ok(cancelledBooking);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
}