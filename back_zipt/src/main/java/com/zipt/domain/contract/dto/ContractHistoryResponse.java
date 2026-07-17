package com.zipt.domain.contract.dto;

import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.entity.ContractKind;
import com.zipt.domain.contract.entity.ContractProcessingStatus;
import com.zipt.domain.contract.entity.ContractType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractHistoryResponse(
		Long id,
		ContractType contractType,
		ContractKind contractKind,
		String propertyAddress,
		Long depositAmount,
		Long monthlyRent,
		LocalDate deliveryDate,
		LocalDate endDate,
		Boolean trackingEnabled,
		Double extractionConfidence,
		ContractProcessingStatus processingStatus,
		String processingErrorMessage,
		String originalFileName,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {
	public static ContractHistoryResponse from(Contract contract) {
		return new ContractHistoryResponse(
				contract.getId(),
				contract.getContractType(),
				contract.getContractKind(),
				contract.getPropertyAddress(),
				contract.getDepositAmount(),
				contract.getMonthlyRent(),
				contract.getDeliveryDate(),
				contract.getEndDate(),
				contract.getTrackingEnabled(),
				contract.getExtractionConfidence(),
				contract.getProcessingStatus(),
				contract.getProcessingErrorMessage(),
				contract.getDocument() != null ? contract.getDocument().getOriginalFileName() : null,
				contract.getCreatedAt(),
				contract.getUpdatedAt()
		);
	}
}
