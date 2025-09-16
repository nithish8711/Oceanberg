package com.oceanberg.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "ocean_alerts")
public class OceanAlert {

    @Id
    private String id;

    // Common fields
    private String type;            // Tsunami / High Wave / Ocean Current / Swell Surge / Storm Surge
    private String district;        // District/Region
    private String state;           // State/UT
    private String color;           // Yellow / Orange / Red
    private String message;         // Advisory text
    private String source;          // INCOIS / MOCK_INCOIS

    private LocalDateTime issueDate;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Geo fields
    private Double latitude;
    private Double longitude;

    // Flexible hazard-specific values
    private Map<String, String> details;
}
