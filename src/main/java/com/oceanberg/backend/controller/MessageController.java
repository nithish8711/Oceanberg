package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.MessageRequest;
import com.oceanberg.backend.model.Message;
import com.oceanberg.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService service;

    @GetMapping
    public ResponseEntity<List<Message>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getById(@PathVariable String id) {
        Message msg = service.getById(id);
        return msg != null ? ResponseEntity.ok(msg) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Message> create(@RequestBody MessageRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PostMapping("/send")
    public ResponseEntity<Message> send(@RequestBody MessageRequest req) {
        // Same as create but matches /send route
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Message> update(@PathVariable String id, @RequestBody MessageRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }
}
