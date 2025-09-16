package com.oceanberg.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.repository.OceanAlertRepository;
import com.oceanberg.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class INCOISService {

    private final OceanAlertRepository repository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    // Feed URLs
    private static final String CYCLONE_FEED =
            "https://services.incois.gov.in/WEBSITE_FILES/surge/webgis/FENGAL/track_points.geojson";
    private static final String HIGH_WAVE_FEED =
            "https://sarat.incois.gov.in/incoismobileappdata/rest/incois/hwassalatestdata";
    private static final String CURRENT_FEED =
            "https://samudra.incois.gov.in/incoismobileappdata/rest/incois/currentslatestdata";
    private static final String TSUNAMI_FEED =
            "https://tsunami.incois.gov.in/itews/homexmls/LatestEvents.xml";

    // Coastal districts map for mock data
    private static final Map<String, String[]> COASTAL_LOCATIONS = Map.of(
            "Andhra Pradesh", new String[]{"Visakhapatnam", "Nellore", "Kakinada"},
            "Goa", new String[]{"North Goa", "South Goa"},
            "Gujarat", new String[]{"Porbandar", "Jamnagar", "Kutch"},
            "Karnataka", new String[]{"Mangalore", "Udupi", "Karwar"},
            "Kerala", new String[]{"Kochi", "Kozhikode", "Thiruvananthapuram"},
            "Maharashtra", new String[]{"Mumbai", "Raigad", "Ratnagiri"},
            "Odisha", new String[]{"Puri", "Balasore", "Ganjam"},
            "Puducherry", new String[]{"Puducherry"},
            "Tamil Nadu", new String[]{"Chennai", "Kanyakumari", "Ramanathapuram"},
            "West Bengal", new String[]{"Kolkata", "South 24 Parganas"}
    );

    //===================== MOCK DATA =====================//
    public void generateMockData() {
        log.info("Starting mock data generation.");
        List<OceanAlert> alerts = new ArrayList<>();

        int numTsunamis = random.nextInt(3) + 1;
        int numStorms = random.nextInt(2) + 1;

        for (int i = 0; i < numTsunamis; i++) alerts.add(createMockTsunami());
        for (int i = 0; i < numStorms; i++) alerts.add(createMockStormSurge());

        // Filter duplicates
        List<OceanAlert> alertsToSave = alerts.stream()
                .filter(alert -> !isDuplicateAlert(alert))
                .toList();

        if (!alertsToSave.isEmpty()) {
            repository.saveAll(alertsToSave);
            log.info("Generated {} new mock alerts.", alertsToSave.size());
        } else {
            log.info("No new mock alerts generated. All duplicates.");
        }
    }

    private OceanAlert createMockTsunami() {
        String[] states = COASTAL_LOCATIONS.keySet().toArray(new String[0]);
        String state = states[random.nextInt(states.length)];
        String[] districts = COASTAL_LOCATIONS.get(state);
        String district = districts[random.nextInt(districts.length)];

        double magnitude = 5.0 + random.nextDouble() * 3.0;
        String severity = (magnitude > 7.0) ? "High" : ((magnitude > 6.0) ? "Moderate" : "Low");

        return OceanAlert.builder()
                .type("Tsunami")
                .district(district.toUpperCase())
                .state(state.toUpperCase())
                .latitude(random.nextDouble() * 30)
                .longitude(random.nextDouble() * 30)
                .issueDate(LocalDateTime.now().minusHours(random.nextInt(12)))
                .color(severity.equals("High") ? "Red" : "Orange")
                .message("Mock Tsunami Advisory for " + district + ", " + state)
                .source("MOCK_INCOIS")
                .details(Map.of("magnitude", String.format("%.1f", magnitude)))
                .build();
    }

    private OceanAlert createMockStormSurge() {
        String[] states = COASTAL_LOCATIONS.keySet().toArray(new String[0]);
        String state = states[random.nextInt(states.length)];
        String[] districts = COASTAL_LOCATIONS.get(state);
        String district = districts[random.nextInt(districts.length)];

        double magnitude = 1.0 + random.nextDouble() * 3.0;
        String severity = magnitude > 2.5 ? "High" : "Moderate";

        return OceanAlert.builder()
                .type("Storm Surge")
                .district(district.toUpperCase())
                .state(state.toUpperCase())
                .latitude(random.nextDouble() * 30)
                .longitude(random.nextDouble() * 30)
                .issueDate(LocalDateTime.now().minusHours(random.nextInt(24)))
                .color(severity.equals("High") ? "Orange" : "Yellow")
                .message("Mock Storm Surge Advisory for " + district + ", " + state)
                .source("MOCK_INCOIS")
                .details(Map.of("surge_height", String.format("%.2f", magnitude)))
                .build();
    }

    //===================== FETCH METHODS =====================//
    public void fetchCycloneTrack() {
        fetchGeoJsonFeed(CYCLONE_FEED, "Cyclone", feature -> {
            JsonNode props = feature.path("properties");
            JsonNode coords = feature.path("geometry").path("coordinates");
            double lon = coords.get(0).asDouble();
            double lat = coords.get(1).asDouble();
            String[] districtState = GeoUtil.resolveDistrictState(lat, lon);
            OceanAlert alert = OceanAlert.builder()
                    .type("Cyclone")
                    .district(districtState[0])
                    .state(districtState[1])
                    .latitude(lat)
                    .longitude(lon)
                    .color("Orange")
                    .message(props.path("Category").asText("Cyclone"))
                    .source("INCOIS")
                    .issueDate(LocalDateTime.now())
                    .details(Map.of(
                            "status", props.path("Status").asText(),
                            "wind_speed", props.path("Wind_Speed").asText(),
                            "date_time", props.path("Date_Time").asText()
                    ))
                    .build();
            return alert;
        });
    }

    public void fetchHighWaveAlerts() {
        fetchJsonFeed(HIGH_WAVE_FEED, "High Wave", node -> {
            String message = node.path("Message").asText();
            String[] districtState = extractDistrictState(message);
            double[] latLon = GeoUtil.getCentroidForDistrict(districtState[0], districtState[1]);

            OceanAlert alert = OceanAlert.builder()
                    .type("High Wave")
                    .district(districtState[0])
                    .state(districtState[1])
                    .latitude(latLon[0])
                    .longitude(latLon[1])
                    .color(node.path("Color").asText())
                    .message(message)
                    .source("INCOIS")
                    .issueDate(LocalDateTime.now())
                    .details(Map.of(
                            "alert", node.path("Alert").asText(),
                            "issue_date", node.path("Issue Date").asText()
                    ))
                    .build();
            return alert;
        }, "HWAJson");
    }

    public void fetchOceanCurrents() {
        fetchJsonFeed(CURRENT_FEED, "Ocean Current", node -> {
            String message = node.path("Message").asText();
            String[] districtState = extractDistrictState(message);
            double[] latLon = GeoUtil.getCentroidForDistrict(districtState[0], districtState[1]);

            OceanAlert alert = OceanAlert.builder()
                    .type("Ocean Current")
                    .district(districtState[0])
                    .state(districtState[1])
                    .latitude(latLon[0])
                    .longitude(latLon[1])
                    .color(node.path("Color").asText())
                    .message(message)
                    .source("INCOIS")
                    .issueDate(LocalDateTime.now())
                    .details(Map.of(
                            "alert", node.path("Alert").asText(),
                            "issue_date", node.path("Issue Date").asText()
                    ))
                    .build();
            return alert;
        }, "CurrentsJson");
    }

    public void fetchTsunamiAlerts() {
        try {
            log.info("Fetching Tsunami Alerts...");
            String xml = webClient.get().uri(TSUNAMI_FEED).retrieve().bodyToMono(String.class).block();
            if (xml == null || xml.isBlank()) return;

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            org.w3c.dom.Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes()));
            doc.getDocumentElement().normalize();

            NodeList events = doc.getElementsByTagName("Event");
            List<OceanAlert> alerts = new ArrayList<>();

            for (int i = 0; i < events.getLength(); i++) {
                org.w3c.dom.Node node = events.item(i);
                if (node.getNodeType() != org.w3c.dom.Node.ELEMENT_NODE) continue;

                org.w3c.dom.Element elem = (org.w3c.dom.Element) node;

                String region = getTagTextContent(elem, "Region");
                String magnitude = getTagTextContent(elem, "Magnitude");
                String latitude = getTagTextContent(elem, "Latitude");
                String longitude = getTagTextContent(elem, "Longitude");
                String dateTime = getTagTextContent(elem, "DateTime");

                double lat = latitude.isBlank() ? 0 : Double.parseDouble(latitude);
                double lon = longitude.isBlank() ? 0 : Double.parseDouble(longitude);
                String[] districtState = GeoUtil.resolveDistrictState(lat, lon);

                OceanAlert alert = OceanAlert.builder()
                        .type("Tsunami")
                        .district(districtState[0])
                        .state(districtState[1])
                        .latitude(lat)
                        .longitude(lon)
                        .color("Red")
                        .message("Tsunami Event in " + region)
                        .source("INCOIS")
                        .issueDate(LocalDateTime.now())
                        .details(Map.of(
                                "region", region,
                                "magnitude", magnitude,
                                "event_time", dateTime
                        ))
                        .build();

                alerts.add(alert);
            }

            // Filter duplicates
            List<OceanAlert> alertsToSave = alerts.stream()
                    .filter(alert -> !isDuplicateAlert(alert))
                    .toList();

            if (!alertsToSave.isEmpty()) repository.saveAll(alertsToSave);
            log.info("Tsunami alerts parsed and saved: {}", alertsToSave.size());

        } catch (Exception e) {
            log.error("Tsunami fetch failed", e);
        }
    }

    //===================== MASTER FETCH =====================//
    public void fetchAllAlerts() {
        fetchCycloneTrack();
        fetchHighWaveAlerts();
        fetchOceanCurrents();
        fetchTsunamiAlerts();
    }

    //===================== DUPLICATE CHECK =====================//
    private boolean isDuplicateAlert(OceanAlert alert) {
        LocalDateTime start = alert.getIssueDate().minusHours(1);
        LocalDateTime end = alert.getIssueDate().plusHours(1);

        return repository.findByTypeAndDistrictAndStateAndIssueDateBetweenAndColor(
                alert.getType(),
                alert.getDistrict(),
                alert.getState(),
                start,
                end,
                alert.getColor()
        ).isPresent();
    }

    //===================== HELPER METHODS =====================//
    private interface AlertBuilder<T> {
        OceanAlert build(T node) throws Exception;
    }

    private void fetchGeoJsonFeed(String url, String type, AlertBuilder<JsonNode> builder) {
        try {
            log.info("Fetching {} feed...", type);
            String json = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
            if (json == null) return;

            JsonNode features = objectMapper.readTree(json).path("features");
            List<OceanAlert> alerts = new ArrayList<>();

            for (JsonNode feature : features) {
                OceanAlert alert = builder.build(feature);
                if (!isDuplicateAlert(alert)) alerts.add(alert);
            }

            if (!alerts.isEmpty()) repository.saveAll(alerts);

        } catch (Exception e) {
            log.error("{} feed fetch failed", type, e);
        }
    }

    private void fetchJsonFeed(String url, String type, AlertBuilder<JsonNode> builder, String dataField) {
        try {
            log.info("Fetching {} feed...", type);
            String json = webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
            if (json == null) return;

            JsonNode root = objectMapper.readTree(json);
            JsonNode alertsNode = objectMapper.readTree(root.path(dataField).asText());
            List<OceanAlert> alerts = new ArrayList<>();

            for (JsonNode node : alertsNode) {
                OceanAlert alert = builder.build(node);
                if (!isDuplicateAlert(alert)) alerts.add(alert);
            }

            if (!alerts.isEmpty()) repository.saveAll(alerts);

        } catch (Exception e) {
            log.error("{} feed fetch failed", type, e);
        }
    }

    private String[] extractDistrictState(String message) {
        if (message == null || message.isBlank()) return new String[]{"UNKNOWN", "UNKNOWN"};
        String searchText = "for the coast of ";
        int startIndex = message.toLowerCase().indexOf(searchText);
        if (startIndex != -1) {
            int endIndex = message.toLowerCase().indexOf("from", startIndex);
            String districtStateStr;
            if (endIndex != -1) districtStateStr = message.substring(startIndex + searchText.length(), endIndex).trim();
            else districtStateStr = message.substring(startIndex + searchText.length()).trim();
            String[] parts = districtStateStr.split(",");
            if (parts.length == 2) return new String[]{parts[0].trim().toUpperCase(), parts[1].trim().toUpperCase()};
        }
        return new String[]{"UNKNOWN", "UNKNOWN"};
    }

    private String getTagTextContent(org.w3c.dom.Element elem, String tagName) {
        NodeList list = elem.getElementsByTagName(tagName);
        if (list.getLength() == 0 || list.item(0) == null || list.item(0).getTextContent() == null) return "";
        return list.item(0).getTextContent().trim();
    }

    //===================== DELETE METHODS =====================//
    public void deleteAlertsByType(String type) {
        log.info("Deleting all alerts of type: {}", type);
        repository.deleteByType(type);
        log.info("All alerts of type {} have been deleted.", type);
    }

    public void deleteAllAlerts() {
        log.info("Deleting all ocean alerts from the database...");
        repository.deleteAll();
        log.info("All ocean alerts have been deleted.");
    }
}
