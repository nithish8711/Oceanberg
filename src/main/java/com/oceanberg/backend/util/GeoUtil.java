package com.oceanberg.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.locationtech.jts.geom.*;
import org.wololo.jts2geojson.GeoJSONReader;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class GeoUtil {

    private static final List<Region> regions = new ArrayList<>();
    private static final GeometryFactory geometryFactory = new GeometryFactory();
    private static boolean loaded = false;

    private static synchronized void loadDistrictPolygons() throws Exception {
        if (loaded) return;

        InputStream is = GeoUtil.class.getResourceAsStream("/INDIA_DISTRICTS.geojson");
        if (is == null) {
            throw new RuntimeException("GeoJSON file not found in resources: INDIA_DISTRICTS.geojson");
        }
        String geoJsonText = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(geoJsonText);
        JsonNode features = root.path("features");
        GeoJSONReader reader = new GeoJSONReader();

        for (JsonNode feature : features) {
            JsonNode props = feature.path("properties");

            // 🔍 Auto-detect district/state field names
            String district = extractProperty(props, "district", "DISTRICT", "dtname", "DIST_NAME");
            String state = extractProperty(props, "state", "STATE", "stname", "STATE_NAME");

            JsonNode geomNode = feature.path("geometry");
            Geometry geom = reader.read(geomNode.toString());

            regions.add(new Region(district, state, geom));
        }

        loaded = true;
        System.out.println("✅ Loaded " + regions.size() + " district polygons.");
    }

    private static String extractProperty(JsonNode props, String... keys) {
        for (String key : keys) {
            if (props.has(key)) {
                return props.get(key).asText();
            }
        }
        // fallback: print available keys for debugging
        Iterator<String> fieldNames = props.fieldNames();
        System.err.print("⚠️ Unknown properties, available keys: ");
        while (fieldNames.hasNext()) {
            System.err.print(fieldNames.next() + " ");
        }
        System.err.println();
        return "Unknown";
    }

    public static String[] resolveDistrictState(double lat, double lon) {
        try {
            loadDistrictPolygons();
        } catch (Exception e) {
            e.printStackTrace();
        }

        Point pt = geometryFactory.createPoint(new Coordinate(lon, lat));

        Region bestRegion = null;
        double bestDistance = Double.MAX_VALUE;

        for (Region r : regions) {
            double distance = r.geometry.distance(pt);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestRegion = r;
            }
        }

        // Apply cutoff: 500 km ≈ 4.5° (roughly)
        if (bestRegion != null) {
            if (bestDistance > 4.5) {
                return new String[]{"Offshore", "Offshore"};
            }
            return new String[]{bestRegion.district, bestRegion.state};
        }

        return new String[]{"Offshore", "Offshore"};
    }

    public static double[] getCentroidForDistrict(String district, String state) {
        try {
            loadDistrictPolygons();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Normalize inputs
        String normDistrict = district.trim().replaceAll("\\s+", " ").toUpperCase();
        String normState = state.trim().replaceAll("\\s+", " ").toUpperCase();

        for (Region r : regions) {
            if (r.district.trim().replaceAll("\\s+", " ").toUpperCase().equals(normDistrict)
                    && r.state.trim().replaceAll("\\s+", " ").toUpperCase().equals(normState)) {
                Coordinate c = r.geometry.getCentroid().getCoordinate();
                return new double[]{c.y, c.x};
            }
        }

        // ✅ fallback: try only by state centroid
        for (Region r : regions) {
            if (r.state.trim().replaceAll("\\s+", " ").toUpperCase().equals(normState)) {
                Coordinate c = r.geometry.getCentroid().getCoordinate();
                return new double[]{c.y, c.x};
            }
        }

        return new double[]{0.0, 0.0};
    }


    private static class Region {
        String district;
        String state;
        Geometry geometry;

        public Region(String district, String state, Geometry geometry) {
            this.district = district;
            this.state = state;
            this.geometry = geometry;
        }
    }
}
