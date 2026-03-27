package com.research.experimentplatform.service;

import com.research.experimentplatform.dto.AuthResponse;
import com.research.experimentplatform.dto.LoginRequest;
import com.research.experimentplatform.dto.RegisterRequest;
import com.research.experimentplatform.dto.UserDTO;
import com.research.experimentplatform.model.User;
import com.research.experimentplatform.repository.UserRepository;
import com.research.experimentplatform.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public UserDTO registerUser(RegisterRequest request) {
        // Primero comprobamos que el email no esté ya registrado en la base de datos
        // Si existe, lanzamos una excepción para que no se pueda crear el usuario
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Creamos el nuevo usuario con los datos que vienen en el request
        User user = new User();
        user.setEmail(request.email());
        // IMPORTANTE: la contraseña se encripta con BCrypt antes de guardarla
        // Nunca se debe guardar la contraseña en texto plano por seguridad
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        // Guardamos el usuario en la base de datos y devolvemos el DTO
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserDTO convertToDTO(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getRole());
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public AuthResponse login(LoginRequest request) {
        // Buscamos el usuario por email en la base de datos
        // Si no existe, lanzamos excepción con mensaje genérico por seguridad
        // (no queremos decir si el email existe o no por temas de seguridad)
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Comprobamos que la contraseña sea correcta
        // passwordEncoder.matches() compara la contraseña en texto plano con la encriptada
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Si todo está bien, generamos un token JWT con los datos del usuario
        // Este token es lo que el cliente usará para autenticarse en las siguientes peticiones
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token);
    }
}
