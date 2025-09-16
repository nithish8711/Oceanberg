package com.oceanberg.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.geo.Point;

import java.time.Instant;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "reports")
public class Report {
    @Id
    private String id;
    private String userId;
    private String type; // high_wave, tsunami etc.
    private String description;
    private Point location; // lon/lat
    private String district; // New field
    private String state;    // New field
    private Instant observedAt;
    private Instant submittedAt;
    private List<String> mediaFileIds; // GridFS file ids
    private boolean verified;
    private String source; // e.g. "USER", "MOCK_REPORT"
}
