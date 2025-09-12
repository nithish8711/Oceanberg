package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.ReportRequest;
import com.oceanberg.backend.dto.ReportResponse;
import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final GridFsTemplate gridFsTemplate;

    public ReportResponse submitReport(ReportRequest request, List<MultipartFile> files) throws IOException {
        List<String> fileIds = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    ObjectId id = gridFsTemplate.store(
                            file.getInputStream(),
                            file.getOriginalFilename(),
                            file.getContentType()
                    );
                    fileIds.add(id.toHexString());
                }
            }
        }

        Report report = Report.builder()
                .userId(getCurrentUserId())
                .type(request.getType())
                .description(request.getDescription())
                .location(new org.springframework.data.geo.Point(request.getLon(), request.getLat()))
                .observedAt(request.getObservedAt() != null ? request.getObservedAt() : Instant.now())
                .submittedAt(Instant.now())
                .mediaFileIds(fileIds)
                .verified(false)
                .build();

        Report saved = reportRepository.save(report);
        return toResponse(saved);
    }

    public List<ReportResponse> getMyReports() {
        return reportRepository.findByUserId(getCurrentUserId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    private ReportResponse toResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .userId(report.getUserId())
                .type(report.getType())
                .description(report.getDescription())
                .lon(report.getLocation().getX())
                .lat(report.getLocation().getY())
                .observedAt(report.getObservedAt())
                .submittedAt(report.getSubmittedAt())
                .mediaFileIds(report.getMediaFileIds())
                .verified(report.isVerified())
                .build();
    }
}
