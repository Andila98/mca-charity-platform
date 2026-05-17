package com.charity.service;

import com.charity.entity.*;
import com.charity.exception.DonationNotFoundException;
import com.charity.exception.ProjectNotFoundException;
import com.charity.repository.CharityProjectRepository;
import com.charity.repository.DonationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationServiceTest {

    @Mock private DonationRepository donationRepository;
    @Mock private CharityProjectRepository projectRepository;

    @InjectMocks
    private DonationService donationService;

    private CharityProject project;
    private Donation donation;

    @BeforeEach
    void setUp() {
        project = new CharityProject();
        project.setId(1L);
        project.setName("Test Project");

        donation = new Donation();
        donation.setId(1L);
        donation.setDonorName("Jane Doe");
        donation.setAmount(500.0);
        donation.setDonationType(DonationType.CASH);
        donation.setStatus(DonationStatus.PENDING);
    }

    @Test
    void recordDonation_withValidProjectId_linksProject() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));

        Donation result = donationService.recordDonation(donation, 1L);

        assertThat(result.getProject()).isEqualTo(project);
        assertThat(result.getStatus()).isEqualTo(DonationStatus.PENDING);
    }

    @Test
    void recordDonation_withNullProjectId_savesWithoutProject() {
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));

        Donation result = donationService.recordDonation(donation, null);

        assertThat(result.getProject()).isNull();
        verify(projectRepository, never()).findById(any());
    }

    @Test
    void recordDonation_withInvalidProjectId_throwsException() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.recordDonation(donation, 99L))
                .isInstanceOf(ProjectNotFoundException.class);
    }

    @Test
    void getDonationById_whenExists_returnsDonation() {
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));

        Donation result = donationService.getDonationById(1L);

        assertThat(result.getDonorName()).isEqualTo("Jane Doe");
    }

    @Test
    void getDonationById_whenNotFound_throwsException() {
        when(donationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.getDonationById(99L))
                .isInstanceOf(DonationNotFoundException.class);
    }

    @Test
    void updateDonation_preservesExistingStatus() {
        // The existing entity has status RECEIVED
        donation.setStatus(DonationStatus.RECEIVED);
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));

        // The update payload has null status (caller is not changing it)
        Donation updatePayload = new Donation();
        updatePayload.setDonorName("Jane Doe");
        updatePayload.setAmount(500.0);
        updatePayload.setDonationType(DonationType.CASH);
        updatePayload.setStatus(null);

        Donation updated = donationService.updateDonation(1L, updatePayload, null);

        // Status must not have been reset to null
        assertThat(updated.getStatus()).isEqualTo(DonationStatus.RECEIVED);
    }

    @Test
    void deleteDonation_softDeletesRecord() {
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenAnswer(inv -> inv.getArgument(0));

        donationService.deleteDonation(1L);

        assertThat(donation.isDeleted()).isTrue();
        assertThat(donation.getDeletedAt()).isNotNull();
        verify(donationRepository).save(donation);
        verify(donationRepository, never()).delete(any());
        verify(donationRepository, never()).deleteById(any());
    }
}
