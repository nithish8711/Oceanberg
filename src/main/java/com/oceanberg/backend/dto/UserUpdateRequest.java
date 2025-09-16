package com.oceanberg.backend.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String username;
    private String email;
    private String password;
    private Boolean enabled;
}
