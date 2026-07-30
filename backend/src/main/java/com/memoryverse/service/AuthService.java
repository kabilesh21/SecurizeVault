package com.memoryverse.service;

import com.memoryverse.dto.AuthResponse;
import com.memoryverse.dto.ForgotPasswordRequest;
import com.memoryverse.dto.ResetPasswordRequest;
import com.memoryverse.dto.LoginRequest;
import com.memoryverse.dto.RegisterRequest;
import com.memoryverse.entity.User;
import com.memoryverse.exception.ApiException;
import com.memoryverse.repository.UserRepository;
import com.memoryverse.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(loginRequest.getUsernameOrEmail())
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found")));

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email Address already in use!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role("ROLE_STUDENT")
                .build();

        userRepository.save(user);
    }

    @Autowired
    private JavaMailSender mailSender;

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user found with email: " + request.getEmail()));
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("postmanmail21@gmail.com");
            message.setTo(user.getEmail());
            message.setSubject("MemoryVerse AI - Password Reset Request");
            message.setText("Hello " + user.getUsername() + ",\n\n"
                    + "You requested a password reset for your MemoryVerse AI account.\n\n"
                    + "Click the link below to reset your password:\n"
                    + "http://localhost:5173/reset-password?email=" + user.getEmail() + "\n\n"
                    + "If you did not request this, please ignore this email.\n\n"
                    + "Warm regards,\n"
                    + "MemoryVerse Team");
            
            mailSender.send(message);
            System.out.println("[MemoryVerse] Password reset email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            // Log the error but do NOT crash the user flow.
            // To fix: Go to your Google Account > Security > App Passwords,
            // generate a 16-char App Password for "Mail", and paste it in application.properties.
            System.err.println("[MemoryVerse] Email send failed (check App Password config): " + e.getMessage());
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user found with email: " + request.getEmail()));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        System.out.println("[MemoryVerse] Password reset successfully for user: " + user.getEmail());
    }
}

