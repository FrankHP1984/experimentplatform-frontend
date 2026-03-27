package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.CreateExperimentRequest;
import com.research.experimentplatform.dto.ExperimentDTO;
import com.research.experimentplatform.dto.UpdateExperimentRequest;
import com.research.experimentplatform.model.Experiment;
import com.research.experimentplatform.model.ExperimentStatus;
import com.research.experimentplatform.model.User;
import com.research.experimentplatform.repository.ExperimentRepository;
import com.research.experimentplatform.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

@Service
public class ExperimentService {

    private static final Map<ExperimentStatus, Set<ExperimentStatus>> VALID_TRANSITIONS = Map.of(
            ExperimentStatus.DRAFT, Set.of(ExperimentStatus.ACTIVE),
            ExperimentStatus.ACTIVE, Set.of(ExperimentStatus.FINISHED),
            ExperimentStatus.FINISHED, Set.of()
    );

    private final ExperimentRepository experimentRepository;
    private final UserRepository userRepository;

    public ExperimentService(ExperimentRepository experimentRepository, UserRepository userRepository) {
        this.experimentRepository = experimentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ExperimentDTO createExperiment(CreateExperimentRequest request, Long ownerId) {
        // Primero buscamos el usuario que va a ser el dueño del experimento
        // El ownerId nos llega desde el JWT del usuario autenticado
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Owner not found"));

        // Creamos el experimento con los datos del request
        // Todos los experimentos empiezan en estado DRAFT por defecto
        // hasta que el investigador los active manualmente
        Experiment experiment = new Experiment();
        experiment.setTitle(request.title());
        experiment.setDescription(request.description());
        experiment.setDesignType(request.designType());
        experiment.setStartDate(request.startDate());
        experiment.setEndDate(request.endDate());
        experiment.setStatus(ExperimentStatus.DRAFT);
        experiment.setOwner(owner);

        // Guardamos en la base de datos y devolvemos el DTO
        Experiment created = experimentRepository.save(experiment);
        return convertToDTO(created);
    }

    public ExperimentDTO getExperiment(Long id) {
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Experiment not found"));
        return convertToDTO(experiment);
    }

    public Page<ExperimentDTO> getAllExperiments(Pageable pageable) {
        return experimentRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public Page<ExperimentDTO> getExperimentsByOwner(Long ownerId, Pageable pageable) {
        return experimentRepository.findByOwnerId(ownerId, pageable)
                .map(this::convertToDTO);
    }

    @Transactional
    public ExperimentDTO updateExperiment(Long id, UpdateExperimentRequest request) {
        // Primero buscamos el experimento que queremos actualizar
        Experiment experiment = experimentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Experiment not found"));

        // Hacemos una actualización parcial: solo modificamos los campos que vienen en el request
        // Si un campo es null, significa que no queremos cambiarlo
        // Esto es útil para que el cliente pueda actualizar solo lo que necesite
        if (request.title() != null) {
            experiment.setTitle(request.title());
        }
        if (request.description() != null) {
            experiment.setDescription(request.description());
        }
        if (request.designType() != null) {
            experiment.setDesignType(request.designType());
        }
        if (request.startDate() != null) {
            experiment.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            experiment.setEndDate(request.endDate());
        }
        if (request.status() != null) {
            // Antes de cambiar el estado, validamos que la transición sea válida
            // Por ejemplo, no se puede pasar de FINISHED a DRAFT
            validateStatusTransition(experiment.getStatus(), request.status());
            experiment.setStatus(request.status());
        }

        // Guardamos los cambios en la base de datos
        Experiment result = experimentRepository.save(experiment);
        return convertToDTO(result);
    }

    @Transactional
    public void deleteExperiment(Long id) {
        if (!experimentRepository.existsById(id)) {
            throw new IllegalArgumentException("Experiment not found");
        }
        experimentRepository.deleteById(id);
    }

    private void validateStatusTransition(ExperimentStatus currentStatus, ExperimentStatus newStatus) {
        if (currentStatus == newStatus) {
            return;
        }
        Set<ExperimentStatus> allowed = VALID_TRANSITIONS.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }

    public ExperimentDTO convertToDTO(Experiment experiment) {
        return new ExperimentDTO(
                experiment.getId(),
                experiment.getTitle(),
                experiment.getDescription(),
                experiment.getDesignType(),
                experiment.getStartDate(),
                experiment.getEndDate(),
                experiment.getStatus(),
                experiment.getOwner().getId()
        );
    }
}
