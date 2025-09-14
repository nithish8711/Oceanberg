package com.oceanberg.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Component
public class RedditClient {

    @Value("${reddit.clientId}")
    private String clientId;

    public Map<String, Object> searchPosts(String keyword) {
        try {
            String url = "https://www.reddit.com/r/all/search.json?q=" + keyword;
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();

            // Reddit API requires User-Agent
            headers.set("User-Agent", "OceanbergBot/0.1 by YOUR_REDDIT_USERNAME");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            return restTemplate.exchange(url, HttpMethod.GET, entity, Map.class).getBody();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    public Map<String, Object> searchPosts(String keyword, Optional<Instant> fromDate) {
        Map<String, Object> response = searchPosts(keyword);

        // TODO: Add filtering by created_utc >= fromDate if response has timestamps
        return response;
    }
}
