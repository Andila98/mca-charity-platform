package com.charity;

import com.charity.entity.User;
import com.charity.entity.UserRole;
import com.charity.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RepositoryTest implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create a test user
        User testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setFullName("Test User");
        testUser.setPhone("+254712345678");
        testUser.setRole(UserRole.VIEWER);
        testUser.setWard("Kibra");

        User saved = userRepository.save(testUser);
        System.out.println("✅ Saved user: " + saved.getId());

        // Find by email
        var found = userRepository.findByEmail("test@example.com");
        System.out.println("✅ Found user: " + found.get().getFullName());
    }
}
