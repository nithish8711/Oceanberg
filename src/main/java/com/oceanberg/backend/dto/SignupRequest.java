package com.oceanberg.backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String userId;
    private String email;
    private String state;
    private String district;
    private String password;
}
