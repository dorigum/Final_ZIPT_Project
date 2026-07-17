package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.List;

@JsonPropertyOrder({
        "items",
        "warnings",
        "confidence"
})
public record ChecklistGenerationResponse(

        @JsonPropertyDescription("계약 전 확인해야 할 체크리스트 항목 목록")
        List<ChecklistItemExtract> items,

        @JsonPropertyDescription("체크리스트 생성 시 계약 정보 부족, OCR 불명확 등으로 주의해야 할 내용")
        List<String> warnings,

        @JsonPropertyDescription("체크리스트 생성 신뢰도. 0.0 ~ 1.0")
        Double confidence
) {
}
