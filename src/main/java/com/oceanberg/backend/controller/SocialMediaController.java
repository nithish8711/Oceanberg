package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.DummyPost;
import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.service.SocialMediaCollectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/social")
@RequiredArgsConstructor
public class SocialMediaController {

    private final SocialMediaCollectorService collectorService;

    @PostMapping("/collect/{keyword}")
    public String collect(@PathVariable String keyword,
                        @RequestParam(required = false) String type) {
        collectorService.collectForKeywordWithType(keyword, Optional.empty(), type);
        return "Fetching recent posts for: " + keyword + 
            (type != null ? " with type: " + type : "");
    }


    @PostMapping("/collect/report")
    public String collectFromReport(@RequestBody Report report) {
        collectorService.collectFromReport(report);
        return "Started fetching live posts based on report ID: " + report.getId();
    }
    
    @PostMapping("/dummy/add")
    public DummyPost addDummy(@RequestBody DummyPost post) {
        return collectorService.insertDummyPost(post);
    }

   @PostMapping("/dummy/generate/{type}")
    public String generateDummy(@PathVariable String type) {
        collectorService.generateRegionalDummyPosts(type);
        return "Generated a batch of diverse dummy posts with type: " + type;
    }

}
