package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.HelplineRequest;
import com.oceanberg.backend.model.Helpline;
import com.oceanberg.backend.service.HelplineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/helplines")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class HelplineController {

    private final HelplineService service;

    @GetMapping
    public ResponseEntity<List<Helpline>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Helpline> getById(@PathVariable String id) {
        Helpline hl = service.getById(id);
        return hl != null ? ResponseEntity.ok(hl) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Helpline> create(@RequestBody HelplineRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Helpline> update(@PathVariable String id, @RequestBody HelplineRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
