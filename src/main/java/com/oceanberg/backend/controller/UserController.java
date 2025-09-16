package com.oceanberg.backend.controller;

import com.oceanberg.backend.model.User;
import com.oceanberg.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get currently logged-in user
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<User> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Change password for currently logged-in user
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> changePassword(@RequestParam String newPassword) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.changePassword(username, newPassword);
        return ResponseEntity.ok("Password changed successfully");
    }

    // Delete currently logged-in user account
    @DeleteMapping("/delete-account")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        userService.deleteAccount(username);
        return ResponseEntity.ok("Account deleted successfully");
    }

}
