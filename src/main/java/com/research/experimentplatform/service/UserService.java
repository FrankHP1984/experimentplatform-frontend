package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.UserDTO;
import com.research.experimentplatform.model.User;
import com.research.experimentplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public UserDTO convertToDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getRole());
    }
}
