package com.oceanberg.backend.config;

import com.oceanberg.backend.service.INCOISService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerConfig {

    private final INCOISService incoisService;

    // Fetch every 30 mins
    @Scheduled(fixedRate = 1800000)
    public void fetchAlerts() {
        log.info("Starting scheduled INCOIS data fetch...");
        incoisService.fetchTsunamiAlerts();
        incoisService.fetchTideStations();
        incoisService.fetchStormSurgeAlerts();
        log.info("Scheduled INCOIS data fetch completed.");
    }
}