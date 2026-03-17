package com.charity;

import com.charity.entity.User;
import com.charity.entity.UserRole;
import com.charity.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * FIX #7: Converted from @Component / CommandLineRunner (which ran on every
 * application startup, inserting duplicate test data into the real DB) to a
 * proper @SpringBootTest integration test that runs only during the test phase
 * and rolls back automatically via @Transactional.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void saveAndFindUser() {
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setFullName("Test User");
        testUser.setPhone("+254712345678");
        testUser.setRole(UserRole.VIEWER);
        testUser.setWard("Kibra");

        User saved = userRepository.save(testUser);
        assertThat(saved.getId()).isNotNull();

        User found = userRepository.findByEmail("test@example.com").orElseThrow();
        assertThat(found.getFullName()).isEqualTo("Test User");
    }
}
