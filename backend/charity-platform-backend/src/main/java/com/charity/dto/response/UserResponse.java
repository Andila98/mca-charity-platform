package com.charity.dto.response;

import com.charity.entity.UserRole;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private String ward;
    private String profileImageUrl;
    private Boolean approved;
    private LocalDateTime createdAt;
}
