package com.mcacampaignplatform.volunteerservices.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVolunteerRequest {

    private String name;
    private String phone;
    private String email;
    private String ward;
    private String interest;
}
