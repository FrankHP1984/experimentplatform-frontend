package com.research.experimentplatform.controller;

import com.research.experimentplatform.dto.EnrollParticipantRequest;
import com.research.experimentplatform.dto.EnrollmentDTO;
import com.research.experimentplatform.model.EnrollmentStatus;
import com.research.experimentplatform.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/participants/{participantId}")
    public ResponseEntity<EnrollmentDTO> enrollInExperiment(
            @PathVariable Long participantId,
            @Valid @RequestBody EnrollParticipantRequest request) {
        EnrollmentDTO enrollment = enrollmentService.enrollParticipant(participantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @GetMapping("/participants/{participantId}")
    public ResponseEntity<Page<EnrollmentDTO>> getParticipantEnrollments(
            @PathVariable Long participantId, Pageable pageable) {
        Page<EnrollmentDTO> enrollments = enrollmentService.getParticipantEnrollments(participantId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<EnrollmentDTO>> getMyEnrollments(
            Authentication authentication, Pageable pageable) {
        Long userId = (Long) authentication.getDetails();
        Page<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByUserId(userId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/experiments/{experimentId}")
    public ResponseEntity<Page<EnrollmentDTO>> getExperimentEnrollments(
            @PathVariable Long experimentId, Pageable pageable) {
        Page<EnrollmentDTO> enrollments = enrollmentService.getExperimentEnrollments(experimentId, pageable);
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/{enrollmentId}/status")
    public ResponseEntity<EnrollmentDTO> updateEnrollmentStatus(
            @PathVariable Long enrollmentId,
            @RequestParam EnrollmentStatus status) {
        EnrollmentDTO enrollment = enrollmentService.updateEnrollmentStatus(enrollmentId, status);
        return ResponseEntity.ok(enrollment);
    }

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void> withdrawEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.withdrawEnrollment(enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
