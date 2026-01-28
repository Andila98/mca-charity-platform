package com.charity.repository;

import com.charity.entity.PageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageContentRepository extends JpaRepository<PageContent, Long> {
    /**
     * Find content by unique content key
     */
    Optional<PageContent> findByContentKey(String contentKey);

    /**
     * Check if content key exists
     */
    boolean existsByContentKey(String contentKey);

    /**
     * Find all content for a specific page
     */
    List<PageContent> findByPageName(String pageName);

    /**
     * Find all content for a page, sorted by key
     */
    @Query("SELECT p FROM PageContent p WHERE p.pageName = :pageName ORDER BY p.contentKey ASC")
    List<PageContent> findByPageNameOrderByKey(@Param("pageName") String pageName);

    /**
     * Find recent updates to any page
     */
    @Query("SELECT p FROM PageContent p ORDER BY p.updatedAt DESC LIMIT 20")
    List<PageContent> findRecentUpdates();

    /**
     * Find all updates by a specific admin
     */
    @Query("SELECT p FROM PageContent p WHERE p.updatedBy.id = :adminId ORDER BY p.updatedAt DESC")
    List<PageContent> findUpdatedByAdmin(@Param("adminId") Long adminId);

    /**
     * Search content by key or value
     */
    @Query("SELECT p FROM PageContent p WHERE p.contentKey LIKE CONCAT('%', :search, '%') OR p.contentValue LIKE CONCAT('%', :search, '%')")
    List<PageContent> searchContent(@Param("search") String search);

    /**
     * Get content count for a page
     */
    long countByPageName(String pageName);
}
