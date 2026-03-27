package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.CreateQuestionRequest;
import com.research.experimentplatform.dto.QuestionDTO;
import com.research.experimentplatform.model.Phase;
import com.research.experimentplatform.model.Question;
import com.research.experimentplatform.repository.PhaseRepository;
import com.research.experimentplatform.repository.QuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final PhaseRepository phaseRepository;

    public QuestionService(QuestionRepository questionRepository, PhaseRepository phaseRepository) {
        this.questionRepository = questionRepository;
        this.phaseRepository = phaseRepository;
    }

    @Transactional
    public QuestionDTO createQuestion(Long phaseId, CreateQuestionRequest request) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found"));

        Question question = new Question();
        question.setText(request.getText());
        question.setType(request.getType());
        question.setOptions(request.getOptions());
        question.setMinValue(request.getMinValue());
        question.setMaxValue(request.getMaxValue());
        question.setRequired(request.getRequired() != null ? request.getRequired() : false);
        question.setPhase(phase);
        question.setQuestionOrder(request.getQuestionOrder());

        Question savedQuestion = questionRepository.save(question);
        return convertToDTO(savedQuestion);
    }

    public List<QuestionDTO> getQuestionsByPhase(Long phaseId) {
        return questionRepository.findByPhaseIdOrderByQuestionOrderAsc(phaseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuestionDTO getQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        return convertToDTO(question);
    }

    @Transactional
    public QuestionDTO updateQuestion(Long id, CreateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (request.getText() != null) {
            question.setText(request.getText());
        }
        if (request.getType() != null) {
            question.setType(request.getType());
        }
        if (request.getOptions() != null) {
            question.setOptions(request.getOptions());
        }
        if (request.getMinValue() != null) {
            question.setMinValue(request.getMinValue());
        }
        if (request.getMaxValue() != null) {
            question.setMaxValue(request.getMaxValue());
        }
        if (request.getRequired() != null) {
            question.setRequired(request.getRequired());
        }
        if (request.getQuestionOrder() != null) {
            question.setQuestionOrder(request.getQuestionOrder());
        }

        Question updatedQuestion = questionRepository.save(question);
        return convertToDTO(updatedQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new IllegalArgumentException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    public long countQuestionsByPhase(Long phaseId) {
        return questionRepository.countByPhaseId(phaseId);
    }

    public QuestionDTO convertToDTO(Question question) {
        return new QuestionDTO(
                question.getId(),
                question.getText(),
                question.getType(),
                question.getOptions(),
                question.getMinValue(),
                question.getMaxValue(),
                question.getRequired(),
                question.getPhase().getId(),
                question.getQuestionOrder()
        );
    }
}
