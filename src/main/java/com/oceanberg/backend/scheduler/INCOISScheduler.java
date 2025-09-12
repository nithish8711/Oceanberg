package com.oceanberg.backend.scheduler;

import com.oceanberg.backend.service.INCOISService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class INCOISScheduler {

    private final INCOISService service;

    @Scheduled(fixedRate = 15 * 60 * 1000) // every 15 minutes
    public void fetchFeeds() {
        log.info("Starting scheduled INCOIS data fetch...");
        
        service.fetchTsunamiAlerts();
        service.fetchTideStations();
        service.fetchStormSurgeAlerts();
        log.info("Scheduled INCOIS data fetch completed.");
    }
}