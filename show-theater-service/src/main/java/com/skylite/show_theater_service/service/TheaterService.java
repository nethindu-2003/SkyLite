package com.skylite.show_theater_service.service;

import com.skylite.show_theater_service.dto.ShowRequest;
import com.skylite.show_theater_service.entity.Seat;
import com.skylite.show_theater_service.entity.Show;
import com.skylite.show_theater_service.repository.SeatRepository;
import com.skylite.show_theater_service.repository.ShowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.skylite.show_theater_service.dto.SeatRequest;
import java.util.stream.Collectors;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TheaterService {

    private final ShowRepository showRepository;
    private final SeatRepository seatRepository;

    // ==========================================
    // SEAT LAYOUT LOGIC (Single Screen)
    // ==========================================

    public List<Seat> getTheaterLayout() {
        return seatRepository.findAllByOrderByRowLabelAscSeatNumberAsc();
    }

    @Transactional
    public List<Seat> updateTheaterLayout(List<SeatRequest> newLayout) {
        // 1. Delete the old layout
        // Note: In a production system, you would check if future bookings exist before deleting!
        seatRepository.deleteAll();

        // 2. Map DTOs to Entities
        List<Seat> newSeats = newLayout.stream().map(req -> {
            Seat seat = new Seat();
            seat.setRowLabel(req.getRowLabel());
            seat.setSeatNumber(req.getSeatNumber());
            seat.setSeatType(req.getSeatType());
            return seat;
        }).collect(Collectors.toList());

        // 3. Save the new layout
        return seatRepository.saveAll(newSeats);
    }

    // ==========================================
    // SHOW SCHEDULING LOGIC
    // ==========================================

    public List<Show> getShowsByDate(LocalDate date) {
        return showRepository.findByShowDateOrderByStartTimeAsc(date);
    }

    public List<Show> getShowsByMovie(Integer movieId) {
        return showRepository.findByMovieId(movieId);
    }

    public Show scheduleNewShow(ShowRequest request) {
        // Basic overlapping check for our single screen
        List<Show> existingShows = showRepository.findByShowDateOrderByStartTimeAsc(request.getShowDate());

        for (Show existing : existingShows) {
            if (request.getStartTime().isBefore(existing.getEndTime()) &&
                    request.getEndTime().isAfter(existing.getStartTime())) {
                throw new RuntimeException("Time conflict! Another movie is playing on the single screen at this time.");
            }
        }

        Show show = new Show();
        show.setMovieId(request.getMovieId());
        show.setShowDate(request.getShowDate());
        show.setStartTime(request.getStartTime());
        show.setEndTime(request.getEndTime());
        show.setHallName("Main Screen"); // Hardcoded for single screen

        return showRepository.save(show);
    }

    public void cancelShow(Integer showId) {
        showRepository.deleteById(showId);
    }
}