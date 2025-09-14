package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.ReportRequest;
import com.oceanberg.backend.dto.ReportResponse;
import com.oceanberg.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class ReportController {

    private final ReportService reportService;

    // ✅ Submit a new report
    @PostMapping("/submit")
    public ResponseEntity<ReportResponse> submitReport(
            @ModelAttribute ReportRequest request,
            @RequestPart(required = false) List<MultipartFile> files
    ) throws IOException {
        return ResponseEntity.ok(reportService.submitReport(request, files));
    }

    // ✅ Get my reports
    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getMyReports());
    }

    // ✅ Download media by fileId
    @GetMapping("/media/{fileId}/download")
    public ResponseEntity<?> downloadMedia(@PathVariable String fileId) throws IOException {
        GridFsResource resource = reportService.downloadMedia(fileId);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(resource.getContentType() != null ? resource.getContentType() : "application/octet-stream"))
                .body(new InputStreamResource(resource.getInputStream()));
    }

    // ✅ Stream media by fileId (supports Range header)
    @GetMapping("/media/{fileId}/stream")
    public ResponseEntity<?> streamMedia(
            @PathVariable String fileId,
            @RequestHeader(value = "Range", required = false) String rangeHeader
    ) throws IOException {
        return reportService.streamMedia(fileId, rangeHeader);
    }

    // ✅ Update report
    @PutMapping("/{id}")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable String id,
            @ModelAttribute ReportRequest request,
            @RequestPart(required = false) List<MultipartFile> files
    ) throws IOException {
        return ResponseEntity.ok(reportService.updateReport(id, request, files));
    }

    // ✅ Delete report
    @DeleteMapping("/{id}")
    public ResponseEntity<ReportResponse> deleteReport(@PathVariable String id) {
        ReportResponse deletedReport = reportService.deleteReport(id);
        if (deletedReport == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(deletedReport);
    }

    // ✅ Delete all reports (optionally filter by source: USER / MOCK)
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllReports(@RequestParam(required = false) String source) {
        reportService.deleteAllReports(source == null ? java.util.Optional.empty() : java.util.Optional.of(source));
        return ResponseEntity.ok(source == null
                ? "All reports deleted."
                : "All reports with source=" + source + " deleted.");
    }
}
