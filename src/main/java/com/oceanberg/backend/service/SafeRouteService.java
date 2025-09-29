package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.SafeRouteRequest;
import com.oceanberg.backend.model.SafeRoute;
import com.oceanberg.backend.repository.SafeRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SafeRouteService {
    private final SafeRouteRepository repository;

    public List<SafeRoute> getAll() { return repository.findAll(); }
    public SafeRoute getById(String id) { return repository.findById(id).orElse(null); }
    public SafeRoute create(SafeRouteRequest req) {
        SafeRoute route = SafeRoute.builder()
                .name(req.getName())
                .path(req.getPath())
                .safePlaceLat(req.getSafePlaceLat())
                .safePlaceLng(req.getSafePlaceLng())
                .safePlaceLabel(req.getSafePlaceLabel())
                .highlighted(Optional.ofNullable(req.getHighlighted()).orElse(false))
                .build();
        return repository.save(route);
    }
    public SafeRoute update(String id, SafeRouteRequest req) {
        SafeRoute route = repository.findById(id).orElseThrow();
        if (req.getName() != null) route.setName(req.getName());
        if (req.getPath() != null) route.setPath(req.getPath());
        if (req.getSafePlaceLat() != null) route.setSafePlaceLat(req.getSafePlaceLat());
        if (req.getSafePlaceLng() != null) route.setSafePlaceLng(req.getSafePlaceLng());
        if (req.getSafePlaceLabel() != null) route.setSafePlaceLabel(req.getSafePlaceLabel());
        if (req.getHighlighted() != null) route.setHighlighted(req.getHighlighted());
        return repository.save(route);
    }
    public void delete(String id) { repository.deleteById(id); }
}
