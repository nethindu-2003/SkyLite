package com.skylite.movie_catalog_service.controller;

import com.skylite.movie_catalog_service.dto.MovieRequest;
import com.skylite.movie_catalog_service.entity.Movie;
import com.skylite.movie_catalog_service.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ==========================================
    // PUBLIC ENDPOINTS (For Users / React App)
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Movie>> getMoviesByStatus(@PathVariable String status) {
        // e.g., /api/movies/status/now_showing
        return ResponseEntity.ok(movieService.getMoviesByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Integer id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    // ==========================================
    // SECURED ENDPOINTS (For Admins Only)
    // ==========================================

    @PostMapping
    public ResponseEntity<Movie> addMovie(@RequestBody MovieRequest request) {
        Movie savedMovie = movieService.addMovie(request);
        return new ResponseEntity<>(savedMovie, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable Integer id, @RequestBody MovieRequest request) {
        Movie updatedMovie = movieService.updateMovie(id, request);
        return ResponseEntity.ok(updatedMovie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Integer id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}