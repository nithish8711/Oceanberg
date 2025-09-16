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

    /**
     * Search high severity alerts for all hazard types:
     * - Tsunami: Red
     * - Storm Surge: Red or Orange
     * - High Wave: Red or Orange
     * - Ocean Current: Red
     * - Swell Surge: Red or Orange
     */
    public List<OceanAlert> searchHighSeverityAlerts() {
        Query query = new Query();

        Criteria tsunamiCriteria = Criteria.where("type").is("Tsunami")
                                          .and("color").is("Red");

        Criteria stormSurgeCriteria = Criteria.where("type").is("Storm Surge")
                                             .and("color").in("Red", "Orange");

        Criteria highWaveCriteria = Criteria.where("type").is("High Wave")
                                           .and("color").in("Red", "Orange");

        Criteria oceanCurrentCriteria = Criteria.where("type").is("Ocean Current")
                                              .and("color").is("Red");

        Criteria swellSurgeCriteria = Criteria.where("type").is("Swell Surge")
                                             .and("color").in("Red", "Orange");

        query.addCriteria(new Criteria().orOperator(
                tsunamiCriteria,
                stormSurgeCriteria,
                highWaveCriteria,
                oceanCurrentCriteria,
                swellSurgeCriteria
        ));

        return mongoTemplate.find(query, OceanAlert.class);
    }

        public List<OceanAlert> searchAlerts(
            String type,
            String districtOrState,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String color
    ) {
        Query query = new Query();
        Criteria criteria = new Criteria();

        if (type != null && !type.isEmpty()) {
            criteria.and("type").is(type);
        }

        if (districtOrState != null && !districtOrState.isEmpty()) {
            criteria.orOperator(
                    Criteria.where("district").regex(districtOrState, "i"),
                    Criteria.where("state").regex(districtOrState, "i")
            );
        }

        if (startDate != null) {
            criteria.and("issueDate").gte(startDate);
        }
        if (endDate != null) {
            criteria.and("issueDate").lte(endDate);
        }

        if (color != null && !color.isEmpty()) {
            criteria.and("color").is(color);
        }

        query.addCriteria(criteria);
        return mongoTemplate.find(query, OceanAlert.class);
    }

}
