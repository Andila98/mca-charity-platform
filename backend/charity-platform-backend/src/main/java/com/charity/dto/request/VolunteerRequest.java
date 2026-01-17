package com.charity.dto.request;

import com.charity.entity.VolunteerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class VolunteerRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Ward is required")
    private String ward;

    private List<String> interests;
    private VolunteerStatus status;
    private String bio;
    private String profileImageUrl;
}
