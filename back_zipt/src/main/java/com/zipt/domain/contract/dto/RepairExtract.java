package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.time.LocalDate;

public record RepairExtract(

        @JsonPropertyDescription("""
                수리 필요 여부.
                NONE: 없음
                EXISTS: 있음
                """)
        String repairNeededStatus,

        @JsonPropertyDescription("수리할 내용. 수리 필요 여부가 NONE 인 경우 null")
        String repairContent,

        @JsonPropertyDescription("수리 완료 예정일. 수리 필요 여부가 NONE 인 경우 null")
        LocalDate repairCompletionDate,

        @JsonPropertyDescription("약정한 시기까지 미수리한 경우 처리 방법. 수리 필요 여부가 NONE 인 경우 null")
        String repairDefaultHandling
) {
}