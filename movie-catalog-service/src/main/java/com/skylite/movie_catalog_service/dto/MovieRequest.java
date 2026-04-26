package com.skylite.movie_catalog_service.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MovieRequest {
    private String title;
    private String description;
    private String genre;
    private Integer duration;
    private String language;
    private LocalDate releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private String status;
}