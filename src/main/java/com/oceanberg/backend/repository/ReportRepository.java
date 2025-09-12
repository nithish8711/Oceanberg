package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {
    List<Report> findByUserId(String userId);
}
