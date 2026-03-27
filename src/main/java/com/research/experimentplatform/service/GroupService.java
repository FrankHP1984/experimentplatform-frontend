package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.CreateGroupRequest;
import com.research.experimentplatform.dto.GroupDTO;
import com.research.experimentplatform.model.Experiment;
import com.research.experimentplatform.model.Group;
import com.research.experimentplatform.repository.ExperimentRepository;
import com.research.experimentplatform.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final ExperimentRepository experimentRepository;

    public GroupService(GroupRepository groupRepository, ExperimentRepository experimentRepository) {
        this.groupRepository = groupRepository;
        this.experimentRepository = experimentRepository;
    }

    @Transactional
    public GroupDTO createGroup(Long experimentId, CreateGroupRequest request) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new IllegalArgumentException("Experiment not found"));

        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setExperiment(experiment);

        Group savedGroup = groupRepository.save(group);
        return convertToDTO(savedGroup);
    }

    public List<GroupDTO> getGroupsByExperiment(Long experimentId) {
        return groupRepository.findByExperimentId(experimentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GroupDTO getGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return convertToDTO(group);
    }

    @Transactional
    public void deleteGroup(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new IllegalArgumentException("Group not found");
        }
        groupRepository.deleteById(id);
    }

    public GroupDTO convertToDTO(Group group) {
        return new GroupDTO(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getExperiment().getId()
        );
    }
}
