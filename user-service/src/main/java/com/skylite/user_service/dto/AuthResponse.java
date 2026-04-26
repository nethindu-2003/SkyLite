package com.skylite.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;      // The JWT Token
    private String message;
    private Integer userId;
    private String name;
    private String role;       // e.g., "USER" or "ADMIN"
}