package com.oceanberg.backend.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String userId;
    private String email;
    private String state;
    private String district;
    private String password;
    private Boolean enabled;
}
