package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.service.OceanAlertQueryService;
import com.oceanberg.backend.service.SocialMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class AlertSearchController {

    private final OceanAlertQueryService queryService;
    private final SocialMediaService socialMediaService;

    // 🔹 Normal query (DB only)
    @GetMapping
    public List<OceanAlert> search(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String severity
    ) {
        return queryService.searchAlerts(type, location, startDate, endDate, severity);
    }

    // 🔹 Query + Social Media results
    @GetMapping("/social")
    public List<String> searchWithSocialMedia(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String severity
    ) {
        List<OceanAlert> alerts = queryService.searchAlerts(type, location, startDate, endDate, severity);
        return socialMediaService.searchOnSocialMedia(alerts);
    }

    // 🔹 New endpoint for high severity alerts
    @GetMapping("/high-severity")
    public List<OceanAlert> getHighSeverityAlerts() {
        return queryService.searchHighSeverityAlerts();
    }
}