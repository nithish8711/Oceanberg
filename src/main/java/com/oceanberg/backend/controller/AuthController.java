package com.oceanberg.backend.controller;

import com.oceanberg.backend.dto.LoginRequest;
import com.oceanberg.backend.dto.SignupRequest;
import com.oceanberg.backend.dto.JwtResponse;
import com.oceanberg.backend.model.User;
import com.oceanberg.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // User Registration
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
