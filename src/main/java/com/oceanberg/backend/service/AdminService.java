package com.oceanberg.backend.service;

import com.oceanberg.backend.dto.UserUpdateRequest;
import com.oceanberg.backend.model.Role;
import com.oceanberg.backend.model.User;
import com.oceanberg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Update user details
    public User updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getPassword() != null)
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());

        return userRepository.save(user);
    }

    // Promote user to admin
    public User promoteToAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.getRoles().add(Role.ROLE_ADMIN);
        return userRepository.save(user);
    }

    // Delete user
    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }
}
