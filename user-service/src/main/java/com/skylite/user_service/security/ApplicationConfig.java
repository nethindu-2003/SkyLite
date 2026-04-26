package com.skylite.user_service.security;

import com.skylite.user_service.repository.AdminRepository;
import com.skylite.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.SecureRandom;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            // 1. Try to find a User
            var userOptional = userRepository.findByEmail(username);
            if (userOptional.isPresent()) {
                var u = userOptional.get();
                return org.springframework.security.core.userdetails.User.builder()
                        .username(u.getEmail())
                        .password(u.getPassword())
                        .authorities("USER")
                        .build();
            }

            // 2. If not a User, try to find an Admin
            var adminOptional = adminRepository.findByEmail(username);
            if (adminOptional.isPresent()) {
                var a = adminOptional.get();
                return org.springframework.security.core.userdetails.User.builder()
                        .username(a.getEmail())
                        .password(a.getPassword())
                        .authorities("ADMIN")
                        .build();
            }

            throw new UsernameNotFoundException("User or Admin not found with email: " + username);
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // 12 is the strength (cost factor). It automatically generates a secure random salt for every hash.
        return new BCryptPasswordEncoder(12, new SecureRandom());
    }


}