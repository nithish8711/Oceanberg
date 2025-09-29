package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.SafeRouteRequest;
import com.oceanberg.backend.model.SafeRoute;
import com.oceanberg.backend.service.SafeRouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/safe-routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SafeRouteController {
    private final SafeRouteService service;

    @GetMapping
    public ResponseEntity<List<SafeRoute>> getAll() { return ResponseEntity.ok(service.getAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<SafeRoute> getById(@PathVariable String id) {
        SafeRoute route = service.getById(id);
        return route != null ? ResponseEntity.ok(route) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<SafeRoute> create(@RequestBody SafeRouteRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SafeRoute> update(@PathVariable String id, @RequestBody SafeRouteRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
