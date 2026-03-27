package com.research.experimentplatform.controller;

import com.research.experimentplatform.dto.CreateExperimentRequest;
import com.research.experimentplatform.dto.CreateGroupRequest;
import com.research.experimentplatform.dto.CreatePhaseRequest;
import com.research.experimentplatform.dto.ExperimentDTO;
import com.research.experimentplatform.dto.GroupDTO;
import com.research.experimentplatform.dto.PhaseDTO;
import com.research.experimentplatform.dto.UpdateExperimentRequest;
import com.research.experimentplatform.service.ExperimentService;
import com.research.experimentplatform.service.GroupService;
import com.research.experimentplatform.service.PhaseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments")
public class ExperimentController {

    private final ExperimentService experimentService;
    private final GroupService groupService;
    private final PhaseService phaseService;

    public ExperimentController(ExperimentService experimentService, GroupService groupService, PhaseService phaseService) {
        this.experimentService = experimentService;
        this.groupService = groupService;
        this.phaseService = phaseService;
    }

    @PostMapping
    public ResponseEntity<ExperimentDTO> createExperiment(
            @Valid @RequestBody CreateExperimentRequest request,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getDetails();
        ExperimentDTO experiment = experimentService.createExperiment(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(experiment);
    }

    @GetMapping
    public ResponseEntity<Page<ExperimentDTO>> getAllExperiments(Pageable pageable) {
        Page<ExperimentDTO> experiments = experimentService.getAllExperiments(pageable);
        return ResponseEntity.ok(experiments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperimentDTO> getExperiment(@PathVariable Long id) {
        ExperimentDTO experiment = experimentService.getExperiment(id);
        return ResponseEntity.ok(experiment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperimentDTO> updateExperiment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExperimentRequest request) {
        ExperimentDTO experiment = experimentService.updateExperiment(id, request);
        return ResponseEntity.ok(experiment);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExperiment(@PathVariable Long id) {
        experimentService.deleteExperiment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{experimentId}/groups")
    public ResponseEntity<GroupDTO> addGroup(
            @PathVariable Long experimentId,
            @Valid @RequestBody CreateGroupRequest request) {
        GroupDTO group = groupService.createGroup(experimentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    @GetMapping("/{experimentId}/groups")
    public ResponseEntity<List<GroupDTO>> getGroups(@PathVariable Long experimentId) {
        List<GroupDTO> groups = groupService.getGroupsByExperiment(experimentId);
        return ResponseEntity.ok(groups);
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{experimentId}/phases")
    public ResponseEntity<PhaseDTO> addPhase(
            @PathVariable Long experimentId,
            @Valid @RequestBody CreatePhaseRequest request) {
        PhaseDTO phase = phaseService.createPhase(experimentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(phase);
    }

    @GetMapping("/{experimentId}/phases")
    public ResponseEntity<List<PhaseDTO>> getPhases(@PathVariable Long experimentId) {
        List<PhaseDTO> phases = phaseService.getPhasesByExperiment(experimentId);
        return ResponseEntity.ok(phases);
    }

    @DeleteMapping("/phases/{phaseId}")
    public ResponseEntity<Void> deletePhase(@PathVariable Long phaseId) {
        phaseService.deletePhase(phaseId);
        return ResponseEntity.noContent().build();
    }

}
