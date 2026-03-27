package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.CreatePhaseRequest;
import com.research.experimentplatform.dto.PhaseDTO;
import com.research.experimentplatform.model.Experiment;
import com.research.experimentplatform.model.Phase;
import com.research.experimentplatform.repository.ExperimentRepository;
import com.research.experimentplatform.repository.PhaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhaseService {

    private final PhaseRepository phaseRepository;
    private final ExperimentRepository experimentRepository;

    public PhaseService(PhaseRepository phaseRepository, ExperimentRepository experimentRepository) {
        this.phaseRepository = phaseRepository;
        this.experimentRepository = experimentRepository;
    }

    @Transactional
    public PhaseDTO createPhase(Long experimentId, CreatePhaseRequest request) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new IllegalArgumentException("Experiment not found"));

        Phase phase = new Phase();
        phase.setName(request.getName());
        phase.setPhaseOrder(request.getPhaseOrder());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setExperiment(experiment);

        Phase savedPhase = phaseRepository.save(phase);
        return convertToDTO(savedPhase);
    }

    public List<PhaseDTO> getPhasesByExperiment(Long experimentId) {
        return phaseRepository.findByExperimentIdOrderByPhaseOrderAsc(experimentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PhaseDTO getPhase(Long id) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found"));
        return convertToDTO(phase);
    }

    @Transactional
    public void deletePhase(Long id) {
        if (!phaseRepository.existsById(id)) {
            throw new IllegalArgumentException("Phase not found");
        }
        phaseRepository.deleteById(id);
    }

    public PhaseDTO convertToDTO(Phase phase) {
        return new PhaseDTO(
                phase.getId(),
                phase.getName(),
                phase.getPhaseOrder(),
                phase.getStartDate(),
                phase.getEndDate(),
                phase.getExperiment().getId()
        );
    }
}
