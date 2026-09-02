package com.memoryverse.service;

import com.memoryverse.dto.AuthResponse;
import com.memoryverse.dto.ForgotPasswordRequest;
import com.memoryverse.dto.ResetPasswordRequest;
import com.memoryverse.dto.LoginRequest;
import com.memoryverse.dto.RegisterRequest;
import com.memoryverse.dto.ChangePasswordRequest;
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
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest loginRequest) {
        boolean exists = userRepository.existsByUsername(loginRequest.getUsernameOrEmail())
                || userRepository.existsByEmail(loginRequest.getUsernameOrEmail());
        if (!exists) {
            throw new ApiException(HttpStatus.NOT_FOUND, "username not found");
        }

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
                .name(registerRequest.getName())
                .college(registerRequest.getCollege())
                .age(registerRequest.getAge())
                .dob(registerRequest.getDob())
                .build();

        userRepository.save(user);
    }

    @Autowired
    private JavaMailSender mailSender;

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user found with email: " + request.getEmail()));
        
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            
            helper.setFrom("postmanmail21@gmail.com");
            helper.setTo(user.getEmail());
            helper.setSubject("🔑 SecurizeVault - Password Reset Request 🔒");
            
            String htmlContent = "<div style=\"font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 24px; color: #1E293B;\">"
                    + "  <div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "    <h2 style=\"color: #0F172A; font-size: 24px; font-weight: 800; margin: 0;\">Securize<span style=\"color: #0EA5E9;\">Vault</span></h2>"
                    + "  </div>"
                    + "  <hr style=\"border: none; border-top: 1.5px solid #F1F5F9; margin-bottom: 24px;\" />"
                    + "  <h3 style=\"color: #1E293B; font-size: 18px; font-weight: 700; margin-top: 0;\">Hello " + user.getUsername() + " 👋,</h3>"
                    + "  <p style=\"font-size: 14px; line-height: 1.6; color: #475569;\">You requested a password reset for your <strong>SecurizeVault</strong> account. Don't worry, we've got you covered! 🔒</p>"
                    + "  <p style=\"font-size: 14px; line-height: 1.6; color: #475569;\">Click the button below to securely reset your credentials and log back in:</p>"
                    + "  <div style=\"text-align: center; margin: 30px 0;\">"
                    + "    <a href=\"" + frontendUrl + "/reset-password?email=" + user.getEmail() + "\" style=\"display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%); color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25); text-transform: uppercase; letter-spacing: 0.5px;\">Reset Password 🔑</a>"
                    + "  </div>"
                    + "  <p style=\"font-size: 12px; color: #64748B; line-height: 1.6;\">If the button above does not work, copy and paste this link into your web browser:</p>"
                    + "  <p style=\"font-size: 12px; color: #0EA5E9; word-break: break-all;\"><a href=\"" + frontendUrl + "/reset-password?email=" + user.getEmail() + "\" style=\"color: #0EA5E9; text-decoration: underline;\">" + frontendUrl + "/reset-password?email=" + user.getEmail() + "</a></p>"
                    + "  <p style=\"font-size: 12px; color: #94A3B8; margin-top: 24px;\">If you did not make this request, please ignore this email. Your credentials remain safe.</p>"
                    + "  <hr style=\"border: none; border-top: 1.5px solid #F1F5F9; margin: 24px 0;\" />"
                    + "  <p style=\"font-size: 12px; color: #64748B; text-align: center; margin: 0;\">Warm regards,<br /><strong>SecurizeVault Security Team</strong></p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            System.out.println("[MemoryVerse] Password reset email sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("[MemoryVerse] Email send failed (check App Password config): " + e.getMessage());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send reset email: " + e.getMessage());
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user found with email: " + request.getEmail()));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        System.out.println("[MemoryVerse] Password reset successfully for user: " + user.getEmail());
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password does not match!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        System.out.println("[MemoryVerse] Password changed successfully for user: " + user.getUsername());
    }
}

