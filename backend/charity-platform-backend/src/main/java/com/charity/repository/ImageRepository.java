package com.charity.repository;

import com.charity.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    /**
     * Find image by unique image key
     */
    Optional<Image> findByImageKey(String imageKey);

    /**
     * Check if image key exists
     */
    boolean existsByImageKey(String imageKey);

    /**
     * Find all active images for a page
     */
    List<Image> findByPageNameAndStatus(String pageName, String status);

    /**
     * Find all images for a page
     */
    List<Image> findByPageName(String pageName);

    /**
     * Find all images uploaded by a specific admin
     */
    @Query("SELECT i FROM Image i WHERE i.uploadedBy.id = :adminId ORDER BY i.uploadedAt DESC")
    List<Image> findUploadedByAdmin(@Param("adminId") Long adminId);

    /**
     * Find recent uploads
     */
    @Query("SELECT i FROM Image i WHERE i.status = 'active' ORDER BY i.uploadedAt DESC LIMIT 20")
    List<Image> findRecentUploads();

    /**
     * Search images by name or alt text
     */
    @Query("SELECT i FROM Image i WHERE i.imageName LIKE CONCAT('%', :search, '%') OR i.altText LIKE CONCAT('%', :search, '%')")
    List<Image> searchImages(@Param("search") String search);

    /**
     * Get count of images for a page
     */
    long countByPageName(String pageName);

    /**
     * Get total storage used (sum of file sizes)
     */
    @Query("SELECT COALESCE(SUM(i.fileSize), 0) FROM Image i")
    long getTotalStorageUsed();
}