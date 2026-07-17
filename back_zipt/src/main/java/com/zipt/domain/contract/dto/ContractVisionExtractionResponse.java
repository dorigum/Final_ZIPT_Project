package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.time.LocalDate;
import java.util.List;

@JsonPropertyOrder({
        "unpaidTaxStatus",
        "priorityFixedDateStatus",
        "repairNeededStatus",
        "repairContent",
        "repairCompletionDate",
        "repairDefaultHandling",
        "specialCheckboxes",
        "warnings",
        "confidence"
})
public record ContractVisionExtractionResponse(

        @JsonPropertyDescription("""
                미납 국세·지방세 체크박스 선택 결과.
                NONE: 없음 체크
                EXISTS: 있음 체크
                UNKNOWN: 체크 여부 판단 불가
                """)
        String unpaidTaxStatus,

        @JsonPropertyDescription("""
                선순위 확정일자 현황 체크박스 선택 결과.
                NONE: 없음 체크
                EXISTS: 해당 있음 체크
                NOT_APPLICABLE: 해당 없음 체크
                UNKNOWN: 체크 여부 판단 불가
                """)
        String priorityFixedDateStatus,

        @JsonPropertyDescription("""
                입주 전 수리 필요 시설 체크박스 선택 결과.
                NONE: 없음 체크
                EXISTS: 있음 체크
                UNKNOWN: 체크 여부 판단 불가
                """)
        String repairNeededStatus,

        @JsonPropertyDescription("수리 필요 시설이 있음으로 체크된 경우 이미지에서 읽히는 수리 내용")
        String repairContent,

        @JsonPropertyDescription("수리 완료 시기가 날짜로 확인되는 경우 yyyy-MM-dd")
        LocalDate repairCompletionDate,

        @JsonPropertyDescription("약정한 수리 완료 시기까지 미수리한 경우 선택된 처리 방법")
        String repairDefaultHandling,

        @JsonPropertyDescription("특약사항 등 기타 체크박스에서 선택된 내용")
        List<String> specialCheckboxes,

        @JsonPropertyDescription("이미지 흐림, 체크 표시 불명확, 여러 선택지 동시 감지 등 주의사항")
        List<String> warnings,

        @JsonPropertyDescription("이미지 기반 체크박스 추출 신뢰도. 0.0 ~ 1.0")
        Double confidence
) {
}
