package com.skylite.movie_catalog_service.service;

import com.skylite.movie_catalog_service.dto.MovieRequest;
import com.skylite.movie_catalog_service.entity.Movie;
import com.skylite.movie_catalog_service.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    // --- USER FEATURES ---

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public List<Movie> getMoviesByStatus(String status) {
        return movieRepository.findByStatus(status);
    }

    public Movie getMovieById(Integer id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + id));
    }

    // --- ADMIN FEATURES ---

    public Movie addMovie(MovieRequest request) {
        Movie movie = new Movie();
        mapRequestToEntity(request, movie);
        return movieRepository.save(movie);
    }

    public Movie updateMovie(Integer id, MovieRequest request) {
        Movie movie = getMovieById(id);
        mapRequestToEntity(request, movie);
        return movieRepository.save(movie);
    }

    public void deleteMovie(Integer id) {
        Movie movie = getMovieById(id);
        movieRepository.delete(movie);
    }

    // Helper method to map DTO to Entity
    private void mapRequestToEntity(MovieRequest request, Movie movie) {
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setGenre(request.getGenre());
        movie.setDuration(request.getDuration());
        movie.setLanguage(request.getLanguage());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setPosterUrl(request.getPosterUrl());
        movie.setTrailerUrl(request.getTrailerUrl());
        movie.setStatus(request.getStatus() != null ? request.getStatus() : "upcoming");
    }
}