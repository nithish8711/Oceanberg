package com.oceanberg.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String userId;
    private String email;
    private Set<String> roles;  // USER, ADMIN, ANALYTICS
}
