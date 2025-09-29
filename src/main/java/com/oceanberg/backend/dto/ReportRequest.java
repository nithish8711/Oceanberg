package com.oceanberg.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private String type;
    private String description;
    private Double lon;
    private Double lat;
    private String district;
    private String state;
    private Instant observedAt;
    private String source; // "USER" or "ADMIN"
    
    // Admin-only fields for updates
    private Boolean verified;
    private Boolean highlighted;
}