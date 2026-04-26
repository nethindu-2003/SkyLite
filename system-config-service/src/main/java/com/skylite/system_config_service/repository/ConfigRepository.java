package com.skylite.system_config_service.repository;

import com.skylite.system_config_service.entity.CinemaConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigRepository extends JpaRepository<CinemaConfig, Integer> {
}