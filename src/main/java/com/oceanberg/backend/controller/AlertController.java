package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.repository.OceanAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final OceanAlertRepository repository;

    @GetMapping
    public List<OceanAlert> getAllAlerts() {
        return repository.findAll();
    }

    @GetMapping("/type/{type}")
    public List<OceanAlert> getByType(@PathVariable String type) {
        return repository.findByType(type);
    }

    @GetMapping("/location/{location}")
    public List<OceanAlert> getByLocation(@PathVariable String location) {
        return repository.findByLocation(location);
    }
}
