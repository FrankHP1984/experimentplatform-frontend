package com.research.experimentplatform.dto;

import com.research.experimentplatform.model.DesignType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreateExperimentRequest(
    @NotBlank(message = "Title is required")
    String title,
    
    String description,
    
    @NotNull(message = "Design type is required")
    DesignType designType,
    
    LocalDateTime startDate,
    LocalDateTime endDate
) {}
