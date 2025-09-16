package com.oceanberg.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPolygon;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("district_polygons")
public class DistrictPolygonEntity {

    @Id
    private String id;

    private String district;
    private String state;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPolygon polygon;

    public DistrictPolygonEntity() {}

    public DistrictPolygonEntity(String district, String state, GeoJsonPolygon polygon) {
        this.district = district;
        this.state = state;
        this.polygon = polygon;
    }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public GeoJsonPolygon getPolygon() { return polygon; }
    public void setPolygon(GeoJsonPolygon polygon) { this.polygon = polygon; }
}
