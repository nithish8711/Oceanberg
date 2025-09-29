package com.oceanberg.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private String type;
    private String description;
    
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private Point location;
    
    @Indexed
    private String district;
    
    @Indexed
    private String state;
    
    private Instant observedAt;
    private Instant submittedAt;
    private List<String> mediaFileIds;
    private boolean verified;
    private boolean highlighted; // New field for admin highlighting
    
    @Indexed
    private String source; // "USER" or "ADMIN"
}