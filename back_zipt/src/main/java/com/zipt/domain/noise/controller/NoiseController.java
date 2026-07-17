package com.zipt.domain.noise.controller;

import com.zipt.domain.noise.dto.NoiseReport;
import com.zipt.domain.noise.service.NoiseService;
import com.zipt.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/noise")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Noise Analysis", description = "층간소음 분석 API")
public class NoiseController {

    private final NoiseService noiseService;

    /**
     * 주소로 층간소음 분석
     */
    @Operation(summary = "주소 기반 층간소음 분석",
            description = "건축물 주소를 입력하여 층간소음 데이터를 분석합니다.")
    @GetMapping("/analyze")
    public ResponseEntity<ApiResponse<NoiseReport>> analyzeNoise(
            @Parameter(description = "건축물 주소", example = "서울시 강남구 강남대로 456")
            @RequestParam String address
    ) {
        log.info("층간소음 분석 요청: {}", address);

        if (address == null || address.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("주소를 입력해주세요"));
        }

        try {
            NoiseReport report = noiseService.analyzeNoise(address);
            return ResponseEntity.ok(ApiResponse.ok(report));

        } catch (Exception e) {
            log.error("층간소음 분석 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.fail("분석 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * Health Check
     */
    @Operation(summary = "헬스 체크", description = "서비스 정상 작동 확인")
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.ok("Noise Service is running"));
    }
}