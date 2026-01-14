package com.charity.dto.response;


import com.charity.entity.DonationStatus;
import com.charity.entity.DonationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {

    private Long id;
    private Double amount;
    private String donorName;
    private String donorEmail;
    private String donorPhone;
    private String donorWard;
    private DonationType donationType;
    private String itemDescription;
    private Long projectId;
    private String projectName; // Optional: project name if linked
    private DonationStatus status;
    private String notes;
    private LocalDateTime donatedAt;
    private LocalDateTime receivedAt;
}
