package com.zipt.domain.contract.dto;

import com.zipt.domain.contract.entity.ContractProcessingStatus;

public record ContractUploadResponse(
        Long contractId,
        ContractProcessingStatus processingStatus
) {
}
