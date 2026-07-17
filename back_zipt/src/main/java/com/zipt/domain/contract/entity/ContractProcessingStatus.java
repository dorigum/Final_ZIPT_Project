package com.zipt.domain.contract.entity;

public enum ContractProcessingStatus {
    PROCESSING,
    OCR_EXTRACTING,
    AI_EXTRACTING,
    CHECKLIST_GENERATING,
    COMPLETED,
    FAILED
}
