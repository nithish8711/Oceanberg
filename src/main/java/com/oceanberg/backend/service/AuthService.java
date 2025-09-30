package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.LoginRequest;
import com.oceanberg.backend.dto.SignupRequest;
import com.oceanberg.backend.dto.LoginResponse;
import com.oceanberg.backend.model.Role;
import com.oceanberg.backend.model.User;
import com.oceanberg.backend.repository.UserRepository;
import com.oceanberg.backend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;

    public User register(SignupRequest request) {
        User user = User.builder()
                .name(request.getName())
                .userId(request.getUserId())
                .email(request.getEmail())
                .state(request.getState())
                .district(request.getDistrict())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singleton(Role.ROLE_USER)) // default role
                .enabled(true)
                .createdAt(Instant.now())
                .build();
        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUserId(), request.getPassword()
                )
        );

        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(authentication);

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getEmail(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
        );
    }
}
