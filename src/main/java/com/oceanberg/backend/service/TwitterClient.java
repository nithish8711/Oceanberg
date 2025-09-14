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
public class TwitterClient {

    @Value("${twitter.bearerToken}")
    private String bearerToken;

    public Map<String, Object> fetchTweets(String keyword) {
        try {
            String url = "https://api.twitter.com/2/tweets/search/recent?query=" + keyword;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + bearerToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            return restTemplate.exchange(url, HttpMethod.GET, entity, Map.class).getBody();
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }

    public Map<String, Object> fetchTweets(String keyword, Optional<Instant> fromDate) {
        Map<String, Object> response = fetchTweets(keyword);

        // TODO: Add filtering by created_at >= fromDate if response has timestamps
        return response;
    }
}
