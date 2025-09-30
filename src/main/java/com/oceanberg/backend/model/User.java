package com.oceanberg.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String userId;   // Unique user login ID

    @Indexed(unique = true)
    private String email;    // Unique email

    private String state;

    private String district;

    private String passwordHash;

    private Set<Role> roles;

    private boolean enabled = true;

    private Instant createdAt;
}
