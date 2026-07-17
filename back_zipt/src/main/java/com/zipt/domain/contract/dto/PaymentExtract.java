package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.time.LocalDate;

public record PaymentExtract(

        @JsonPropertyDescription("보증금. 숫자만 추출")
        Long depositAmount,

        @JsonPropertyDescription("계약금. 숫자만 추출")
        Long contractAmount,

        @JsonPropertyDescription("중도금. 숫자만 추출")
        Long intermediateAmount,

        @JsonPropertyDescription("중도금 지급일")
        LocalDate intermediatePaymentDate,

        @JsonPropertyDescription("잔금. 숫자만 추출")
        Long balanceAmount,

        @JsonPropertyDescription("잔금 지급일")
        LocalDate balancePaymentDate,

        @JsonPropertyDescription("월 차임. 전세면 0")
        Long monthlyRent,

        @JsonPropertyDescription("차임 지급일. 매월 며칠인지")
        Integer monthlyRentPaymentDay,

        @JsonPropertyDescription("""
                관리비 유형.
                FIXED: 정액
                NON_FIXED: 정액 아님
                NONE: 없음
                """)
        String maintenanceFeeType,

        @JsonPropertyDescription("정액 관리비 총액")
        Long maintenanceFeeAmount,

        @JsonPropertyDescription("정액이 아닌 경우 관리비 산정 방식. 예: 세대별 사용량 비례")
        String maintenanceFeeCalculationMethod
) {
}
