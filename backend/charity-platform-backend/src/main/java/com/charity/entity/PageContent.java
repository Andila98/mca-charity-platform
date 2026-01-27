package com.charity.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "Pagecontent" , indexes = {
        @Index(name = "idx_content_key", columnList = "content_key"),
        @Index(name = "idx_page_name", columnList = "page_name")
})
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Content Key is  Required")
    @Column(unique = true, length = 255)
    private String contentKey;

    @Column(columnDefinition = "LongText")
    @NotBlank(message = "Content Value is required")
    private String contentValue;

    @NotBlank(message = "Page name required")
    @Column(length = 100)
    private String pageName;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id", nullable = false)
    private AdminUser updatedBy;

    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "INT DEFAULT 0")
    private  Integer updateCount;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        updateCount = 0;
    }

    @PrePersist
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updateCount =  updateCount !=null? updateCount+1:1;
    }
}
