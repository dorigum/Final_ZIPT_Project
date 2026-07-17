package com.zipt.domain.contract.service;

import com.zipt.domain.contract.dto.ContractExtractionResponse;
import com.zipt.domain.contract.dto.ContractProcessingSource;
import com.zipt.domain.contract.dto.ContractVisionExtractionResponse;
import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.entity.ContractCheckbox;
import com.zipt.domain.contract.entity.ContractChecklistItem;
import com.zipt.domain.contract.entity.ContractDocument;
import com.zipt.domain.contract.entity.DisclosureStatus;
import com.zipt.domain.contract.entity.PriorityFixedDateStatus;
import com.zipt.domain.contract.entity.RepairNeededStatus;
import com.zipt.domain.contract.mapper.ContractExtractionMapper;
import com.zipt.domain.contract.repository.ContractRepository;
import com.zipt.domain.contract.util.ContractUtil;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractProcessingPersistenceService {

    private final ContractRepository contractRepository;
    private final ContractExtractionMapper contractExtractionMapper;
    private final ContractUtil contractUtil;

    @Transactional(readOnly = true)
    public void requireExists(Long contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new ZiptException(ErrorCode.CONTRACT_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public ContractProcessingSource getProcessingSource(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        return new ContractProcessingSource(
                contract.getDocument().getExtractedText(),
                contract.getCheckbox().getRawResultJson()
        );
    }

    @Transactional
    public void saveOcrAndVision(
            Long contractId,
            String ocrText,
            ContractVisionExtractionResponse visionResponse
    ) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        updateExtractedText(contract, ocrText);
        saveVisionExtraction(contract, visionResponse);
    }

    @Transactional
    public Contract applyExtraction(Long contractId, ContractExtractionResponse extractionResponse) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        if (extractionResponse != null) {
            contractExtractionMapper.applyToContract(contract, extractionResponse);
        }

        return contract;
    }

    @Transactional
    public void replaceChecklistItems(Long contractId, List<ContractChecklistItem> checklistItems) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        contract.replaceChecklistItems(checklistItems);
    }

    private void updateExtractedText(Contract contract, String ocrText) {
        if (contract.getDocument() == null) {
            contract.setDocument(ContractDocument.builder()
                    .originalFileName("")
                    .fileUrl("")
                    .extractedText(ocrText)
                    .build());
            return;
        }

        contract.getDocument().updateExtractedText(ocrText);
    }

    private void saveVisionExtraction(Contract contract, ContractVisionExtractionResponse response) {
        if (response == null) {
            return;
        }

        ContractCheckbox checkbox = contract.getCheckbox();
        if (checkbox == null) {
            checkbox = ContractCheckbox.builder().build();
            contract.setCheckbox(checkbox);
        }

        checkbox.updateResult(
                contractUtil.toCheckboxJson(response),
                contractUtil.parseEnum(DisclosureStatus.class, response.unpaidTaxStatus(), DisclosureStatus.UNKNOWN),
                contractUtil.parseEnum(PriorityFixedDateStatus.class, response.priorityFixedDateStatus(), PriorityFixedDateStatus.UNKNOWN),
                contractUtil.parseEnum(RepairNeededStatus.class, response.repairNeededStatus(), RepairNeededStatus.UNKNOWN),
                response.repairContent(),
                response.repairCompletionDate(),
                response.repairDefaultHandling(),
                contractUtil.toJson(response.specialCheckboxes()),
                contractUtil.toJson(response.warnings()),
                response.confidence()
        );
    }
}
