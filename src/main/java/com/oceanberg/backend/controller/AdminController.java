package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.User;
import com.oceanberg.backend.dto.UserUpdateRequest;
import com.oceanberg.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // Get all users
    @GetMapping("/all-users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Update user details
    @PutMapping("/update/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId,
                                           @RequestBody UserUpdateRequest request) {
        User updatedUser = adminService.updateUser(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    // Promote user to admin
    @PutMapping("/promote/{userId}")
    public ResponseEntity<User> promoteToAdmin(@PathVariable String userId) {
        User promotedUser = adminService.promoteToAdmin(userId);
        return ResponseEntity.ok(promotedUser);
    }

    // Delete user
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
