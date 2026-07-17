package com.zipt.domain.analysis.dto;

import com.zipt.domain.analysis.entity.AnalysisProcessingStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * 등기부등본 분석 최종 응답
 * → 프론트 RiskReport 컴포넌트에서 사용
 * → 분석 이력 재조회 시에도 동일 구조로 반환
 */
@Getter
@Builder
public class AnalysisResponse {

    private Long   id;                      // analysis_results PK (이력 재조회용)

    // ── 등기부 원본 요약 ──────────────────────
    private String address;
    private String ownerName;
    private String propertyType;
    private Integer buildingYear;
    private boolean rentalBusiness;
    private String  rentalType;
    private List<RegistryData.Bond> priorityBonds;
    private List<String>            registryWarnings;

    // ── LTV 위험도 ────────────────────────────
    private Double  ltvRatio;               //
    private String  riskLevel;              // SAFE, WARNING, DANGER
    private Integer riskScore;              //
    private String  scoreGrade;             // DANGER
    private List<String> riskFactors;

    // ── 금액 지표 ──────────────────────────────
    private Long deposit;
    private Long marketPrice;
    private Long officialPrice;
    private Long totalPriorityAmount;

    // ── 보증보험 ───────────────────────────────
    private Boolean insuranceEligible;
    private Double  hugDebtRatio;
    private Double  priorityRatio;
    private Double  totalLtv;
    private String  insuranceRecommendation;
    private List<InsuranceResult.ConditionCheck> insuranceConditions;

    // ── 파일 ───────────────────────────────────
    private String registryImageUrl;        // S3 등기부등본 이미지
    private String pdfUrl;                  // S3 PDF 리포트
    private String analyzedAt;             // 분석 일시

    //-history
    private AnalysisProcessingStatus processingStatus;
    private String processingErrorMessage;
}
