package com.mcacampaignplatform.volunteerservices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String ward;
    private String interest;
    private String status;
    private LocalDateTime createdAt;
}

