package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.SafeRoute;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SafeRouteRepository extends MongoRepository<SafeRoute, String> { }
