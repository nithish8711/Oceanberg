package com.oceanberg.backend.service;

import com.oceanberg.backend.model.Report;
import com.oceanberg.backend.model.User;
import com.oceanberg.backend.repository.ReportRepository;
import com.oceanberg.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired private ReportRepository reportRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // Save a hazard report
    public Report submitReport(Report report) {
        return reportRepository.save(report);
    }

    // Get all hazard reports
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // Get user by username
    public User getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Change password
    public void changePassword(String username, String newPassword) {
        User user = getByUsername(username);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // Delete account by username
    public void deleteAccount(String username) {
        User user = getByUsername(username); // fetch user or throw exception
        userRepository.delete(user);
    }
}
