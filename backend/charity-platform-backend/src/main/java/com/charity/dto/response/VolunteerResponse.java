package com.charity.dto.response;

import com.charity.entity.VolunteerStatus;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String ward;
    private List<String> interests;
    private VolunteerStatus status;
    private String bio;
    private String profileImageUrl;
    private LocalDateTime registeredAt;
    private LocalDateTime lastActiveAt;
}
