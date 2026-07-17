package com.zipt.domain.term.dto;

import java.time.LocalDate;
import java.util.List;

public record TermListResponse(
        LocalDate generatedAt,
        long count,
        List<TermResponse.CategoryResponse> categories,
        List<TermResponse> terms,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}