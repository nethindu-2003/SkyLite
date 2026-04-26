package com.skylite.show_theater_service.repository;

import com.skylite.show_theater_service.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Integer> {
    List<Show> findByMovieId(Integer movieId);
    List<Show> findByShowDateOrderByStartTimeAsc(LocalDate showDate);
}