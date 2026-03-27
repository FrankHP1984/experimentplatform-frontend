package com.research.experimentplatform.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollParticipantRequest {

    @NotNull(message = "Experiment ID is required")
    private Long experimentId;

    private Long groupId;

    public EnrollParticipantRequest() {
    }

    public Long getExperimentId() {
        return experimentId;
    }

    public void setExperimentId(Long experimentId) {
        this.experimentId = experimentId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}
