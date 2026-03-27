package com.research.experimentplatform.dto;

import com.research.experimentplatform.model.DesignType;
import com.research.experimentplatform.model.ExperimentStatus;

import java.time.LocalDateTime;

public class ExperimentDTO {

    private Long id;
    private String title;
    private String description;
    private DesignType designType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ExperimentStatus status;
    private Long ownerId;

    public ExperimentDTO() {
    }

    public ExperimentDTO(Long id, String title, String description, DesignType designType, 
                         LocalDateTime startDate, LocalDateTime endDate, ExperimentStatus status, Long ownerId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.designType = designType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.ownerId = ownerId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DesignType getDesignType() {
        return designType;
    }

    public void setDesignType(DesignType designType) {
        this.designType = designType;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public ExperimentStatus getStatus() {
        return status;
    }

    public void setStatus(ExperimentStatus status) {
        this.status = status;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
