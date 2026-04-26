package com.skylite.system_config_service.controller;

import com.skylite.system_config_service.entity.CinemaConfig;
import com.skylite.system_config_service.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ConfigService configService;

    // PUBLIC: React frontend calls this to display prices on the Seat Selection page
    @GetMapping
    public ResponseEntity<CinemaConfig> getConfiguration() {
        return ResponseEntity.ok(configService.getConfig());
    }

    // ADMIN ONLY: React admin panel calls this to update prices/info
    @PutMapping
    public ResponseEntity<CinemaConfig> updateConfiguration(@RequestBody CinemaConfig config) {
        return ResponseEntity.ok(configService.updateConfig(config));
    }
}