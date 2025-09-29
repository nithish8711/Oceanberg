package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.HelplineRequest;
import com.oceanberg.backend.model.Helpline;
import com.oceanberg.backend.repository.HelplineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HelplineService {

    private final HelplineRepository repository;

    public List<Helpline> getAll() {
        log.info("Fetching all helplines");
        return repository.findAll();
    }

    public Helpline getById(String id) {
        log.info("Fetching helpline by id: {}", id);
        return repository.findById(id).orElse(null);
    }

    public Helpline create(HelplineRequest req) {
        Helpline hl = Helpline.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .description(req.getDescription())
                .highlighted(Optional.ofNullable(req.getHighlighted()).orElse(false))
                .build();
        log.info("Creating helpline: {}", hl);
        return repository.save(hl);
    }

    public Helpline update(String id, HelplineRequest req) {
        Helpline hl = repository.findById(id).orElseThrow(() -> new RuntimeException("Helpline not found"));
        if (req.getName() != null) hl.setName(req.getName());
        if (req.getPhone() != null) hl.setPhone(req.getPhone());
        if (req.getDescription() != null) hl.setDescription(req.getDescription());
        if (req.getHighlighted() != null) hl.setHighlighted(req.getHighlighted());
        log.info("Updating helpline: {}", hl);
        return repository.save(hl);
    }

    public void delete(String id) {
        log.info("Deleting helpline: {}", id);
        repository.deleteById(id);
    }
}
