package com.charity.mapper;


import com.charity.dto.request.VolunteerRequest;
import com.charity.dto.response.VolunteerResponse;
import com.charity.entity.Volunteer;

public class VolunteerMapper {
    public static VolunteerResponse toResponse(Volunteer volunteer) {
        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .name(volunteer.getName())
                .email(volunteer.getEmail())
                .phone(volunteer.getPhone())
                .ward(volunteer.getWard())
                .interests(volunteer.getInterests())
                .status(volunteer.getStatus())
                .bio(volunteer.getBio())
                .profileImageUrl(volunteer.getProfileImageUrl())
                .registeredAt(volunteer.getRegisteredAt())
                .lastActiveAt(volunteer.getLastActiveAt())
                .build();
    }

    public static Volunteer toEntity(VolunteerRequest request) {
        Volunteer volunteer = new Volunteer();
        volunteer.setName(request.getName());
        volunteer.setEmail(request.getEmail());
        volunteer.setPhone(request.getPhone());
        volunteer.setWard(request.getWard());
        volunteer.setInterests(request.getInterests());
        volunteer.setStatus(request.getStatus());
        volunteer.setBio(request.getBio());
        volunteer.setProfileImageUrl(request.getProfileImageUrl());
        return volunteer;
    }

    public static void updateEntity(Volunteer volunteer, VolunteerRequest request) {
        if (request.getName() != null) volunteer.setName(request.getName());
        if (request.getEmail() != null) volunteer.setEmail(request.getEmail());
        if (request.getPhone() != null) volunteer.setPhone(request.getPhone());
        if (request.getWard() != null) volunteer.setWard(request.getWard());
        if (request.getInterests() != null) volunteer.setInterests(request.getInterests());
        if (request.getStatus() != null) volunteer.setStatus(request.getStatus());
        if (request.getBio() != null) volunteer.setBio(request.getBio());
        if (request.getProfileImageUrl() != null) volunteer.setProfileImageUrl(request.getProfileImageUrl());
    }
}
