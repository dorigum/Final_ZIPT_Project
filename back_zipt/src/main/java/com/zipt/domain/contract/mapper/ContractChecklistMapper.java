package com.zipt.domain.contract.mapper;

import com.zipt.domain.contract.dto.ChecklistGenerationResponse;
import com.zipt.domain.contract.dto.ChecklistItemExtract;
import com.zipt.domain.contract.entity.ChecklistRiskLevel;
import com.zipt.domain.contract.entity.ContractChecklistItem;
import com.zipt.domain.contract.util.ContractUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ContractChecklistMapper {
    private final ContractUtil contractUtil;

    public List<ContractChecklistItem> toEntities(
            ChecklistGenerationResponse response
    ) {
        List<ContractChecklistItem> checklists = new ArrayList<>();

        if (response == null || response.items() == null) {
            return checklists;
        }

        int order = 1;

        for (ChecklistItemExtract item : response.items()) {
            ContractChecklistItem checklist = ContractChecklistItem.builder()
                    .displayOrder(order++)
                    .category(contractUtil.defaultText(item.category(), "기타"))
                    .title(contractUtil.defaultText(item.title(), "계약 전 확인 필요"))
                    .description(item.description())
                    .reason(item.reason())
                    .actionRequired(item.actionRequired())
                    .referenceText(item.referenceText())
                    .riskLevel(contractUtil.parseEnum(ChecklistRiskLevel.class, item.riskLevel(), ChecklistRiskLevel.UNKNOWN))
                    .required(item.required() != null ? item.required() : Boolean.TRUE)
                    .checked(Boolean.FALSE)
                    .build();
            checklists.add(checklist);
        }

        return checklists;
    }
}
