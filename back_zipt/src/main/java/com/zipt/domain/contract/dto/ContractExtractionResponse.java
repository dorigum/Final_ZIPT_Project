package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.List;

@JsonPropertyOrder({
        "contractType",
        "contractKind",
        "property",
        "payment",
        "leasePeriod",
        "taxAndPriority",
        "repair",
        "specialTerms",
        "missingFields",
        "warnings",
        "confidence"
})
public record ContractExtractionResponse(

        @JsonPropertyDescription("""
                계약 유형.
                JEONSE: 전세
                MONTHLY_RENT_WITH_DEPOSIT: 보증금 있는 월세
                MONTHLY_RENT: 월세
                """)
        String contractType,

        @JsonPropertyDescription("""
                계약의 종류.
                NEW: 신규 계약
                AGREED_RENEWAL: 합의에 의한 재계약
                RENEWAL_REQUEST: 계약갱신요구권 행사에 의한 갱신계약
                """)
        String contractKind,

        PropertyExtract property,

        PaymentExtract payment,

        PeriodExtract leasePeriod,

        TaxAndPriorityExtract taxAndPriority,

        RepairExtract repair,

        List<SpecialTermExtract> specialTerms,

        @JsonPropertyDescription("체크리스트 생성을 위해 필요한데 OCR 텍스트에서 찾지 못한 필드 목록")
        List<String> missingFields,

        @JsonPropertyDescription("OCR 오류, 값 불명확, 금액 불일치, 날짜 불명확 등 주의사항")
        List<String> warnings,

        @JsonPropertyDescription("전체 추출 신뢰도. 0.0 ~ 1.0")
        Double confidence
) {
}