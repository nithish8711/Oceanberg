package com.oceanberg.backend.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ReportRequest {
    private String type;
    private String description;
    private double lon;
    private double lat;
    private Instant observedAt;
}
