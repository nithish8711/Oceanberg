package com.oceanberg.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafeRouteRequest {
    private String name;
    private String path;
    private Double safePlaceLat;
    private Double safePlaceLng;
    private String safePlaceLabel;
    private Boolean highlighted;
}
