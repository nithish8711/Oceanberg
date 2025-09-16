package com.oceanberg.backend.service;

import com.oceanberg.backend.model.OceanAlert;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OceanAlertQueryService {

    private final MongoTemplate mongoTemplate;

    /**
     * Search high severity alerts for all hazard types (case-insensitive):
     * - Tsunami: Red
     * - Storm Surge: Red or Orange
     * - High Wave: Red or Orange
     * - Ocean Current: Red
     * - Swell Surge: Red or Orange
     */
    public List<OceanAlert> searchHighSeverityAlerts() {
        Query query = new Query();

        Criteria tsunamiCriteria = Criteria.where("type").regex("^tsunami$", "i")
                                          .and("color").regex("^red$", "i");

        Criteria stormSurgeCriteria = Criteria.where("type").regex("^storm surge$", "i")
                                             .and("color").in("red", "orange");

        Criteria highWaveCriteria = Criteria.where("type").regex("^high wave$", "i")
                                           .and("color").in("red", "orange");

        Criteria oceanCurrentCriteria = Criteria.where("type").regex("^ocean current$", "i")
                                              .and("color").regex("^red$", "i");

        Criteria swellSurgeCriteria = Criteria.where("type").regex("^swell surge$", "i")
                                             .and("color").in("red", "orange");

        query.addCriteria(new Criteria().orOperator(
                tsunamiCriteria,
                stormSurgeCriteria,
                highWaveCriteria,
                oceanCurrentCriteria,
                swellSurgeCriteria
        ));

        return mongoTemplate.find(query, OceanAlert.class);
    }

    /**
     * Search alerts with multiple optional filters (case-insensitive).
     */
    public List<OceanAlert> searchAlerts(
            String type,
            String districtOrState,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String color
    ) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        // Type filter
        if (type != null && !type.isEmpty()) {
            criteriaList.add(Criteria.where("type").regex("^" + type + "$", "i"));
        }

        // Color filter
        if (color != null && !color.isEmpty()) {
            criteriaList.add(Criteria.where("color").regex("^" + color + "$", "i"));
        }

        // District or State filter
        if (districtOrState != null && !districtOrState.isEmpty()) {
            criteriaList.add(new Criteria().orOperator(
                    Criteria.where("district").regex(districtOrState, "i"),
                    Criteria.where("state").regex(districtOrState, "i")
            ));
        }

        // Date filter
        if (startDate != null || endDate != null) {
            Criteria dateCriteria = new Criteria();
            if (startDate != null && endDate != null) {
                dateCriteria = Criteria.where("issueDate").gte(startDate).lte(endDate);
            } else if (startDate != null) {
                dateCriteria = Criteria.where("issueDate").gte(startDate);
            } else if (endDate != null) {
                dateCriteria = Criteria.where("issueDate").lte(endDate);
            }
            criteriaList.add(dateCriteria);
        }

        // Combine all criteria with AND
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, OceanAlert.class);
    }
}
