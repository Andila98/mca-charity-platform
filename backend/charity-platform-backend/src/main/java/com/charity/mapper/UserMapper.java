package com.charity.mapper;

import com.charity.dto.request.RegisterRequest;
import com.charity.dto.request.UserRequest;
import com.charity.dto.response.UserResponse;
import com.charity.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .ward(user.getWard())
                .profileImageUrl(user.getProfileImageUrl())
                .approved(user.isApproved())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static User toEntity(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setWard(request.getWard());
        user.setRole(request.getRole());
        user.setApproved(false); // Default: not approved
        return user;
    }

    public static void updateEntity(User user, UserRequest request) {
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getWard() != null) user.setWard(request.getWard());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getApproved() != null) user.setApproved(request.getApproved());
        if (request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
    }
}
