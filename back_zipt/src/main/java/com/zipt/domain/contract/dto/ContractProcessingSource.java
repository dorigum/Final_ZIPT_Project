package com.zipt.domain.contract.dto;

public record ContractProcessingSource(
        String ocrText,
        String checkboxJson
) {
}
