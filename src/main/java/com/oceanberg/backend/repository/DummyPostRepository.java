package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.DummyPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DummyPostRepository extends MongoRepository<DummyPost, String> {
    
    List<DummyPost> findByKeyword(String keyword);
    List<DummyPost> findByType(String type);
    List<DummyPost> findByTypeAndKeyword(String type, String keyword);
}
