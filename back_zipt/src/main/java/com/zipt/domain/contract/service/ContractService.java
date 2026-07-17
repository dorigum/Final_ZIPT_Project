package com.zipt.domain.contract.service;

import com.zipt.domain.contract.dto.*;
import com.zipt.domain.contract.entity.*;
import com.zipt.domain.contract.repository.ContractRepository;
import com.zipt.domain.contract.util.ContractUtil;
import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.repository.MemberRepository;
import com.zipt.domain.noise.dto.NoiseReport;
import com.zipt.domain.noise.service.NoiseService;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.ocr.OcrTextExtractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final NoiseService noiseService;
    private final OcrTextExtractionService ocrTextExtractionService;
    private final ContractRepository contractRepository;
    private final MemberRepository memberRepository;
    private final ContractProcessingNotifier contractProcessingNotifier;
    private final ContractProcessingStatusService contractProcessingStatusService;
    private final ContractProcessingPersistenceService contractProcessingPersistenceService;
    private final ContractAiExtractionService contractAiExtractionService;
    private final ContractChecklistGenerationService contractChecklistGenerationService;
    private final ContractReportService contractReportService;
    private final ContractUtil contractUtil;

    @Transactional(readOnly = true)
    public List<Contract> findByMemberId(Long id) {
        return contractRepository.findByMemberId(id);
    }

    @Transactional(readOnly = true)
    public Contract findByIdAndMemberId(Long contractId, Long memberId) {
        return contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public SseEmitter subscribeProcessingStatus(Long contractId, Long memberId) {
        Contract contract = findByIdAndMemberId(contractId, memberId);
        return contractProcessingNotifier.subscribe(
                contractId, contract.getProcessingStatus(), contract.getProcessingErrorMessage());
    }

    @Transactional
    public Contract createPendingContractFromFile(Long memberId, List<ContractUploadFile> contractFiles) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));

        Contract contract = Contract.builder().member(member).build();
        contract.setDocument(ContractDocument.builder()
                .originalFileName(toOriginalFileNames(contractFiles))
                .fileUrl("")
                .build());

        return contractRepository.save(contract);
    }

    public void processContractFiles(Long contractId, Long memberId, List<MultipartFile> contractFiles) {
        contractProcessingPersistenceService.requireExists(contractId);

        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.OCR_EXTRACTING, null);
        String ocrText = ocrTextExtractionService.extractText(contractFiles);
        contractProcessingPersistenceService.saveOcrAndVision(contractId, ocrText, null);

        ensureLeaseContract(contractId, memberId, ocrText);

        ContractVisionExtractionResponse visionResponse = contractAiExtractionService.extractVision(contractFiles);
        contractProcessingPersistenceService.saveOcrAndVision(contractId, ocrText, visionResponse);

        String checkboxJson = contractUtil.toCheckboxJson(visionResponse);
        generateChecklist(contractId, memberId, ocrText, checkboxJson);
    }

    public void reprocessContract(Long contractId, Long memberId) {
        ContractProcessingSource source = contractProcessingPersistenceService.getProcessingSource(contractId);
        ensureLeaseContract(contractId, memberId, source.ocrText());
        generateChecklist(contractId, memberId, source.ocrText(), source.checkboxJson());
    }

    public Contract markRegenerationProcessing(Long contractId, Long memberId) {
        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.AI_EXTRACTING, null);
        return contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));
    }

    private void generateChecklist(Long contractId, Long memberId, String ocrText, String visionJson) {
        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.AI_EXTRACTING, null);
        ContractExtractionResponse extractionResponse =
                contractAiExtractionService.extractContractResponse(ocrText, visionJson);

        Contract contract = contractProcessingPersistenceService.applyExtraction(contractId, extractionResponse);

        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.CHECKLIST_GENERATING, null);
        List<ContractChecklistItem> checklistItems = contractChecklistGenerationService.generateChecklistItems(contract);
        contractProcessingPersistenceService.replaceChecklistItems(contractId, checklistItems);
        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.COMPLETED, null);
    }

    private void ensureLeaseContract(Long contractId, Long memberId, String ocrText) {
        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.AI_EXTRACTING, null);
        ContractDocumentClassificationResponse classificationResponse =
                contractAiExtractionService.classifyDocument(ocrText);

        if (classificationResponse != null && classificationResponse.isLeaseContract()) {
            return;
        }

        if (classificationResponse == null || classificationResponse.documentType() == null) {
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
        }

        switch (classificationResponse.documentType()) {
            case "MULTIPLE_LEASE_CONTRACTS": throw new ZiptException(ErrorCode.MULTIPLE_LEASE_CONTRACTS);

            case "MIXED_DOCUMENTS": throw new ZiptException(ErrorCode.MIXED_DOCUMENTS);

            default: throw new ZiptException(ErrorCode.INVALID_LEASE_CONTRACT);
        }
    }

    @Transactional
    public void deleteContract(Long contractId, Long memberId) {
        Contract contract = contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        contractRepository.delete(contract);
    }

    @Transactional
    public ContractChecklistItemResponse updateChecklistItemChecked(
            Long contractId,
            Long checklistItemId,
            Long memberId,
            Boolean checked
    ) {
        Contract contract = contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        ContractChecklistItem checklistItem = contract.getChecklistItems().stream()
                .filter(item -> item.getId().equals(checklistItemId))
                .findFirst()
                .orElseThrow(() -> new ZiptException(ErrorCode.CHECKLIST_ITEM_NOT_FOUND));

        checklistItem.updateChecked(checked);
        return ContractChecklistItemResponse.from(checklistItem);
    }

    @Transactional
    public ContractHistoryResponse updateTrackingEnabled(Long contractId, Long memberId, Boolean trackingEnabled) {
        Contract contract = contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

        contract.updateTrackingEnabled(trackingEnabled);
        return ContractHistoryResponse.from(contract);
    }

    @Transactional(readOnly = true)
    public ContractResponse findByIdWithNoise(Long contractId, Long memberId) {
        Contract contract = contractRepository.findByIdAndMemberId(contractId, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));
        NoiseReport noiseReport = null;
        if (contract.getPropertyAddress() != null && !contract.getPropertyAddress().isBlank()) {
            noiseReport = noiseService.analyzeNoise(contract.getPropertyAddress());
        }
        return ContractResponse.from(contract, noiseReport);
    }

    public String uploadContractReport(Long contractId, Long memberId, MultipartFile pdfFile) {
        return contractReportService.uploadContractReport(contractId, memberId, pdfFile);
    }

    private String toOriginalFileNames(List<ContractUploadFile> contractFiles) {
        if (contractFiles == null || contractFiles.isEmpty()) {
            return "";
        }

        return contractFiles.stream()
                .map(ContractUploadFile::originalFilename)
                .filter(filename -> filename != null && !filename.isBlank())
                .collect(Collectors.joining(", "));
    }
}
