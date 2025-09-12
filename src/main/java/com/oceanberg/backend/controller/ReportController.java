package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.ReportRequest;
import com.oceanberg.backend.dto.ReportResponse;
import com.oceanberg.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/submit")
    public ResponseEntity<ReportResponse> submitReport(
            @ModelAttribute ReportRequest request,
            @RequestPart(required = false) List<MultipartFile> files
    ) throws IOException {
        return ResponseEntity.ok(reportService.submitReport(request, files));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports() {
        return ResponseEntity.ok(reportService.getMyReports());
    }
}
