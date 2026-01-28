package com.charity.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BatchContentUpdateResponse {
    private String message;
    private Integer successCount;
    private Integer failureCount;
    private List<ContentResponse> updatedContent;
    private List<String> errors;
}
