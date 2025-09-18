package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.OceanAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OceanAlertRepository extends MongoRepository<OceanAlert, String> {

    List<OceanAlert> findByDistrict(String district);

    List<OceanAlert> findByState(String state);

    List<OceanAlert> findByType(String type);

    // Optional: search by type + district + state + date range + color
    Optional<OceanAlert> findByTypeAndDistrictAndStateAndIssueDateBetweenAndColor(
            String type,
            String district,
            String state,
            LocalDateTime start,
            LocalDateTime end,
            String color
    );

    void deleteAll();

    void deleteByType(String type);
}
