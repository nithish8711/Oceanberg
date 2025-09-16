package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.DummyPost;
import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.service.SocialMediaCollectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.Optional;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialMediaController {

    private final SocialMediaCollectorService collectorService;

    // Collect posts for a single keyword
    @PostMapping("/collect/{keyword}")
    public String collect(@PathVariable String keyword,
                          @RequestParam(required = false) String type) {
        collectorService.collectForKeywordWithType(keyword, Optional.empty(), type);
        return "Fetching recent posts for: " + keyword + 
            (type != null ? " with type: " + type : "");
    }

    // Collect posts from a report and return generated keywords
    @PostMapping("/collect/report")
    public Set<String> collectFromReport(@RequestBody Report report) {
        // Get filtered keywords
        Set<String> keywords = collectorService.getKeywordsFromReport(report);

        // Collect posts for each keyword
        keywords.forEach(keyword -> collectorService.collectForKeywordWithType(
                keyword, Optional.empty(), report.getType()));

        return keywords; // return keywords for frontend
    }

    // Collect posts from an OceanAlert and return generated keywords
    @PostMapping("/collect/ocean-alert")
    public Set<String> collectFromOceanAlert(@RequestBody OceanAlert alert) {
        // Get filtered keywords
        Set<String> keywords = collectorService.getKeywordsFromAlert(alert);

        // Collect posts for each keyword
        keywords.forEach(keyword -> collectorService.collectForKeywordWithType(
                keyword, Optional.empty(), alert.getType()));

        return keywords; // return keywords for frontend
    }

    // Add a dummy post
    @PostMapping("/dummy/add")
    public DummyPost addDummy(@RequestBody DummyPost post) {
        return collectorService.insertDummyPost(post);
    }

    // Generate dummy posts
    @PostMapping("/dummy/generate/{type}")
    public String generateDummy(@PathVariable String type) {
        collectorService.generateRegionalDummyPosts(type);
        return "Generated a batch of diverse dummy posts with type: " + type;
    }
}
