package com.oceanberg.backend.repository;

import com.oceanberg.backend.model.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.Instant;
import java.util.List;

public interface ReportRepository extends MongoRepository<Report, String> {

    // ✅ All reports submitted by a specific user
    List<Report> findByUserId(String userId);

    // ✅ Filter by district
    List<Report> findByDistrictIgnoreCase(String district);

    // ✅ Filter by state
    List<Report> findByStateIgnoreCase(String state);

    // ✅ Filter by district + state
    List<Report> findByDistrictIgnoreCaseAndStateIgnoreCase(String district, String state);

    // ✅ Find reports observed after a given date
    List<Report> findByObservedAtAfter(Instant observedAt);

    // ✅ Custom search in type, description, district, state (case-insensitive, partial match)
    @Query("{ '$or': [ " +
            "{ 'type': { $regex: ?0, $options: 'i' } }, " +
            "{ 'description': { $regex: ?0, $options: 'i' } }, " +
            "{ 'district': { $regex: ?0, $options: 'i' } }, " +
            "{ 'state': { $regex: ?0, $options: 'i' } } " +
            "] }")
    List<Report> searchReports(String keyword);
}
