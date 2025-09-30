package com.oceanberg.backend.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String userId;   // login with userId
    private String password;
}
