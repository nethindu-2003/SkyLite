package com.skylite.booking_service.repository;

import com.skylite.booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // Finds all bookings for a specific user (US-13: Booking History)
    List<Booking> findByUserIdOrderByBookingDateDesc(Integer userId);

    // CRITICAL: Fetches all confirmed seat IDs for a specific show
    @Query("SELECT bs.seatId FROM BookingSeat bs JOIN bs.booking b WHERE b.showId = :showId AND b.status = 'confirmed'")
    List<Integer> findConfirmedSeatsByShowId(@Param("showId") Integer showId);
}