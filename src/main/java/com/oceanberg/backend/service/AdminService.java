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

    // Update user details using userId (not MongoDB _id)
    public User updateUser(String userId, UserUpdateRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getUserId() != null) user.setUserId(request.getUserId()); // allow changing loginId
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getState() != null) user.setState(request.getState());
        if (request.getDistrict() != null) user.setDistrict(request.getDistrict());
        if (request.getPassword() != null)
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());

        return userRepository.save(user);
    }

    // Promote user to admin
    public User promoteToAdmin(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));
        user.getRoles().add(Role.ROLE_ADMIN);
        return userRepository.save(user);
    }

    // Promote user to analytics
    public User promoteToAnalytics(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));
        user.getRoles().add(Role.ROLE_ANALYTICS);
        return userRepository.save(user);
    }

    // Delete user by userId
    public void deleteUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found with userId: " + userId));
        userRepository.delete(user);
    }
}
