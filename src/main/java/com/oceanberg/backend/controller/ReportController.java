package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.ReportRequest;
import com.oceanberg.backend.dto.ReportResponse;
import com.oceanberg.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getReports(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String date,
            @RequestParam(required = false, name = "q") String query
    ) {
        log.info("Getting reports with filters - district: {}, state: {}, date: {}, query: {}", 
                district, state, date, query);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        List<ReportResponse> reports = reportService.getReports(
                Optional.ofNullable(district),
                Optional.ofNullable(state),
                Optional.ofNullable(date),
                Optional.ofNullable(query),
                isAdmin
        );
        
        log.info("Returning {} reports", reports.size());
        return ResponseEntity.ok(reports);
    }

    // Handle JSON-only submissions
    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ReportResponse> submitReportJson(@RequestBody ReportRequest request) throws IOException {
        log.info("Processing JSON submission: {}", request);
        ReportResponse response = reportService.submitReport(request, null);
        return ResponseEntity.ok(response);
    }

    // Handle multipart form data submissions
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReportResponse> submitReportMultipart(
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lon", required = false) Double lon,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "observedAt", required = false) String observedAtStr,
            @RequestParam(value = "source", defaultValue = "USER") String source,
            @RequestParam(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        
        log.info("Processing multipart submission - type: {}, description length: {}, files count: {}", 
                type, description != null ? description.length() : 0, files != null ? files.size() : 0);
        
        ReportRequest request = ReportRequest.builder()
                .type(type)
                .description(description)
                .lat(lat)
                .lon(lon)
                .district(district)
                .state(state)
                .observedAt(observedAtStr != null ? Instant.parse(observedAtStr) : null)
                .source(source)
                .build();
        
        log.info("Built request object: {}", request);
        ReportResponse response = reportService.submitReport(request, files);
        log.info("Successfully processed multipart submission with ID: {}", response.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        log.info("Getting user's reports");
        return ResponseEntity.ok(reportService.getMyReports());
    }

    @GetMapping("/media/{fileId}/download")
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> downloadMedia(@PathVariable String fileId) throws IOException {
        log.info("Download request for media file: {}", fileId);
        
        GridFsResource resource = reportService.downloadMedia(fileId);
        if (resource == null) {
            log.warn("Media file not found: {}", fileId);
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                .contentType(MediaType.parseMediaType(
                        resource.getContentType() != null ? resource.getContentType() : "application/octet-stream"))
                .body(new InputStreamResource(resource.getInputStream()));
    }

    @GetMapping("/media/{fileId}/stream")
    @CrossOrigin(origins = "*", allowedHeaders = {"Range", "Content-Type", "Authorization"})
    public ResponseEntity<?> streamMedia(
            @PathVariable String fileId,
            @RequestHeader(value = "Range", required = false) String rangeHeader
    ) throws IOException {
        
        log.info("Streaming media request for fileId: {} with range: {}", fileId, rangeHeader);
        
        ResponseEntity<?> response = reportService.streamMedia(fileId, rangeHeader);
        
        log.info("Streaming response status: {} for fileId: {}", 
                response.getStatusCode(), fileId);
        
        return response;
    }

    @RequestMapping(value = "/media/{fileId}/stream", method = RequestMethod.OPTIONS)
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> streamMediaOptions(@PathVariable String fileId) {
        log.info("OPTIONS request for media stream: {}", fileId);
        
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
                .header("Access-Control-Allow-Headers", "Range, Content-Type, Authorization")
                .header("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length")
                .build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable String id,
            @ModelAttribute ReportRequest request, // Handles JSON or form fields
            @RequestPart(required = false) List<MultipartFile> files // Handles files
    ) throws IOException {
        log.info("Updating report: {} with request: {}", id, request);
        
        try {
            ReportResponse response = reportService.updateReport(id, request, files);
            log.info("Report updated successfully: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating report {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ReportResponse> deleteReport(@PathVariable String id) {
        log.info("Deleting report: {}", id);
        
        try {
            ReportResponse deleted = reportService.deleteReport(id);
            if (deleted == null) {
                log.warn("Report not found for deletion: {}", id);
                return ResponseEntity.notFound().build();
            }
            
            log.info("Report deleted successfully: {}", id);
            return ResponseEntity.ok(deleted);
        } catch (Exception e) {
            log.error("Error deleting report {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllReports(@RequestParam(required = false) String source) {
        log.info("Deleting all reports with source filter: {}", source);
        
        try {
            reportService.deleteAllReports(Optional.ofNullable(source));
            String message = source == null ? "All reports deleted." : "All reports with source=" + source + " deleted.";
            log.info(message);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            log.error("Error deleting all reports: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error deleting reports: " + e.getMessage());
        }
    }

    @GetMapping("/media/{fileId}/info")
    @CrossOrigin(origins = "*")
    public ResponseEntity<?> getMediaInfo(@PathVariable String fileId) {
        log.info("Getting media info for fileId: {}", fileId);
        
        try {
            GridFsResource resource = reportService.downloadMedia(fileId);
            if (resource == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                    .header("Access-Control-Allow-Origin", "*")
                    .body(Map.of(
                            "fileId", fileId,
                            "filename", resource.getFilename(),
                            "contentType", resource.getContentType(),
                            "exists", true
                    ));
        } catch (Exception e) {
            log.error("Error getting media info for {}: {}", fileId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}