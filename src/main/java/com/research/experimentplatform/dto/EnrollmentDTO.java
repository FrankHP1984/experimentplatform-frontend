package com.research.experimentplatform.dto;

import com.research.experimentplatform.model.EnrollmentStatus;

import java.time.LocalDateTime;

public class EnrollmentDTO {

    private Long id;
    private Long participantId;
    private Long experimentId;
    private String experimentTitle;
    private Long groupId;
    private String groupName;
    private EnrollmentStatus status;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public EnrollmentDTO() {
    }

    public EnrollmentDTO(Long id, Long participantId, Long experimentId, String experimentTitle,
                         Long groupId, String groupName, EnrollmentStatus status,
                         LocalDateTime enrolledAt, LocalDateTime completedAt) {
        this.id = id;
        this.participantId = participantId;
        this.experimentId = experimentId;
        this.experimentTitle = experimentTitle;
        this.groupId = groupId;
        this.groupName = groupName;
        this.status = status;
        this.enrolledAt = enrolledAt;
        this.completedAt = completedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Long getExperimentId() {
        return experimentId;
    }

    public void setExperimentId(Long experimentId) {
        this.experimentId = experimentId;
    }

    public String getExperimentTitle() {
        return experimentTitle;
    }

    public void setExperimentTitle(String experimentTitle) {
        this.experimentTitle = experimentTitle;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
