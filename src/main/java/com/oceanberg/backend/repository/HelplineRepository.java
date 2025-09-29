package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.Helpline;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HelplineRepository extends MongoRepository<Helpline, String> { }
