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
    public void collectFromReport(Report report) {
        if (!"USER".equalsIgnoreCase(report.getSource())) return;

        String hazardType = report.getType(); // hazard type from report
        Set<String> keywords = generateKeywordsFromReport(report);
        Instant recentTimeWindow = Instant.now().minus(3, ChronoUnit.DAYS);

        for (String keyword : keywords) {
            collectForKeywordWithType(keyword, Optional.of(recentTimeWindow), hazardType);
        }
    }

    // Collect posts from an INCOIS alert
    public void collectFromOceanAlert(OceanAlert alert) {
        if (!"INCOIS".equalsIgnoreCase(alert.getSource())) return;

        String hazardType = alert.getType(); // hazard type from alert
        Set<String> keywords = generateKeywordsFromAlert(alert);
        Instant recentTimeWindow = Instant.now().minus(3, ChronoUnit.DAYS);

        for (String keyword : keywords) {
            collectForKeywordWithType(keyword, Optional.of(recentTimeWindow), hazardType);
        }
    }

    // Generate keywords from report
    private Set<String> generateKeywordsFromReport(Report report) {
        Set<String> keywords = new HashSet<>();
        List<String> stopWords = Arrays.asList("a","an","the","in","is","of","on","and","or","for","at","to","from");

        if (report.getType() != null && !report.getType().isEmpty()) {
            keywords.add(report.getType().toLowerCase());
        }

        if (report.getDescription() != null && !report.getDescription().isEmpty()) {
            Arrays.stream(report.getDescription().toLowerCase().split("\\s+"))
                    .map(word -> word.replaceAll("[^a-zA-Z0-9]", ""))
                    .filter(word -> !word.isEmpty() && !stopWords.contains(word))
                    .forEach(keywords::add);
        }

        if (report.getType() != null && report.getLocation() != null) {
            Point loc = report.getLocation();
            String locStr = loc.getX() + "," + loc.getY();
            keywords.add(report.getType().toLowerCase() + " " + locStr);
        }

        return keywords;
    }

    // Generate keywords from alert
    private Set<String> generateKeywordsFromAlert(OceanAlert alert) {
        Set<String> keywords = new HashSet<>();
        List<String> stopWords = Arrays.asList("a","an","the","in","is","of","on","and","or","for","at","to","from","due","incois");

        if (alert.getType() != null && !alert.getType().isEmpty()) {
            keywords.add(alert.getType().toLowerCase());
        }
        if (alert.getLocation() != null && !alert.getLocation().isEmpty()) {
            Arrays.stream(alert.getLocation().toLowerCase().split(",\\s*"))
                    .forEach(keywords::add);
        }
        if (alert.getSeverity() != null && !alert.getSeverity().isEmpty()) {
            keywords.add(alert.getSeverity().toLowerCase());
        }
        if (alert.getAdvisory() != null && !alert.getAdvisory().isEmpty()) {
            Arrays.stream(alert.getAdvisory().toLowerCase().split("\\s+"))
                    .map(word -> word.replaceAll("[^a-zA-Z0-9]", ""))
                    .filter(word -> !word.isEmpty() && !stopWords.contains(word))
                    .forEach(keywords::add);
        }
        if (alert.getType() != null && alert.getLocation() != null) {
            keywords.add(alert.getType().toLowerCase() + " " + alert.getLocation().toLowerCase().replace(",", ""));
        }

        return keywords;
    }

    // Collect posts for a keyword with hazard type
    public void collectForKeywordWithType(String keyword, Optional<Instant> fromDate, String type) {
        Map<String, Object> twitterData = twitterClient.fetchTweets(keyword, fromDate);
        saveRawPostWithType("twitter", keyword, twitterData, type);

        Map<String, Object> redditData = redditClient.searchPosts(keyword, fromDate);
        saveRawPostWithType("reddit", keyword, redditData, type);

        Map<String, Object> instagramData = rapidApiClient.callApi(
            "instagram120.p.rapidapi.com",
            "https://instagram120.p.rapidapi.com/api/instagram/hls?q=" + keyword,
            instagramRapidApiKey);
        saveRawPostWithType("instagram", keyword, instagramData, type);

        Map<String, Object> youtubeData = rapidApiClient.callApi(
            "youtube138.p.rapidapi.com",
            "https://youtube138.p.rapidapi.com/auto-complete/?q=" + keyword + "&hl=en&gl=US",
            youtubeRapidApiKey);
        saveRawPostWithType("youtube", keyword, youtubeData, type);

        Map<String, Object> facebookData = rapidApiClient.callApi(
            "facebook-pages-scraper2.p.rapidapi.com",
            "https://facebook-pages-scraper2.p.rapidapi.com/fetch_search_people?query=" + keyword,
            facebookRapidApiKey);
        saveRawPostWithType("facebook", keyword, facebookData, type);
    }

    // Save post with type
    private void saveRawPostWithType(String platform, String keyword, Map<String, Object> raw, String type) {
        if (raw == null || raw.isEmpty()) return;

        try {
            Object contentObj = raw.containsKey("data") ? raw.get("data") : raw;
            String content = contentObj != null ? contentObj.toString() : "{}";

            RawSocialPost post = RawSocialPost.builder()
                    .platform(platform)
                    .keyword(keyword)
                    .type(type)  // assign hazard type
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

        for (int i=0; i<numPostsToGenerate; i++) {
            String platform = platforms[random.nextInt(platforms.length)];
            String subLocation = subLocations[random.nextInt(subLocations.length)];
            String categoryEn = categoriesEn[random.nextInt(categoriesEn.length)];

            String[] regionalVersions = categoryRegional.getOrDefault(categoryEn, new String[]{categoryEn});
            String categoryRegionalSelected = regionalVersions[random.nextInt(regionalVersions.length)];

            String template = contentTemplates[random.nextInt(contentTemplates.length)];
            String content = template.replace("{subLocation}", subLocation)
                    .replace("{category}", categoryRegionalSelected);

            DummyPost post = DummyPost.builder()
                    .platform(platform)
                    .keyword(subLocation.toLowerCase())
                    .content(content)
                    .type(hazardType)  // assign hazard type
                    .createdAt(Instant.now())
                    .build();

            dummyPosts.add(post);
        }

        dummyPostRepository.saveAll(dummyPosts);
        log.info("Saved {} diverse dummy posts with type '{}' to the database.", dummyPosts.size(), hazardType);
    }
}
