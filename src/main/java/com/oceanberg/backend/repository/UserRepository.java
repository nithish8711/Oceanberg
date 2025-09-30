package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUserId(String userId);
    Optional<User> findByEmail(String email);
}
