package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.time.LocalDate;

public record PeriodExtract(

        @JsonPropertyDescription("임차주택 인도 예정일")
        LocalDate deliveryDate,

        @JsonPropertyDescription("임대차기간 종료일")
        LocalDate endDate
) {
}