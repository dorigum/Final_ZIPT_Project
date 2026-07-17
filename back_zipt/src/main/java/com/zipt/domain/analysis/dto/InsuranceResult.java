package com.zipt.domain.analysis.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * HUG 전세보증보험 가입 가능 여부 판별 결과
 * LtvService → AnalysisService로 전달
 */
@Getter
@Builder
public class InsuranceResult {

    // 최종 결과
    private Boolean eligible;           // 가입 가능 여부
    private String  recommendation;     // 결과 요약 문장

    // HUG 3대 공식 수치
    private Double  hugDebtRatio;       // ① HUG 부채비율 (기준 90% 미만)
    private Double  priorityRatio;      // ② 선순위 채권 비율 (기준 60% 이하)
    private Double  totalLtv;           // ③ 총 LTV (기준 100% 이하)

    // 5개 조건 상세 체크 결과
    private List<ConditionCheck> conditions;

    @Getter
    @Builder
    public static class ConditionCheck {
        private String  name;       // 조건 이름
        private String  standard;   // 기준값
        private String  actual;     // 실제값
        private Boolean passed;     // 합격 여부
    }
}
