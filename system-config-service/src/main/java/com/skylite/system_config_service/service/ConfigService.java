package com.skylite.system_config_service.service;

import com.skylite.system_config_service.entity.CinemaConfig;
import com.skylite.system_config_service.repository.ConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private final ConfigRepository configRepository;

    // This runs automatically when the service starts to ensure a config row always exists
    @PostConstruct
    public void initDefaultConfig() {
        if (!configRepository.existsById(1)) {
            configRepository.save(new CinemaConfig());
        }
    }

    public CinemaConfig getConfig() {
        return configRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Configuration missing."));
    }

    public CinemaConfig updateConfig(CinemaConfig newConfig) {
        CinemaConfig existing = getConfig();
        existing.setCinemaName(newConfig.getCinemaName());
        existing.setCinemaAddress(newConfig.getCinemaAddress());
        existing.setContactEmail(newConfig.getContactEmail());
        existing.setContactPhone(newConfig.getContactPhone());
        existing.setBookingNormalPrice(newConfig.getBookingNormalPrice());
        existing.setBookingVipPrice(newConfig.getBookingVipPrice());
        existing.setGateNormalPrice(newConfig.getGateNormalPrice());
        existing.setGateVipPrice(newConfig.getGateVipPrice());

        return configRepository.save(existing);
    }
}