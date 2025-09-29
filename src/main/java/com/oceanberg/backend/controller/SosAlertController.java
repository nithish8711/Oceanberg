package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.SosAlertRequest;
import com.oceanberg.backend.model.SosAlert;
import com.oceanberg.backend.service.SosAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SosAlertController {

    private final SosAlertService service;

    @GetMapping
    public ResponseEntity<List<SosAlert>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SosAlert> getById(@PathVariable String id) {
        SosAlert alert = service.getById(id);
        return alert != null ? ResponseEntity.ok(alert) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<SosAlert> create(@RequestBody SosAlertRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PostMapping("/submit")
    public ResponseEntity<SosAlert> submit(@RequestBody SosAlertRequest req) {
        // Same as create but matches /submit route
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SosAlert> update(@PathVariable String id, @RequestBody SosAlertRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
