package com.zipt.domain.contract.dto;

import com.zipt.domain.contract.entity.ChecklistRiskLevel;
import com.zipt.domain.contract.entity.ContractChecklistItem;

public record ContractChecklistItemResponse(
        Long id,
        Integer displayOrder,
        String category,
        String title,
        String description,
        String reason,
        String actionRequired,
        String referenceText,
        ChecklistRiskLevel riskLevel,
        Boolean required,
        Boolean checked
) {

    public static ContractChecklistItemResponse from(ContractChecklistItem item) {
        return new ContractChecklistItemResponse(
                item.getId(),
                item.getDisplayOrder(),
                item.getCategory(),
                item.getTitle(),
                item.getDescription(),
                item.getReason(),
                item.getActionRequired(),
                item.getReferenceText(),
                item.getRiskLevel(),
                item.getRequired(),
                item.getChecked()
        );
    }
}
