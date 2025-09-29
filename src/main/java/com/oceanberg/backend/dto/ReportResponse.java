package com.oceanberg.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String userId;
    private String type;
    private String description;
    private Double lon;
    private Double lat;
    private String district;
    private String state;
    private Instant observedAt;
    private Instant submittedAt;
    private List<String> mediaFileIds;
    private List<MediaItem> media; // New field for frontend
    private boolean verified;
    private boolean highlighted; // New field for frontend
    private String source;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItem {
        private String type; // "image" or "video"
        private String url;  // URL to stream the media
    }
}