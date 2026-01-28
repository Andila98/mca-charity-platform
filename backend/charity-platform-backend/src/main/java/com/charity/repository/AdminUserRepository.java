package com.charity.repository;

import com.charity.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface  AdminUserRepository extends JpaRepository<AdminUser, Long> {
    /**
     * Find admin by username
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * Check if admin exists by username
     */
    boolean existsByUsername(String username);

    /**
     * Find all active admins
     */
    List<AdminUser> findByActiveTrue();
}
