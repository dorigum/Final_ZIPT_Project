package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({
        "category",
        "title",
        "description",
        "reason",
        "actionRequired",
        "referenceText",
        "riskLevel",
        "required"
})
public record ChecklistItemExtract(

        @JsonPropertyDescription("체크 항목 분류. 예: 권리관계, 보증금/대금, 전입신고/확정일자, 특약, 수리, 관리비, 누락정보")
        String category,

        @JsonPropertyDescription("사용자에게 보여줄 체크 항목 제목")
        String title,

        @JsonPropertyDescription("확인해야 하는 내용의 상세 설명")
        String description,

        @JsonPropertyDescription("이 항목을 확인해야 하는 이유")
        String reason,

        @JsonPropertyDescription("계약 전 사용자가 실제로 해야 할 확인 또는 요청 사항")
        String actionRequired,

        @JsonPropertyDescription("판단 근거가 된 계약서 문구 또는 계약 엔티티 필드 요약. 없으면 null")
        String referenceText,

        @JsonPropertyDescription("위험도. LOW, MEDIUM, HIGH 중 하나. 판단 불가 시 UNKNOWN")
        String riskLevel,

        @JsonPropertyDescription("계약 전 필수 확인 항목이면 true")
        Boolean required
) {
}
