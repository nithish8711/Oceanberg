package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.repository.OceanAlertRepository;
import com.oceanberg.backend.service.OceanAlertQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final OceanAlertRepository repository;
    private final OceanAlertQueryService queryService;

    // ✅ Get all alerts
    @GetMapping
    public List<OceanAlert> getAllAlerts() {
        return repository.findAll();
    }

    // ✅ Get alerts by type
    @GetMapping("/type/{type}")
    public List<OceanAlert> getByType(@PathVariable String type) {
        return repository.findByType(type);
    }

    // Get alerts by district
    @GetMapping("/district/{district}")
    public List<OceanAlert> getByDistrict(@PathVariable String district) {
        return repository.findByDistrict(district);
    }

    // Get alerts by state
    @GetMapping("/state/{state}")
    public List<OceanAlert> getByState(@PathVariable String state) {
        return repository.findByState(state);
    }

    // ✅ Search with multiple query parameters
   @GetMapping("/search")
    public List<OceanAlert> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String districtOrState, // updated
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String color // updated
    ) {
        return queryService.searchAlerts(type, districtOrState, startDate, endDate, color);
    }


    // ✅ Get high severity alerts
    @GetMapping("/high-severity")
    public List<OceanAlert> getHighSeverityAlerts() {
        return queryService.searchHighSeverityAlerts();
    }
}