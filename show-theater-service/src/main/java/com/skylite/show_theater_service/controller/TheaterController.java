package com.skylite.show_theater_service.controller;

import com.skylite.show_theater_service.dto.SeatRequest;
import com.skylite.show_theater_service.dto.ShowRequest;
import com.skylite.show_theater_service.entity.Seat;
import com.skylite.show_theater_service.entity.Show;
import com.skylite.show_theater_service.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/theater")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TheaterController {

    private final TheaterService theaterService;

    // --- PUBLIC ENDPOINTS ---

    @GetMapping("/seats")
    public ResponseEntity<List<Seat>> getSeatLayout() {
        return ResponseEntity.ok(theaterService.getTheaterLayout());
    }

    @GetMapping("/shows/date/{date}")
    public ResponseEntity<List<Show>> getShowsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(theaterService.getShowsByDate(date));
    }

    @GetMapping("/shows/movie/{movieId}")
    public ResponseEntity<List<Show>> getShowsByMovie(@PathVariable Integer movieId) {
        return ResponseEntity.ok(theaterService.getShowsByMovie(movieId));
    }

    // --- ADMIN ENDPOINTS ---

    @PostMapping("/shows")
    public ResponseEntity<Show> scheduleShow(@RequestBody ShowRequest request) {
        try {
            Show savedShow = theaterService.scheduleNewShow(request);
            return new ResponseEntity<>(savedShow, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/seats/layout")
    public ResponseEntity<List<Seat>> updateSeatLayout(@RequestBody List<SeatRequest> request) {
        // This endpoint should be secured via Spring Security to only allow ADMIN roles
        List<Seat> updatedLayout = theaterService.updateTheaterLayout(request);
        return ResponseEntity.ok(updatedLayout);
    }

    @DeleteMapping("/shows/{showId}")
    public ResponseEntity<Void> cancelShow(@PathVariable Integer showId) {
        theaterService.cancelShow(showId);
        return ResponseEntity.noContent().build();
    }
}