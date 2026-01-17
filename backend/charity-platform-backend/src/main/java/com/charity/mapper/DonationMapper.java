package com.charity.mapper;


import com.charity.dto.request.DonationRequest;
import com.charity.dto.response.DonationResponse;
import com.charity.entity.CharityProject;
import com.charity.entity.Donation;

public class DonationMapper {

    public static DonationResponse toResponse(Donation donation) {
        DonationResponse.DonationResponseBuilder builder = DonationResponse.builder()
                .id(donation.getId())
                .amount(donation.getAmount())
                .donorName(donation.getDonorName())
                .donorEmail(donation.getDonorEmail())
                .donorPhone(donation.getDonorPhone())
                .donorWard(donation.getDonorWard())
                .donationType(donation.getDonationType())
                .itemDescription(donation.getItemDescription())
                .status(donation.getStatus())
                .notes(donation.getNotes())
                .donatedAt(donation.getDonatedAt())
                .receivedAt(donation.getReceivedAt());

        // Add project info if exists
        if (donation.getProject() != null) {
            builder.projectId(donation.getProject().getId())
                    .projectName(donation.getProject().getName());
        }

        return builder.build();
    }

    public static Donation toEntity(DonationRequest request, CharityProject project) {
        Donation donation = new Donation();
        donation.setAmount(request.getAmount());
        donation.setDonorName(request.getDonorName());
        donation.setDonorEmail(request.getDonorEmail());
        donation.setDonorPhone(request.getDonorPhone());
        donation.setDonorWard(request.getDonorWard());
        donation.setDonationType(request.getDonationType());
        donation.setItemDescription(request.getItemDescription());
        donation.setStatus(request.getStatus());
        donation.setNotes(request.getNotes());
        donation.setProject(project); // Can be null
        return donation;
    }

    public static void updateEntity(Donation donation, DonationRequest request, CharityProject project) {
        if (request.getAmount() != null) donation.setAmount(request.getAmount());
        if (request.getDonorName() != null) donation.setDonorName(request.getDonorName());
        if (request.getDonorEmail() != null) donation.setDonorEmail(request.getDonorEmail());
        if (request.getDonorPhone() != null) donation.setDonorPhone(request.getDonorPhone());
        if (request.getDonorWard() != null) donation.setDonorWard(request.getDonorWard());
        if (request.getDonationType() != null) donation.setDonationType(request.getDonationType());
        if (request.getItemDescription() != null) donation.setItemDescription(request.getItemDescription());
        if (request.getStatus() != null) donation.setStatus(request.getStatus());
        if (request.getNotes() != null) donation.setNotes(request.getNotes());
        if (project != null) donation.setProject(project);
    }
}
