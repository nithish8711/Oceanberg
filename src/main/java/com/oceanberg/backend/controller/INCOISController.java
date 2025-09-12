package com.oceanberg.backend.controller;

import com.oceanberg.backend.service.INCOISService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incois")
@RequiredArgsConstructor
public class INCOISController {

    private final INCOISService incoisService;

    @GetMapping("/tsunami")
    public String tsunamiAlerts() {
        incoisService.fetchTsunamiAlerts();
        return "Tsunami alerts fetched";
    }

    @GetMapping("/tide")
    public String tideAlerts() {
        incoisService.fetchTideStations();
        return "Tide stations fetched";
    }

    @GetMapping("/stormsurge")
    public String stormSurge() {
        incoisService.fetchStormSurgeAlerts();
        return "Storm surge alerts fetched for active cyclone";
    }

    // New endpoint for generating mock data
    @PostMapping("/mockdata")
    public String generateMockData() {
        incoisService.generateMockData();
        return "Mock data generated and saved to the database";
    }

    @DeleteMapping("/alerts")
    public String deleteAllAlerts() {
        incoisService.deleteAllAlerts();
        return "All ocean alert data has been deleted.";
    }
}