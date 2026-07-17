package com.zipt.domain.term.controller;

import com.zipt.domain.term.dto.TermListResponse;
import com.zipt.domain.term.dto.TermResponse;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;
import com.zipt.domain.term.service.TermService;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/terms")
@Tag(name = "Terms", description = "Real estate glossary API")
public class TermController {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final TermService termService;
    private final String s3Key;
    private final String adminToken;

    public TermController(
            TermService termService,
            @Value("${zipt.terms.s3-key:seed/terms.json}") String s3Key,
            @Value("${zipt.terms.admin-token}") String adminToken
    ) {
        this.termService = termService;
        this.s3Key = s3Key;
        this.adminToken = adminToken;
    }

    @Operation(summary = "Search real estate terms")
    @GetMapping
    public ResponseEntity<ApiResponse<TermListResponse>> searchTerms(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "risk", required = false) String risk,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        validatePageRequest(page, size);

        TermListResponse response = termService.search(
                query,
                parseCategory(category),
                parseRiskLevel(risk),
                page,
                size
        );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Get real estate term detail")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TermResponse>> getTerm(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(termService.getByTermId(id)));
    }

    @Operation(summary = "Sync real estate terms from S3")
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Integer>> syncTerms(
            @RequestHeader("X-Admin-Token") String token
    ) {
        // HTTP 요청 헤더의 X-Admin-Token 값과 application.yml에 지정된 관리자 토큰 값을 대조 검증
        if (!adminToken.equals(token)) {
            throw new ZiptException(ErrorCode.UNAUTHORIZED);
        }
        // 검증 성공 시 S3Service를 통해 S3 버킷 내 terms.json을 로드하여 DB 갱신(Upsert) 수행
        int count = termService.syncFromS3(s3Key);
        return ResponseEntity.ok(ApiResponse.ok(count));
    }

    private void validatePageRequest(int page, int size) {
        if (page < DEFAULT_PAGE || size < 1 || size > MAX_SIZE) {
            throw new ZiptException(ErrorCode.INVALID_TERM_SEARCH_CONDITION);
        }
    }

    private TermCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }

        try {
            return TermCategory.from(category);
        } catch (IllegalArgumentException e) {
            throw new ZiptException(ErrorCode.INVALID_TERM_SEARCH_CONDITION);
        }
    }

    private RiskLevel parseRiskLevel(String risk) {
        if (risk == null || risk.isBlank()) {
            return null;
        }

        try {
            return RiskLevel.from(risk);
        } catch (IllegalArgumentException e) {
            throw new ZiptException(ErrorCode.INVALID_TERM_SEARCH_CONDITION);
        }
    }
}
