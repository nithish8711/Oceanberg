package com.oceanberg.backend.controller;

import com.oceanberg.backend.service.INCOISService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/incois")
@RequiredArgsConstructor
public class INCOISController {

    private final INCOISService incoisService;

    @GetMapping("/fetchAll")
    public String fetchAllAlerts() {
        incoisService.fetchAllAlerts();
        return "All INCOIS alerts fetched successfully";
    }

    @GetMapping("/tsunami")
    public String tsunamiAlerts() {
        incoisService.fetchTsunamiAlerts();
        return "Tsunami alerts fetched";
    }

    @GetMapping("/currents")
    public String oceanCurrents() {
        incoisService.fetchOceanCurrents();
        return "Ocean Currents alerts fetched";
    }

    @GetMapping("/highwave")
    public String highWave() {
        incoisService.fetchHighWaveAlerts();
        return "High Wave alerts fetched";
    }

    @GetMapping("/cyclone")
    public String cyclone() {
        incoisService.fetchCycloneTrack();
        return "Cyclone track fetched";
    }

    @DeleteMapping("/alerts")
    public String deleteAllAlerts() {
        incoisService.deleteAllAlerts();
        return "All ocean alert data has been deleted.";
    }

    @DeleteMapping("/alerts/{type}")
    public String deleteAlertsByType(@PathVariable String type) {
        incoisService.deleteAlertsByType(type);
        return "All alerts of type '" + type + "' have been deleted.";
    }
}
