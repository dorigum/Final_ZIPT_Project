package com.zipt.domain.analysis.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * LTV 계산 + 최종 점수 결과
 * LtvService → AnalysisService로 전달
 */
@Getter
@Builder
public class LtvResult {

    // LTV
    private Double       ltvRatio;               // 87.1
    private String       riskLevel;              // SAFE, WARNING, DANGER

    // 최종 점수
    private Integer      riskScore;              // 5~100점
    private String       scoreGrade;             // PREMIUM, CAUTION, DANGER

    // 계산에 사용된 값
    private Long         totalPriorityAmount;    // 선순위 채권 합계
    private Long         depositAmount;          // 전세보증금
    private Long         marketPrice;            // 추정 시세

    // 위험 요인 목록
    private List<String> riskFactors;
}
