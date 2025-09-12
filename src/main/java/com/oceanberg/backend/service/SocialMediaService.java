package com.oceanberg.backend.service;

import com.oceanberg.backend.model.OceanAlert;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SocialMediaService {

    public List<String> searchOnSocialMedia(List<OceanAlert> alerts) {
        List<String> results = new ArrayList<>();

        for (OceanAlert alert : alerts) {
            String keyword = alert.getType() + " " + alert.getLocation();

            // Mock results (replace with real API integrations)
            results.add("Twitter posts about: " + keyword);
            results.add("Reddit discussions about: " + keyword);
            results.add("YouTube videos about: " + keyword);
            results.add("Instagram posts about: " + keyword);
            results.add("Facebook posts about: " + keyword);
        }

        return results;
    }
}
