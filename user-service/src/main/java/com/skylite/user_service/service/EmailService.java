package com.skylite.user_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Welcome to Sky Lite Cinema - Verify Your Account");

            // The verification link points back to the API Gateway
            String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + token;

            // Beautiful HTML Email Template matching the Digital Noir theme
            String htmlContent = """
                <div style="font-family: Arial, sans-serif; background-color: #131314; color: #ffffff; padding: 40px 20px; text-align: center;">
                    <div style="max-w-width: 600px; margin: 0 auto; background-color: #1e1e20; padding: 40px; border-radius: 16px; border: 1px solid #333;">
                        <h1 style="color: #ffffff; margin-bottom: 10px;">Welcome to <span style="color: #e50914;">Sky Lite</span></h1>
                        <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Hello %s,<br><br>
                            Your cinematic journey awaits. Please verify your email address to activate your account and gain access to premium bookings.
                        </p>
                        <a href="%s" style="background-color: #e50914; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">
                            Verify Account
                        </a>
                        <p style="color: #666; font-size: 12px; margin-top: 40px;">
                            If you did not request this account, you can safely ignore this email.
                        </p>
                    </div>
                </div>
                """.formatted(name, verificationUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email.", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Sky Lite Cinema - Password Reset");

            // This link will point to a new React page you will create (e.g., ResetPassword.jsx)
            String resetUrl = "http://localhost:5173/reset-password?token=" + token;

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; background-color: #131314; color: #ffffff; padding: 40px 20px; text-align: center;">
                    <h2 style="color: #ffffff;">Password Reset Request</h2>
                    <p style="color: #a1a1aa;">Hi %s, click the link below to reset your password. This link expires in 15 minutes.</p>
                    <a href="%s" style="background-color: #e9c349; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 20px;">Reset Password</a>
                </div>
                """.formatted(name, resetUrl);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send reset email");
        }
    }
}