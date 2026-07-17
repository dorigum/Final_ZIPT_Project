package com.zipt.domain.contract.dto;

import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.entity.ContractKind;
import com.zipt.domain.contract.entity.ContractProcessingStatus;
import com.zipt.domain.contract.entity.ContractType;
import com.zipt.domain.contract.entity.DisclosureStatus;
import com.zipt.domain.contract.entity.MaintenanceFeeType;
import com.zipt.domain.contract.entity.PriorityFixedDateStatus;
import com.zipt.domain.contract.entity.RepairNeededStatus;
import com.zipt.domain.noise.dto.NoiseReport;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ContractResponse(
        Long id,
        ContractType contractType,
        ContractKind contractKind,
        String propertyAddress,
        String buildingStructure,
        String buildingPurpose,
        String leasedPart,
        Long depositAmount,
        Long contractAmount,
        Long intermediateAmount,
        LocalDate intermediatePaymentDate,
        Long balanceAmount,
        LocalDate balancePaymentDate,
        Long monthlyRent,
        Integer monthlyRentPaymentDay,
        MaintenanceFeeType maintenanceFeeType,
        Long maintenanceFeeAmount,
        String maintenanceFeeCalculationMethod,
        LocalDate deliveryDate,
        LocalDate endDate,
        DisclosureStatus unpaidTaxStatus,
        String unpaidTaxDescription,
        PriorityFixedDateStatus priorityFixedDateStatus,
        String priorityFixedDateDescription,
        RepairNeededStatus repairNeededStatus,
        String repairContent,
        LocalDate repairCompletionDate,
        String repairDefaultHandling,
        Double extractionConfidence,
        String extractionWarnings,
        String missingFields,
        ContractProcessingStatus processingStatus,
        String processingErrorMessage,
        Boolean trackingEnabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ContractChecklistItemResponse> checklistItems,
        NoiseReport noiseReport, //층간소음 추가 - 260623 오혜진
        Boolean isReanalyzable
) {

    public static ContractResponse from(Contract contract) {
        return from(contract, null);
    }
    public static ContractResponse from(Contract contract, NoiseReport noiseReport) {
        return new ContractResponse(
                contract.getId(),
                contract.getContractType(),
                contract.getContractKind(),
                contract.getPropertyAddress(),
                contract.getBuildingStructure(),
                contract.getBuildingPurpose(),
                contract.getLeasedPart(),
                contract.getDepositAmount(),
                contract.getContractAmount(),
                contract.getIntermediateAmount(),
                contract.getIntermediatePaymentDate(),
                contract.getBalanceAmount(),
                contract.getBalancePaymentDate(),
                contract.getMonthlyRent(),
                contract.getMonthlyRentPaymentDay(),
                contract.getMaintenanceFeeType(),
                contract.getMaintenanceFeeAmount(),
                contract.getMaintenanceFeeCalculationMethod(),
                contract.getDeliveryDate(),
                contract.getEndDate(),
                contract.getUnpaidTaxStatus(),
                contract.getUnpaidTaxDescription(),
                contract.getPriorityFixedDateStatus(),
                contract.getPriorityFixedDateDescription(),
                contract.getRepairNeededStatus(),
                contract.getRepairContent(),
                contract.getRepairCompletionDate(),
                contract.getRepairDefaultHandling(),
                contract.getExtractionConfidence(),
                contract.getExtractionWarnings(),
                contract.getMissingFields(),
                contract.getProcessingStatus(),
                contract.getProcessingErrorMessage(),
                contract.getTrackingEnabled(),
                contract.getCreatedAt(),
                contract.getUpdatedAt(),
                contract.getChecklistItems().stream()
                        .map(ContractChecklistItemResponse::from)
                        .toList(),
                noiseReport, //층간소음 추가 - 260623 오혜진
                contract.getDocument().getExtractedText() != null
                        && !contract.getDocument().getExtractedText().isBlank() && contract.getCheckbox() != null
        );
    }
}
