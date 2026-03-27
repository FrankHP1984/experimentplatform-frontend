package com.research.experimentplatform.dto;

import com.research.experimentplatform.model.DesignType;
import com.research.experimentplatform.model.ExperimentStatus;

import java.time.LocalDateTime;

public record UpdateExperimentRequest(
    String title,
    String description,
    DesignType designType,
    LocalDateTime startDate,
    LocalDateTime endDate,
    ExperimentStatus status
) {}
