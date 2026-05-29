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
        // 1. Fetch current layout
        List<Seat> currentSeats = seatRepository.findAll();

        // 2. Map current seats by a unique key (rowLabel + seatNumber)
        java.util.Map<String, Seat> currentSeatMap = currentSeats.stream()
                .collect(Collectors.toMap(
                        s -> s.getRowLabel() + "-" + s.getSeatNumber(),
                        s -> s
                ));

        List<Seat> updatedSeats = new java.util.ArrayList<>();

        // 3. Process new layout
        for (SeatRequest req : newLayout) {
            String key = req.getRowLabel() + "-" + req.getSeatNumber();
            Seat existingSeat = currentSeatMap.remove(key); // Remove from map as it's processed

            if (existingSeat != null) {
                // Update existing seat type (retains seatId)
                existingSeat.setSeatType(req.getSeatType());
                updatedSeats.add(existingSeat);
            } else {
                // Create new seat
                Seat newSeat = new Seat();
                newSeat.setRowLabel(req.getRowLabel());
                newSeat.setSeatNumber(req.getSeatNumber());
                newSeat.setSeatType(req.getSeatType());
                updatedSeats.add(newSeat);
            }
        }

        // 4. Any seats left in currentSeatMap are no longer in the layout, so delete them
        seatRepository.deleteAll(currentSeatMap.values());

        // 5. Save the updated layout
        return seatRepository.saveAll(updatedSeats);
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

    public List<Show> getAllShows() {
        return showRepository.findAll();
    }

    public Show getShowById(Integer showId) {
        return showRepository.findById(showId)
                .orElseThrow(() -> new RuntimeException("Show not found with id: " + showId));
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