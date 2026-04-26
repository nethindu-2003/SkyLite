package com.skylite.show_theater_service.repository;

import com.skylite.show_theater_service.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {
    // Fetches the single-screen layout ordered perfectly
    List<Seat> findAllByOrderByRowLabelAscSeatNumberAsc();
}