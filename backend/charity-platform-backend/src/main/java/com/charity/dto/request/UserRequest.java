package com.charity.dto.request;

import com.charity.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRequest {

    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String ward;
    private UserRole role;
    private Boolean approved;
    private String profileImageUrl;
}
