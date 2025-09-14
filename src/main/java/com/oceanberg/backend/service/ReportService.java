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
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.geo.Point;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final GridFsTemplate gridFsTemplate;
    private final GridFSBucket gridFsBucket;
    private final Random random = new Random();

    // ✅ Submit new report
    public ReportResponse submitReport(ReportRequest request, List<MultipartFile> files) throws IOException {
        List<String> fileIds = new ArrayList<>();
        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    ObjectId id = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
                    fileIds.add(id.toHexString());
                }
            }
        }

        Report report = Report.builder()
                .userId(getCurrentUserId())
                .type(request.getType())
                .description(request.getDescription())
                .location(new Point(request.getLon(), request.getLat()))
                .observedAt(request.getObservedAt() != null ? request.getObservedAt() : Instant.now())
                .submittedAt(Instant.now())
                .mediaFileIds(fileIds)
                .verified(false)
                .source(request.getSource() != null ? request.getSource() : "USER") // 🔹 Use source from request, or default to "USER"
                .build();

        return toResponse(reportRepository.save(report));
    }
    
    // ✅ This method is no longer needed as the logic is handled in submitReport
    // public void generateMockReport() { ... }

    // ✅ Get reports of current user
    public List<ReportResponse> getMyReports() {
        return reportRepository.findByUserId(getCurrentUserId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ Download media
    public GridFsResource downloadMedia(String fileId) {
        GridFSFile file = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
        if (file == null) return null;
        return gridFsTemplate.getResource(file);
    }

    // ✅ Get raw GridFS file
    public GridFSFile getFile(ObjectId fileId) {
        return gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(fileId)));
    }

    // ✅ Stream media by fileId
    public ResponseEntity<?> streamMedia(String fileId, String rangeHeader) throws IOException {
        GridFSFile file = getFile(new ObjectId(fileId));
        if (file == null) return ResponseEntity.notFound().build();
        return streamMedia(file, rangeHeader);
    }

    // ✅ Stream media (internal)
    private ResponseEntity<?> streamMedia(GridFSFile file, String rangeHeader) throws IOException {
        long fileLength = file.getLength();
        String contentType = file.getMetadata() != null && file.getMetadata().get("_contentType") != null
                ? file.getMetadata().get("_contentType").toString()
                : "video/mp4";

        long start = 0, end = fileLength - 1;

        if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
            String[] ranges = rangeHeader.substring(6).split("-");
            start = Long.parseLong(ranges[0]);
            if (ranges.length > 1 && !ranges[1].isEmpty()) end = Long.parseLong(ranges[1]);
        }
        if (end >= fileLength) end = fileLength - 1;
        long contentLength = end - start + 1;

        GridFSDownloadStream downloadStream = gridFsBucket.openDownloadStream(file.getObjectId());
        downloadStream.skip(start);

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
        };

        return ResponseEntity.status(rangeHeader == null ? 200 : 206)
                .header("Content-Type", contentType)
                .header("Accept-Ranges", "bytes")
                .header("Content-Length", String.valueOf(contentLength))
                .header("Content-Range", "bytes " + start + "-" + end + "/" + fileLength)
                .body(new InputStreamResource(inputStream));
    }

    // ✅ Update report
    public ReportResponse updateReport(String id, ReportRequest request, List<MultipartFile> newFiles) throws IOException {
        Report report = reportRepository.findById(id).orElseThrow(() -> new RuntimeException("Report not found"));
        if (!report.getUserId().equals(getCurrentUserId())) throw new AccessDeniedException("Not authorized");

        List<String> fileIds = report.getMediaFileIds() != null ? new ArrayList<>(report.getMediaFileIds()) : new ArrayList<>();
        if (newFiles != null) {
            for (MultipartFile file : newFiles) {
                if (!file.isEmpty()) {
                    ObjectId idObj = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType());
                    fileIds.add(idObj.toHexString());
                }
            }
        }

        report.setType(request.getType());
        report.setDescription(request.getDescription());
        report.setLocation(new Point(request.getLon(), request.getLat()));
        report.setObservedAt(request.getObservedAt() != null ? request.getObservedAt() : report.getObservedAt());
        report.setMediaFileIds(fileIds);
        report.setSource("USER"); // 🔹 Only a user can update their report, so source remains "USER"

        return toResponse(reportRepository.save(report));
    }

    // ✅ Delete single report
    public ReportResponse deleteReport(String id) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) return null;

        Report report = reportOpt.get();

        if (!report.getUserId().equals(getCurrentUserId())) {
            throw new SecurityException("You cannot delete this report");
        }

        if (report.getMediaFileIds() != null) {
            for (String fileId : report.getMediaFileIds()) {
                gridFsTemplate.delete(Query.query(Criteria.where("_id").is(new ObjectId(fileId))));
            }
        }
        reportRepository.deleteById(id);
        return toResponse(report);
    }

    // ✅ Delete all reports (optionally filtered by source)
    public void deleteAllReports(Optional<String> sourceFilter) {
        log.warn("Deleting reports. Filter: {}", sourceFilter.orElse("ALL"));

        if (sourceFilter.isPresent()) {
            List<Report> reportsToDelete = reportRepository.findAll()
                    .stream()
                    .filter(r -> r.getSource() != null &&
                            r.getSource().toLowerCase().contains(sourceFilter.get().toLowerCase()))
                    .toList();

            reportRepository.deleteAll(reportsToDelete);
            log.info("Deleted {} reports with source containing '{}'", reportsToDelete.size(), sourceFilter.get());
        } else {
            reportRepository.deleteAll();
            log.info("Deleted ALL reports");
        }
    }

    // ✅ Helper: get current user ID
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    // ✅ Helper: convert Report to ReportResponse
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
                .source(report.getSource())
                .build();
    }
}