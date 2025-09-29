package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.MessageRequest;
import com.oceanberg.backend.model.Message;
import com.oceanberg.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageRepository repository;

    public List<Message> getAll() {
        log.info("Fetching all messages");
        return repository.findAll();
    }

    public Message getById(String id) {
        log.info("Fetching message by id: {}", id);
        return repository.findById(id).orElse(null);
    }

    public Message create(MessageRequest req) {
        Message msg = Message.builder()
                .sender(req.getSender())
                .text(req.getText())
                .timestamp(req.getTimestamp() != null ? req.getTimestamp() : Instant.now())
                .build();
        log.info("Creating message: {}", msg);
        return repository.save(msg);
    }

    public Message update(String id, MessageRequest req) {
        Message msg = repository.findById(id).orElseThrow(() -> new RuntimeException("Message not found"));
        if (req.getSender() != null) msg.setSender(req.getSender());
        if (req.getText() != null) msg.setText(req.getText());
        if (req.getTimestamp() != null) msg.setTimestamp(req.getTimestamp());
        log.info("Updating message: {}", msg);
        return repository.save(msg);
    }

    public void delete(String id) {
        log.info("Deleting message: {}", id);
        repository.deleteById(id);
    }
}
