package com.oceanberg.backend.dto;

import lombok.*;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportRequest {
    private String type;
    private String description;
    private double lon;
    private double lat;
    private String district;
    private String state;
    private Instant observedAt;
    private String source;
}
