package com.charity.dto.request;


import com.charity.entity.DonationStatus;
import com.charity.entity.DonationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DonationRequest {

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Donor name is required")
    private String donorName;

    private String donorEmail;
    private String donorPhone;
    private String donorWard;

    @NotNull(message = "Donation type is required")
    private DonationType donationType;

    private String itemDescription; // For ITEM donations
    private Long projectId; // Optional: link to a project
    private DonationStatus status;
    private String notes;

}
