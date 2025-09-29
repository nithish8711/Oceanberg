package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.SosAlertRequest;
import com.oceanberg.backend.model.SosAlert;
import com.oceanberg.backend.repository.SosAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SosAlertService {

    private final SosAlertRepository repository;

    public List<SosAlert> getAll() {
        log.info("Fetching all SOS alerts");
        return repository.findAll();
    }

    public SosAlert getById(String id) {
        log.info("Fetching SOS alert by id: {}", id);
        return repository.findById(id).orElse(null);
    }

    public SosAlert create(SosAlertRequest req) {
        SosAlert alert = SosAlert.builder()
                .message(req.getMessage())
                .lat(req.getLat())
                .lng(req.getLng())
                .status(Optional.ofNullable(req.getStatus()).orElse("PENDING"))
                .timestamp(Optional.ofNullable(req.getTimestamp()).orElse(Instant.now()))
                .build();
        log.info("Creating SOS alert: {}", alert);
        return repository.save(alert);
    }

    public SosAlert update(String id, SosAlertRequest req) {
        SosAlert alert = repository.findById(id).orElseThrow(() -> new RuntimeException("SOS Alert not found"));
        if (req.getMessage() != null) alert.setMessage(req.getMessage());
        if (req.getLat() != null) alert.setLat(req.getLat());
        if (req.getLng() != null) alert.setLng(req.getLng());
        if (req.getStatus() != null) alert.setStatus(req.getStatus());
        if (req.getTimestamp() != null) alert.setTimestamp(req.getTimestamp());
        log.info("Updating SOS alert: {}", alert);
        return repository.save(alert);
    }

    public void delete(String id) {
        log.info("Deleting SOS alert: {}", id);
        repository.deleteById(id);
    }
}
