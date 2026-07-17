package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

public record SpecialTermExtract(

        @JsonPropertyDescription("특약 원문")
        String content,

        @JsonPropertyDescription("""
                특약 유형.
                MOVE_IN_REPORT_AND_FIXED_DATE: 전입신고 및 확정일자
                MORTGAGE_RESTRICTION: 저당권 등 담보권 설정 금지
                CONTRACT_TERMINATION_BY_TAX_OR_PRIORITY: 미고지 선순위 임대차 정보 또는 체납세금 확인 시 계약 해제
                DISPUTE_MEDIATION: 주택임대차분쟁조정위원회 조정
                RECONSTRUCTION: 철거 또는 재건축 계획
                DETAILED_ADDRESS: 상세주소 부여 신청 동의
                CUSTOM: 기타 직접 작성된 특약
                """)
        String termType,

        @JsonPropertyDescription("임차인 보호에 유리한 특약인지 여부")
        Boolean tenantProtective,

        @JsonPropertyDescription("체크리스트 생성 시 추가 확인이 필요한 특약인지 여부")
        Boolean needsReview
) {
}