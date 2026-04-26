package com.skylite.booking_service.service;

import com.skylite.booking_service.dto.BookingRequest;
import com.skylite.booking_service.entity.Booking;
import com.skylite.booking_service.entity.BookingSeat;
import com.skylite.booking_service.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    // US-06: Check Booked Seats
    public List<Integer> getBookedSeatsForShow(Integer showId) {
        return bookingRepository.findConfirmedSeatsByShowId(showId);
    }

    // US-07: Book Tickets (With Concurrency Control)
    @Transactional
    public Booking createBooking(BookingRequest request) {

        // 1. Fetch currently booked seats for this show
        List<Integer> currentlyBookedSeats = bookingRepository.findConfirmedSeatsByShowId(request.getShowId());

        // 2. CONCURRENCY CHECK: Verify none of the requested seats are already taken
        for (Integer requestedSeatId : request.getSeatIds()) {
            if (currentlyBookedSeats.contains(requestedSeatId)) {
                throw new RuntimeException("Seat conflict! Seat ID " + requestedSeatId + " was just booked by someone else.");
            }
        }

        // 3. Create the Booking record
        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setShowId(request.getShowId());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setStatus("confirmed");

        // 4. Map the requested seat IDs to BookingSeat entities
        List<BookingSeat> bookingSeats = request.getSeatIds().stream()
                .map(seatId -> new BookingSeat(booking, seatId))
                .collect(Collectors.toList());

        booking.setBookedSeats(bookingSeats);

        // 5. Save to database (saves both booking and booking_seats due to CascadeType.ALL)
        return bookingRepository.save(booking);
    }

    // US-14: Cancel Booking
    @Transactional
    public Booking cancelBooking(Integer bookingId, Integer userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found."));

        // Security check: Ensure the user cancelling owns the booking
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to cancel this booking.");
        }

        booking.setStatus("cancelled");
        return bookingRepository.save(booking);
    }

    // US-13: Booking History for User
    public List<Booking> getUserBookings(Integer userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDesc(userId);
    }

    // US-22: Admin View All Bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}