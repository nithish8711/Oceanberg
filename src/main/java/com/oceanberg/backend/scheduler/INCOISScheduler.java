package com.oceanberg.backend.scheduler;

import com.oceanberg.backend.service.INCOISService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class INCOISScheduler {

    private final INCOISService service;

    // Scheduled to run every 15 minutes
    @Scheduled(fixedRate = 15 * 60 * 1000)
    public void fetchFeeds() {
        log.info("Starting scheduled INCOIS data fetch...");

        try {
            service.fetchAllAlerts();  // fetch Cyclone, High Wave, Currents, Tsunami in bulk
        } catch (Exception e) {
            log.error("Error during INCOIS data fetch", e);
        }

        log.info("Scheduled INCOIS data fetch completed.");
    }
}
