package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> { }
