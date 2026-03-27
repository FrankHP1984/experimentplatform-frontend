package com.research.experimentplatform.controller;

import com.research.experimentplatform.dto.ParticipantDTO;
import com.research.experimentplatform.dto.UpdateParticipantRequest;
import com.research.experimentplatform.service.ParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/participants")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @PostMapping
    public ResponseEntity<ParticipantDTO> createParticipant(Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        ParticipantDTO participant = participantService.createParticipant(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(participant);
    }

    @GetMapping("/me")
    public ResponseEntity<ParticipantDTO> getMyProfile(Authentication authentication) {
        Long userId = (Long) authentication.getDetails();
        ParticipantDTO participant = participantService.getParticipantByUserId(userId);
        return ResponseEntity.ok(participant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ParticipantDTO> getParticipant(@PathVariable Long id) {
        ParticipantDTO participant = participantService.getParticipant(id);
        return ResponseEntity.ok(participant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ParticipantDTO> updateParticipant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateParticipantRequest request) {
        ParticipantDTO participant = participantService.updateParticipant(id, request);
        return ResponseEntity.ok(participant);
    }
}
