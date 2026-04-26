package com.skylite.movie_catalog_service.repository;

import com.skylite.movie_catalog_service.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
    // Automatically generates a query to find movies where status = 'now_showing' or 'upcoming'
    List<Movie> findByStatus(String status);
}