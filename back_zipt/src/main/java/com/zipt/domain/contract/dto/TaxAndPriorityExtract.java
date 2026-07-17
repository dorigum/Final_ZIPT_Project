package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

public record TaxAndPriorityExtract(

        @JsonPropertyDescription("""
                미납 국세·지방세 여부.
                NONE: 없음
                EXISTS: 있음
                """)
        String unpaidTaxStatus,

        @JsonPropertyDescription("미납 국세·지방세 관련 설명. OCR에 내용이 있으면 원문 중심으로 추출")
        String unpaidTaxDescription,

        @JsonPropertyDescription("""
                선순위 확정일자 현황.
                NONE: 없음
                EXISTS: 있음
                NOT_APPLICABLE: 해당 없음
                """)
        String priorityFixedDateStatus,

        @JsonPropertyDescription("선순위 확정일자 관련 설명. OCR에 내용이 있으면 원문 중심으로 추출")
        String priorityFixedDateDescription
) {
}