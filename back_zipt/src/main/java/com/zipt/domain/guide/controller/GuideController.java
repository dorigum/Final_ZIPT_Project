package com.zipt.domain.guide.controller;

import com.zipt.domain.guide.dto.GuideListResponse;
import com.zipt.domain.guide.service.GuideService;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/guides")
@Tag(name = "Guides", description = "부동산 계약 가이드 API")
public class GuideController {

    private final GuideService guideService;
    private final String s3Key;
    private final String adminToken;

    public GuideController(
            GuideService guideService,
            @Value("${zipt.guides.s3-key:seed/guides.json}") String s3Key,
            @Value("${zipt.guides.admin-token}") String adminToken
    ) {
        this.guideService = guideService;
        this.s3Key = s3Key;
        this.adminToken = adminToken;
    }

    @Operation(summary = "부동산 계약 가이드 목록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<GuideListResponse>> listGuides(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "q", required = false) String query
    ) {
        return ResponseEntity.ok(ApiResponse.ok(guideService.list(category, query)));
    }

    @Operation(summary = "Sync real estate guides from S3")
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<Integer>> syncGuides(
            @RequestHeader("X-Admin-Token") String token
    ) {
        // 용어 사전 동기화 API와 동일하게 관리자 토큰이 맞을 때만 S3 원본을 DB에 반영합니다.
        if (!adminToken.equals(token)) {
            throw new ZiptException(ErrorCode.UNAUTHORIZED);
        }

        int count = guideService.syncFromS3(s3Key);
        return ResponseEntity.ok(ApiResponse.ok(count));
    }
}
