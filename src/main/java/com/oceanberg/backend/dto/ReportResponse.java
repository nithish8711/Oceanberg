package com.oceanberg.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ReportResponse {
    private String id;
    private String userId;
    private String type;
    private String description;
    private double lon;
    private double lat;
    private Instant observedAt;
    private Instant submittedAt;
    private List<String> mediaFileIds;
    private boolean verified;
}
