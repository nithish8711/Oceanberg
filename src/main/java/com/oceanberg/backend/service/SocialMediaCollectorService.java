package com.oceanberg.backend.service;

import com.oceanberg.backend.model.DummyPost;
import com.oceanberg.backend.model.RawSocialPost;
import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.model.OceanAlert;
import com.oceanberg.backend.repository.DummyPostRepository;
import com.oceanberg.backend.repository.RawSocialPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.data.geo.Point;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SocialMediaCollectorService {

    private final DummyPostRepository dummyPostRepository;
    private final RawSocialPostRepository postRepository;
    private final TwitterClient twitterClient;
    private final RedditClient redditClient;
    private final RapidApiClient rapidApiClient;

    @Value("${rapidapi.key.youtube}")
    private String youtubeRapidApiKey;

    @Value("${rapidapi.key.facebook}")
    private String facebookRapidApiKey;

    @Value("${rapidapi.key.instagram}")
    private String instagramRapidApiKey;

    // Collect posts from a user report
     public Set<String> getKeywordsFromReport(Report report) {
        Set<String> keywords = new HashSet<>();
        if (report.getType() != null) keywords.add(report.getType().toLowerCase());
        if (report.getDescription() != null) keywords.add(report.getDescription().toLowerCase());
        if (report.getDistrict() != null) keywords.add(report.getDistrict().toLowerCase());
        if (report.getState() != null) keywords.add(report.getState().toLowerCase());
        if (report.getSubmittedAt() != null) keywords.add(report.getSubmittedAt().toString());
        return keywords;
    }

    public Set<String> getKeywordsFromAlert(OceanAlert alert) {
        Set<String> keywords = new HashSet<>();
        if (alert.getType() != null) keywords.add(alert.getType().toLowerCase());
        if (alert.getDistrict() != null) keywords.add(alert.getDistrict().toLowerCase());
        if (alert.getState() != null) keywords.add(alert.getState().toLowerCase());
        if (alert.getColor() != null) keywords.add(alert.getColor().toLowerCase());
        if (alert.getIssueDate() != null) keywords.add(alert.getIssueDate().toString());
        return keywords;
    }

    // COLLECT POSTS
    public void collectFromReport(Report report) {
        if (!"USER".equalsIgnoreCase(report.getSource())) return;

        String hazardType = report.getType();
        Set<String> keywords = getKeywordsFromReport(report);
        Instant recentTimeWindow = Instant.now().minus(3, ChronoUnit.DAYS);

        keywords.forEach(keyword -> collectForKeywordWithType(keyword, Optional.of(recentTimeWindow), hazardType));
    }

    public void collectFromOceanAlert(OceanAlert alert) {
        if (!"INCOIS".equalsIgnoreCase(alert.getSource())) return;

        String hazardType = alert.getType();
        Set<String> keywords = getKeywordsFromAlert(alert);
        Instant recentTimeWindow = Instant.now().minus(3, ChronoUnit.DAYS);

        keywords.forEach(keyword -> collectForKeywordWithType(keyword, Optional.of(recentTimeWindow), hazardType));
    }

    public void collectForKeywordWithType(String keyword, Optional<Instant> fromDate, String type) {
        if (keyword == null || keyword.isEmpty()) return;

        saveRawPostWithType("twitter", keyword, twitterClient.fetchTweets(keyword, fromDate), type);
        saveRawPostWithType("reddit", keyword, redditClient.searchPosts(keyword, fromDate), type);

        saveRawPostWithType("instagram", keyword,
                rapidApiClient.callApi("instagram120.p.rapidapi.com",
                        "https://instagram120.p.rapidapi.com/api/instagram/hls?q=" + keyword,
                        instagramRapidApiKey), type);

        saveRawPostWithType("youtube", keyword,
                rapidApiClient.callApi("youtube138.p.rapidapi.com",
                        "https://youtube138.p.rapidapi.com/auto-complete/?q=" + keyword + "&hl=en&gl=US",
                        youtubeRapidApiKey), type);

        saveRawPostWithType("facebook", keyword,
                rapidApiClient.callApi("facebook-pages-scraper2.p.rapidapi.com",
                        "https://facebook-pages-scraper2.p.rapidapi.com/fetch_search_people?query=" + keyword,
                        facebookRapidApiKey), type);
    }

    // SAVE POSTS
    private void saveRawPostWithType(String platform, String keyword, Map<String, Object> raw, String type) {
        if (raw == null || raw.isEmpty()) return;

        try {
            Object contentObj = raw.getOrDefault("data", raw);
            String content = contentObj != null ? contentObj.toString() : "{}";

            RawSocialPost post = RawSocialPost.builder()
                    .platform(platform)
                    .keyword(keyword)
                    .type(type)
                    .content(content)
                    .createdAt(Instant.now())
                    .build();

            postRepository.save(post);
        } catch (Exception e) {
            log.error("Failed to save raw post for platform {} and keyword {}", platform, keyword, e);
        }
    }
    
    // Insert a single dummy post
    public DummyPost insertDummyPost(DummyPost post) {
        post.setCreatedAt(Instant.now());
        return dummyPostRepository.save(post);
    }

    // Generate dummy posts with hazard type
    public void generateRegionalDummyPosts(String hazardType) {
        Random random = new Random();
        String[] platforms = {"twitter", "reddit", "facebook"};
        String[] subLocations = {"Mylapore","Kodambakkam","Tambaram","Adyar","T Nagar","Velachery","Madipakkam"};
        String[] categoriesEn = {"Food","Medical","Rescue","Water","Shelter","Infrastructure"};

        Map<String,String[]> categoryRegional = new HashMap<>();
        categoryRegional.put("Food", new String[]{"உணவு தேவையுண்டு","ఆహార అవసరం","ഭക്ഷണാവശ്യകത"});
        categoryRegional.put("Medical", new String[]{"மருத்துவ அவசரம்","వైద్య అత్యవసరం","വൈദ്യ അടിയന്തരാവസ്ഥ"});
        categoryRegional.put("Rescue", new String[]{"மீட்பு பணிகள்","రక్షణ","രക്ഷാപ്രവർത്തനം"});
        categoryRegional.put("Water", new String[]{"தண்ணீர் பற்றாக்குறை","నీటి కొరత","വെള്ളക്കുറവ്"});
        categoryRegional.put("Shelter", new String[]{"தங்கும் இடம்","తేదా ఆశ్రయం","ആശ്രയം"});
        categoryRegional.put("Infrastructure", new String[]{"சாலை அடைப்பு","రహదారి తిస్కడమ","റോഡ് തടസ്സങ്ങൾ"});

        String[] contentTemplates = {
                "{category} needed urgently in {subLocation} area. #ChennaiFloods",
                "{subLocation} లో {category} సమస్య. తక్షణ సహాయం కావాలి. #Chennai",
                "We are stranded in {subLocation}. No {category} access. #Help",
                "உடனடி {category} தேவை. {subLocation} பகுதியில் மக்கள் சிக்கியுள்ளனர். #ChennaiRain",
                "Heavy rain, {subLocation} is flooded. Need {category} and rescue. #TamilNadu"
        };

        List<DummyPost> dummyPosts = new ArrayList<>();
        int numPostsToGenerate = 50;

        for (int i = 0; i < numPostsToGenerate; i++) {
            String platform = platforms[random.nextInt(platforms.length)];
            String subLocation = subLocations[random.nextInt(subLocations.length)];
            String categoryEn = categoriesEn[random.nextInt(categoriesEn.length)];
            String categoryRegionalSelected = categoryRegional.getOrDefault(categoryEn, new String[]{categoryEn})[random.nextInt(3)];

            String content = contentTemplates[random.nextInt(contentTemplates.length)]
                    .replace("{subLocation}", subLocation)
                    .replace("{category}", categoryRegionalSelected);

            dummyPosts.add(DummyPost.builder()
                    .platform(platform)
                    .keyword(subLocation.toLowerCase())
                    .content(content)
                    .type(hazardType)
                    .createdAt(Instant.now())
                    .build());
        }

        dummyPostRepository.saveAll(dummyPosts);
        log.info("Saved {} diverse dummy posts with type '{}' to the database.", dummyPosts.size(), hazardType);
    }
}
