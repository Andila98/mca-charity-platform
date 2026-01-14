package com.charity.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private String message;
}
