package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReportRepository extends MongoRepository<Report, String> {
    
}
