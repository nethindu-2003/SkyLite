package com.skylite.show_theater_service.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ShowRequest {
    private Integer movieId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
}