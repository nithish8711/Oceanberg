package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.ReportRequest;
import com.oceanberg.backend.dto.ReportResponse;
import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.repository.ReportRepository;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSDownloadStream;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final GridFsTemplate gridFsTemplate;
    private final GridFSBucket gridFsBucket;

    public List<ReportResponse> getReports(Optional<String> district,
                                           Optional<String> state,
                                           Optional<String> date,
                                           Optional<String> q,
                                           boolean isAdmin) {

        List<Report> reports;

        if (q.isPresent() && !q.get().isBlank()) {
            reports = reportRepository.searchReports(q.get());
        } else if (district.isPresent() && state.isPresent()) {
            reports = reportRepository.findByDistrictIgnoreCaseAndStateIgnoreCase(district.get(), state.get());
        } else if (district.isPresent()) {
            reports = reportRepository.findByDistrictIgnoreCase(district.get());
        } else if (state.isPresent()) {
            reports = reportRepository.findByStateIgnoreCase(state.get());
        } else {
            reports = reportRepository.findAll();
        }

        // Apply date filter
        if (date.isPresent()) {
            LocalDate d0 = LocalDate.parse(date.get());
            reports = reports.stream()
                    .filter(r -> r.getObservedAt() != null &&
                            r.getObservedAt().atZone(ZoneId.systemDefault()).toLocalDate().equals(d0))
                    .toList();
        }

        // Sort: Admin reports first, then by submission date (newest first)
        reports.sort((a, b) -> {
            boolean aAdmin = "ADMIN".equalsIgnoreCase(a.getSource());
            boolean bAdmin = "ADMIN".equalsIgnoreCase(b.getSource());
            if (aAdmin && !bAdmin) return -1;
            if (!aAdmin && bAdmin) return 1;
            return b.getSubmittedAt().compareTo(a.getSubmittedAt());
        });

        return reports.stream().map(this::toResponse).toList();
    }

    public ReportResponse submitReport(ReportRequest request, List<MultipartFile> files) throws IOException {
        List<String> fileIds = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // Store file with proper content type
                    String contentType = file.getContentType();
                    if (contentType == null || contentType.isEmpty()) {
                        contentType = determineContentType(file.getOriginalFilename());
                    }
                    
                    ObjectId id = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), contentType);
                    fileIds.add(id.toHexString());
                    log.info("Stored file: {} with content type: {}", file.getOriginalFilename(), contentType);
                }
            }
        }

        Report report = Report.builder()
                .userId(getCurrentUserIdOrDefault())
                .type(request.getType())
                .description(request.getDescription())
                .location(request.getLat() != null && request.getLon() != null 
                    ? new Point(request.getLon(), request.getLat()) 
                    : null)
                .district(request.getDistrict())
                .state(request.getState())
                .observedAt(Optional.ofNullable(request.getObservedAt()).orElse(Instant.now()))
                .submittedAt(Instant.now())
                .mediaFileIds(fileIds)
                .verified(false)
                .source(Optional.ofNullable(request.getSource()).orElse("USER"))
                .highlighted(false)
                .build();

        return toResponse(reportRepository.save(report));
    }

    public List<ReportResponse> getMyReports() {
        String userId = getCurrentUserIdOrDefault();
        return reportRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GridFsResource downloadMedia(String fileId) {
        try {
            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
            return file == null ? null : gridFsTemplate.getResource(file);
        } catch (Exception e) {
            log.error("Error downloading media with ID: " + fileId, e);
            return null;
        }
    }

    public ResponseEntity<?> streamMedia(String fileId, String rangeHeader) throws IOException {
        try {
            log.info("Streaming media request for fileId: {} with range: {}", fileId, rangeHeader);
            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
            if (file == null) {
                log.warn("File not found for ID: {}", fileId);
                return ResponseEntity.notFound().build();
            }
            return streamFile(file, rangeHeader);
        } catch (Exception e) {
            log.error("Error streaming media with ID: " + fileId, e);
            return ResponseEntity.notFound().build();
        }
    }

    private ResponseEntity<?> streamFile(GridFSFile file, String rangeHeader) throws IOException {
        long fileLength = file.getLength();
        
        String contentType = determineContentTypeFromFile(file);
        log.info("Streaming file: {} with content type: {} and length: {}", 
                file.getFilename(), contentType, fileLength);

        long start = 0, end = fileLength - 1;
        boolean isRangeRequest = false;
        
        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            isRangeRequest = true;
            String[] ranges = rangeHeader.substring(6).split("-");
            try {
                start = Long.parseLong(ranges[0]);
                if (ranges.length > 1 && !ranges[1].isEmpty()) {
                    end = Long.parseLong(ranges[1]);
                }
                log.info("Range request: bytes={}-{}", start, end);
            } catch (NumberFormatException e) {
                log.warn("Invalid range header: {}", rangeHeader);
                start = 0;
                end = fileLength - 1;
            }
        }
        
        if (end >= fileLength) end = fileLength - 1;
        long contentLength = end - start + 1;

        GridFSDownloadStream downloadStream = gridFsBucket.openDownloadStream(file.getObjectId());
        if (start > 0) {
            downloadStream.skip(start);
        }

        InputStream inputStream = new InputStream() {
            private long remaining = contentLength;
            
            @Override 
            public int read() throws IOException {
                if (remaining <= 0) return -1;
                int data = downloadStream.read();
                if (data != -1) remaining--;
                return data;
            }
            
            @Override 
            public int read(byte[] b, int off, int len) throws IOException {
                if (remaining <= 0) return -1;
                if (len > remaining) len = (int) remaining;
                int bytesRead = downloadStream.read(b, off, len);
                if (bytesRead > 0) remaining -= bytesRead;
                return bytesRead;
            }
            
            @Override
            public void close() throws IOException {
                downloadStream.close();
            }
        };

        // Build response with proper headers for video streaming
        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.status(isRangeRequest ? 206 : 200)
                .header("Content-Type", contentType)
                .header("Accept-Ranges", "bytes")
                .header("Content-Length", String.valueOf(contentLength))
                .header("Cache-Control", "public, max-age=3600")
                // CORS headers are redundant here as the controller and SecurityConfig handle it, 
                // but kept for safety/demonstration of streaming headers
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                .header("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length");
        
        if (isRangeRequest) {
            responseBuilder.header("Content-Range", "bytes " + start + "-" + end + "/" + fileLength);
        }

        log.info("Returning {} response with content length: {}", isRangeRequest ? 206 : 200, contentLength);
        return responseBuilder.body(new InputStreamResource(inputStream));
    }

    public ReportResponse updateReport(String id, ReportRequest request, List<MultipartFile> newFiles) throws IOException {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            throw new RuntimeException("Report not found");
        }

        Report report = reportOpt.get();
        // Update check for user identity can be added here if needed

        // Handle file uploads
        List<String> fileIds = report.getMediaFileIds() != null ? new ArrayList<>(report.getMediaFileIds()) : new ArrayList<>();
        if (newFiles != null) {
            for (MultipartFile file : newFiles) {
                if (!file.isEmpty()) {
                    String contentType = file.getContentType();
                    if (contentType == null || contentType.isEmpty()) {
                        contentType = determineContentType(file.getOriginalFilename());
                    }
                    ObjectId idObj = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), contentType);
                    fileIds.add(idObj.toHexString());
                }
            }
        }

        // Update fields - only update if provided in request
        if (request.getType() != null) report.setType(request.getType());
        if (request.getDescription() != null) report.setDescription(request.getDescription());
        if (request.getLat() != null && request.getLon() != null) {
            report.setLocation(new Point(request.getLon(), request.getLat()));
        }
        if (request.getDistrict() != null) report.setDistrict(request.getDistrict());
        if (request.getState() != null) report.setState(request.getState());
        if (request.getObservedAt() != null) report.setObservedAt(request.getObservedAt());
        
        // Handle admin-only fields
        if (request.getVerified() != null) report.setVerified(request.getVerified());
        if (request.getHighlighted() != null) report.setHighlighted(request.getHighlighted());
        
        report.setMediaFileIds(fileIds);

        return toResponse(reportRepository.save(report));
    }

    public ReportResponse deleteReport(String id) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) return null;

        Report report = reportOpt.get();

        // Delete associated media files
        if (report.getMediaFileIds() != null) {
            for (String fileId : report.getMediaFileIds()) {
                try {
                    gridFsTemplate.delete(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
                } catch (Exception e) {
                    log.warn("Failed to delete media file: " + fileId, e);
                }
            }
        }
        
        reportRepository.deleteById(id);
        return toResponse(report);
    }

    public void deleteAllReports(Optional<String> sourceFilter) {
        if (sourceFilter.isPresent()) {
            List<Report> reportsToDelete = reportRepository.findAll()
                    .stream()
                    .filter(r -> r.getSource() != null &&
                            r.getSource().equalsIgnoreCase(sourceFilter.get()))
                    .toList();
            
            // Delete associated media files
            for (Report report : reportsToDelete) {
                if (report.getMediaFileIds() != null) {
                    for (String fileId : report.getMediaFileIds()) {
                        try {
                            gridFsTemplate.delete(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
                        } catch (Exception e) {
                            log.warn("Failed to delete media file: " + fileId, e);
                        }
                    }
                }
            }
            
            reportRepository.deleteAll(reportsToDelete);
        } else {
            // Delete all media files first
            gridFsTemplate.delete(new Query());
            reportRepository.deleteAll();
        }
    }

    private String getCurrentUserIdOrDefault() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("No authentication context available");
        }
        return "dev-user";
    }

    // ... determineContentType and determineContentTypeFromFile remain the same ...
    private String determineContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        
        String lowerName = filename.toLowerCase();
        
        // Video types
        if (lowerName.endsWith(".mp4")) return "video/mp4";
        if (lowerName.endsWith(".webm")) return "video/webm";
        if (lowerName.endsWith(".avi")) return "video/avi";
        if (lowerName.endsWith(".mov")) return "video/quicktime";
        if (lowerName.endsWith(".mkv")) return "video/x-matroska";
        if (lowerName.endsWith(".flv")) return "video/x-flv";
        if (lowerName.endsWith(".wmv")) return "video/x-ms-wmv";
        if (lowerName.endsWith(".m4v")) return "video/x-m4v";
        
        // Image types
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) return "image/jpeg";
        if (lowerName.endsWith(".png")) return "image/png";
        if (lowerName.endsWith(".gif")) return "image/gif";
        if (lowerName.endsWith(".webp")) return "image/webp";
        if (lowerName.endsWith(".bmp")) return "image/bmp";
        if (lowerName.endsWith(".svg")) return "image/svg+xml";
        
        return "application/octet-stream";
    }

    private String determineContentTypeFromFile(GridFSFile file) {
        if (file.getMetadata() != null && file.getMetadata().get("_contentType") != null) {
            return file.getMetadata().get("_contentType").toString();
        }
        
        return determineContentType(file.getFilename());
    }
    
    // ...

    private ReportResponse toResponse(Report report) {
        ReportResponse.ReportResponseBuilder builder = ReportResponse.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .type(report.getType())
                .description(report.getDescription())
                .district(report.getDistrict())
                .state(report.getState())
                .observedAt(report.getObservedAt())
                .submittedAt(report.getSubmittedAt())
                .mediaFileIds(report.getMediaFileIds())
                .verified(report.isVerified())
                .highlighted(report.isHighlighted())
                .source(report.getSource());

        if (report.getLocation() != null) {
            builder.lon(report.getLocation().getX())
                    .lat(report.getLocation().getY());
        }

        // Convert mediaFileIds to media URLs for frontend (using the proxy path)
        if (report.getMediaFileIds() != null && !report.getMediaFileIds().isEmpty()) {
            List<ReportResponse.MediaItem> mediaItems = report.getMediaFileIds().stream()
                    .map(fileId -> {
                        String type = "image"; 
                        
                        try {
                            GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
                            if (file != null) {
                                String contentType = determineContentTypeFromFile(file);
                                
                                // Simple check for media type
                                if (contentType.startsWith("video/")) {
                                    type = "video";
                                } else if (contentType.startsWith("image/")) {
                                    type = "image";
                                } else {
                                    // Fallback check on filename if content type is generic
                                    String filename = file.getFilename();
                                    if (filename != null && filename.toLowerCase().matches(".*\\.(mp4|webm|avi|mov|mkv|flv|wmv|m4v)$")) {
                                        type = "video";
                                    }
                                }
                            }
                        } catch (Exception e) {
                            log.debug("Could not determine media type for file: " + fileId, e);
                        }

                        return ReportResponse.MediaItem.builder()
                                .type(type)
                                .url("/api/reports/media/" + fileId + "/stream") // THIS IS THE CRITICAL RELATIVE URL
                                .build();
                    })
                    .collect(Collectors.toList());
            
            builder.media(mediaItems);
        }

        return builder.build();
    }
}