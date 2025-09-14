package com.oceanberg.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.repository.OceanAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class INCOISService {

    private final OceanAlertRepository repository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Direct XML and GeoJSON feed URLs for data fetching
    private static final String TSUNAMI_FEED = "https://tsunami.incois.gov.in/itews/homexmls/LatestEvents.xml";
    private static final String TIDE_FEED = "https://tsunami.incois.gov.in/itews/homexmls/TideIntStations.xml";
    private static final String STORM_SURGE_FEED = "https://services.incois.gov.in/WEBSITE_FILES/surge/webgis/FENGAL/track_points.geojson";

    private static final String[] LOCATIONS = {"Chennai", "Kochi", "Mumbai", "Vishakhapatnam", "Goa", "Puducherry"};

    /**
     * Generates and stores random mock ocean alert data for testing purposes.
     */
    public void generateMockData() {
        log.info("Starting mock data generation.");
        int count = 0;
        
        // 1. Generate Tsunami events
        int numTsunamis = random.nextInt(3) + 1; // 1 to 3 events
        for (int i = 0; i < numTsunamis; i++) {
            repository.save(createMockTsunami());
            count++;
        }

        // 2. Generate Storm Surge events
        int numStorms = random.nextInt(2) + 1; // 1 to 2 events
        for (int i = 0; i < numStorms; i++) {
            repository.save(createMockStormSurge());
            count++;
        }

        // 3. Generate Tide Gauge events
        int numTides = random.nextInt(5) + 2; // 2 to 6 events
        for (int i = 0; i < numTides; i++) {
            repository.save(createMockTideGauge());
            count++;
        }
        log.info("Finished generating {} mock alerts.", count);
    }
    
    private OceanAlert createMockTsunami() {
        String location = LOCATIONS[random.nextInt(LOCATIONS.length)];
        double magnitude = 5.0 + random.nextDouble() * 3.0; // Magnitude between 5.0 and 8.0
        String severity = magnitude > 7.0 ? "High" : (magnitude > 6.0 ? "Moderate" : "Low");

        return OceanAlert.builder()
                .type("Tsunami")
                .location(location)
                .dateTime(LocalDateTime.now().minusHours(random.nextInt(12)))
                .date(LocalDate.now())
                .severity(severity)
                .magnitude(Double.parseDouble(String.format("%.1f", magnitude)))
                .advisory("Mock Tsunami Advisory for " + location)
                .source("MOCK_INCOIS") // 🔹 Set source to "MOCK_INCOIS"
                .build();
    }

    private OceanAlert createMockStormSurge() {
        String location = LOCATIONS[random.nextInt(LOCATIONS.length)];
        double magnitude = 1.0 + random.nextDouble() * 3.0; // Surge height between 1.0 and 4.0 meters
        String severity = magnitude > 2.5 ? "High" : "Moderate";

        return OceanAlert.builder()
                .type("Storm Surge")
                .location(location)
                .dateTime(LocalDateTime.now().minusHours(random.nextInt(24)))
                .date(LocalDate.now())
                .severity(severity)
                .magnitude(Double.parseDouble(String.format("%.2f", magnitude)))
                .advisory("Mock Storm Surge Advisory for " + location)
                .source("MOCK_INCOIS") // 🔹 Set source to "MOCK_INCOIS"
                .build();
    }

    private OceanAlert createMockTideGauge() {
        String location = LOCATIONS[random.nextInt(LOCATIONS.length)];
        double magnitude = random.nextDouble() * 10; // Tide level
        String severity = "Normal"; // Tide gauges typically report normal levels

        return OceanAlert.builder()
                .type("Tide Gauge")
                .location(location)
                .dateTime(LocalDateTime.now().minusMinutes(random.nextInt(60)))
                .date(LocalDate.now())
                .severity(severity)
                .magnitude(Double.parseDouble(String.format("%.2f", magnitude)))
                .advisory("Mock Tide Gauge Reading for " + location)
                .source("MOCK_INCOIS") // 🔹 Set source to "MOCK_INCOIS"
                .build();
    }
    
    /**
     * Fetches Tsunami Alerts from the INCOIS XML feed.
     */
    public void fetchTsunamiAlerts() {
        log.info("Fetching tsunami alerts from INCOIS...");
        try {
            String xml = webClient.get()
                    .uri(TSUNAMI_FEED)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (xml == null || xml.isBlank()) {
                log.info("No new tsunami alerts available.");
                return;
            }

            DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            org.w3c.dom.Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            NodeList nodes = doc.getElementsByTagName("Event");
            int savedCount = 0;

            for (int i = 0; i < nodes.getLength(); i++) {
                org.w3c.dom.Element e = (org.w3c.dom.Element) nodes.item(i);
                String location = getTagValue(e, "Region");
                Double magnitude = safeParseDouble(getTagValue(e, "Magnitude"));
                LocalDateTime alertTime = LocalDateTime.now();

                if (alertExists("Tsunami", location, alertTime.toLocalDate())) {
                    log.info("Alert for Tsunami at {} already exists. Skipping.", location);
                    continue;
                }

                OceanAlert alert = OceanAlert.builder()
                        .type("Tsunami")
                        .location(location)
                        .dateTime(alertTime)
                        .date(alertTime.toLocalDate())
                        .severity("High")
                        .magnitude(magnitude)
                        .advisory("Tsunami alert from INCOIS")
                        .source("INCOIS") // 🔹 Set source to "INCOIS" for real data
                        .build();

                repository.save(alert);
                savedCount++;
            }
            log.info("Successfully fetched and saved {} new tsunami alerts.", savedCount);
        } catch (Exception e) {
            log.error("Failed to fetch tsunami alerts.", e);
        }
    }

    /**
     * Fetches Tide Gauge Data from the INCOIS XML feed.
     */
    public void fetchTideStations() {
        log.info("Fetching tide station data from INCOIS...");
        try {
            String xml = webClient.get()
                    .uri(TIDE_FEED)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (xml == null || xml.isBlank()) {
                log.info("No new tide station data available.");
                return;
            }

            DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            org.w3c.dom.Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            NodeList nodes = doc.getElementsByTagName("Station");
            int savedCount = 0;

            for (int i = 0; i < nodes.getLength(); i++) {
                org.w3c.dom.Element e = (org.w3c.dom.Element) nodes.item(i);
                String name = getTagValue(e, "Name");
                String lat = getTagValue(e, "Latitude");
                String lon = getTagValue(e, "Longitude");
                Double magnitude = safeParseDouble(getTagValue(e, "SeaLevel"));
                String status = getTagValue(e, "Status");
                LocalDateTime alertTime = LocalDateTime.now();

                if (alertExists("Tide Gauge", name, alertTime.toLocalDate())) {
                    log.info("Alert for Tide Gauge at {} already exists. Skipping.", name);
                    continue;
                }

                OceanAlert alert = OceanAlert.builder()
                        .type("Tide Gauge")
                        .location(name + " (" + lat + "," + lon + ")")
                        .dateTime(alertTime)
                        .date(alertTime.toLocalDate())
                        .severity(status != null ? status : "Normal")
                        .magnitude(magnitude)
                        .advisory("Sea level observation from Tide Gauge")
                        .source("INCOIS") // 🔹 Set source to "INCOIS" for real data
                        .build();

                repository.save(alert);
                savedCount++;
            }
            log.info("Successfully fetched and saved {} new tide gauge readings.", savedCount);
        } catch (Exception e) {
            log.error("Failed to fetch tide stations.", e);
        }
    }

    /**
     * Fetches Storm Surge Data from the INCOIS GeoJSON feed.
     */
    public void fetchStormSurgeAlerts() {
        log.info("Fetching storm surge alerts from INCOIS...");
        try {
            String json = webClient.get()
                    .uri(STORM_SURGE_FEED)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (json == null || json.isBlank()) {
                log.info("No new storm surge alerts available.");
                return;
            }

            JsonNode rootNode = objectMapper.readTree(json);
            JsonNode features = rootNode.path("features");
            int savedCount = 0;

            if (features.isArray()) {
                for (JsonNode feature : features) {
                    JsonNode properties = feature.path("properties");
                    String location = properties.path("LOCATION").asText();
                    String advisory = properties.path("ADVISORY").asText();
                    Double surgeHeight = properties.path("SURGE_HEIGHT_M").asDouble(0.0);
                    LocalDateTime alertTime = LocalDateTime.now();

                    if (alertExists("Cyclone/Storm Surge", location, alertTime.toLocalDate())) {
                        log.info("Alert for Storm Surge at {} already exists. Skipping.", location);
                        continue;
                    }

                    OceanAlert alert = OceanAlert.builder()
                            .type("Cyclone/Storm Surge")
                            .location(location)
                            .dateTime(alertTime)
                            .date(alertTime.toLocalDate())
                            .severity("High")
                            .magnitude(surgeHeight)
                            .advisory("Storm Surge Advisory: " + advisory)
                            .source("INCOIS") // 🔹 Set source to "INCOIS" for real data
                            .build();

                    repository.save(alert);
                    savedCount++;
                }
            }
            log.info("Successfully fetched and saved {} new storm surge alerts.", savedCount);
        } catch (Exception e) {
            log.error("Failed to fetch storm surge alerts.", e);
        }
    }

    /**
     * Helper Methods
     */
    private boolean alertExists(String type, String location, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        Optional<OceanAlert> existingAlert = repository
                .findByTypeAndLocationAndDateTimeBetween(type, location, startOfDay, endOfDay);
        return existingAlert.isPresent();
    }

    private String getTagValue(org.w3c.dom.Element element, String tag) {
        NodeList nodes = element.getElementsByTagName(tag);
        return nodes.getLength() > 0 ? nodes.item(0).getTextContent() : null;
    }

    private Double safeParseDouble(String val) {
        try {
            return (val != null && !val.isBlank()) ? Double.parseDouble(val) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void deleteAllAlerts(Optional<String> sourceFilter) {
        log.warn("Deleting ocean alerts. Filter: {}", sourceFilter.orElse("ALL"));
        if (sourceFilter.isPresent()) {
            repository.deleteAll(
                repository.findAll()
                        .stream()
                        .filter(alert -> sourceFilter.get().equalsIgnoreCase(alert.getSource()))
                        .toList()
            );
        } else {
            repository.deleteAll();
        }
    }
}