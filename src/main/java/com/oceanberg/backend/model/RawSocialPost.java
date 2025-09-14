package com.oceanberg.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "raw_social_posts")
public class RawSocialPost {
    @Id
    private String id;

    private String platform;
    private String type;       // hazard type: Cyclone, Tsunami, Flood
    private String keyword;    // location or search keyword
    private String content;
    private Instant createdAt;
}
