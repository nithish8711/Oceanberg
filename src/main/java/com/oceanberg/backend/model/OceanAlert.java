package com.oceanberg.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "ocean_alerts")
public class OceanAlert {

    @Id
    private String id;

    private String type;        // Tsunami / Storm Surge / Tide Gauge
    private String location;    // e.g., Chennai, Tamil Nadu
    private LocalDateTime dateTime;
    private LocalDate date;
    private String severity;    // Low / Moderate / High
    private Double magnitude;   // Earthquake magnitude, surge height, tide level
    private String advisory;    // Text advisory
    private String source; 
}
