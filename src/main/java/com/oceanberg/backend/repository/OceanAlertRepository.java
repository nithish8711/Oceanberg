package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.OceanAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OceanAlertRepository extends MongoRepository<OceanAlert, String> {

    List<OceanAlert> findByLocation(String location);

    List<OceanAlert> findByType(String type);

    // Use LocalDateTime range to avoid duplicates on the same day
    Optional<OceanAlert> findByTypeAndLocationAndDateTimeBetween(
            String type,
            String location,
            LocalDateTime start,
            LocalDateTime end
    );

    // New method to delete all documents
    void deleteAll();
}
