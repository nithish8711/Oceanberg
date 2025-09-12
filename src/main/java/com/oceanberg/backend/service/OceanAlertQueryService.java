package com.oceanberg.backend.service;

import com.oceanberg.backend.model.OceanAlert;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OceanAlertQueryService {

    private final MongoTemplate mongoTemplate;

    public List<OceanAlert> searchAlerts(
            String type,
            String location,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String severity
    ) {
        Query query = new Query();
        Criteria criteria = new Criteria();

        if (type != null && !type.isEmpty()) {
            criteria.and("type").is(type);
        }
        if (location != null && !location.isEmpty()) {
            criteria.and("location").regex(location, "i"); // case-insensitive
        }
        if (startDate != null && endDate != null) {
            criteria.and("dateTime").gte(startDate).lte(endDate);
        }
        if (severity != null && !severity.isEmpty()) {
            criteria.and("severity").is(severity);
        }

        query.addCriteria(criteria);
        return mongoTemplate.find(query, OceanAlert.class);
    }
    
    public List<OceanAlert> searchHighSeverityAlerts() {
        Query query = new Query();

        // Criteria for Tsunami alerts with high magnitude
        Criteria tsunamiCriteria = Criteria.where("type").is("Tsunami").and("magnitude").gte(7.0);

        // Criteria for Storm Surge alerts with high magnitude
        Criteria stormSurgeCriteria = Criteria.where("type").is("Storm Surge").and("magnitude").gte(2.5);

        // Combine the criteria using an OR operator
        query.addCriteria(new Criteria().orOperator(tsunamiCriteria, stormSurgeCriteria));

        return mongoTemplate.find(query, OceanAlert.class);
    }
}