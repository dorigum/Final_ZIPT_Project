package com.zipt.domain.analysis.dto;

import com.zipt.domain.analysis.entity.AnalysisProcessingStatus;
import com.zipt.domain.analysis.entity.AnalysisResult;
import lombok.Builder;
import lombok.Getter;


import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * 분석 이력 목록 카드용 요약 DTO
 * GET /api/analysis/history 응답
 * 데이터 전송량 줄임
 */
@Getter
@Builder
public class AnalysisHistoryResponse {

    private Long id;
    private String address;
    private String propertyType;
    private Long deposit;
    private Double ltvRatio;
    private String riskLevel;      // SAFE, WARNING, DANGER
    private Integer riskScore;
    private Boolean insuranceEligible;
    private String pdfUrl;         // null이면 PDF 버튼 숨김
    private String analyzedAt;
    private AnalysisProcessingStatus processingStatus;
    private String processingErrorMessage;
    private String registryFileName;

    // ── Entity → DTO 변환 ──
    public static AnalysisHistoryResponse from(AnalysisResult e) {
        // 💡 안전하게 날짜 포맷을 지정하기 위한 포맷터 (예: 2026-06-17 03:05:12)
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        // 💡 e.getCreatedAt()이 null일 경우를 대비해 현재 시간이나 빈 문자열 등으로 방어 코드
        String formattedDate = Optional.ofNullable(e.getCreatedAt())
                .map(formatter::format)
                .orElse(""); // 또는 LocalDateTime.now().format(formatter)로 현재 시간을 기본값

        return AnalysisHistoryResponse.builder()
                .id(e.getId())
                .address(e.getAddress())
                .propertyType(e.getPropertyType())
                .deposit(e.getDeposit())
                .ltvRatio(e.getLtvRatio())
                .riskLevel(e.getRiskLevel())
                .riskScore(e.getRiskScore())
                .insuranceEligible(e.getInsuranceEligible())
                .pdfUrl(e.getPdfUrl())
                .analyzedAt(formattedDate)
                .processingStatus(e.getProcessingStatus())
                .processingErrorMessage(e.getProcessingErrorMessage())
                .registryFileName(e.getRegistryFileName())
                .build();
    }
}