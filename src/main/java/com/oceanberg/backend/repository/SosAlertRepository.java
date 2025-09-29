package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.SosAlert;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SosAlertRepository extends MongoRepository<SosAlert, String> { }
