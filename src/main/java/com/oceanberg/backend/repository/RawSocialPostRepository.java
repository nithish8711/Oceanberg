package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.RawSocialPost;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RawSocialPostRepository extends MongoRepository<RawSocialPost, String> {
}
