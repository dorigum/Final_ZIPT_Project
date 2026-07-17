package com.zipt.domain.contract.controller;

import com.zipt.domain.contract.dto.*;
import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.service.ContractAsyncProcessor;
import com.zipt.domain.contract.service.ContractService;
import com.zipt.global.response.ApiResponse;
import com.zipt.global.security.CustomMemberDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@Tag(name = "Contract", description = "Contract upload and checklist API")
public class ContractController {

    private final ContractService contractService;
    private final ContractAsyncProcessor contractAsyncProcessor;

    @Operation(summary = "Upload contract and generate checklist")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ContractUploadResponse>> uploadAndGenerateChecklist(
            Authentication authentication,
            @RequestPart("contractFiles") List<MultipartFile> contractFiles
    ) {
        List<ContractUploadFile> uploadFiles = ContractUploadFile.from(contractFiles);
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = details.getMember().getId();
        Contract contract = contractService.createPendingContractFromFile(memberId, uploadFiles);
        contractAsyncProcessor.process(contract.getId(), memberId, uploadFiles);
        ContractUploadResponse response = new ContractUploadResponse(
                contract.getId(),
                contract.getProcessingStatus()
        );

        return ResponseEntity.accepted().body(ApiResponse.ok(response));
    }

    @Operation(summary = "Get contract processing status")
    @GetMapping("/{contractId}/processing-status")
    public ResponseEntity<ApiResponse<ContractHistoryResponse>> getProcessingStatus(
            Authentication authentication,
            @PathVariable Long contractId
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        Contract contract = contractService.findByIdAndMemberId(contractId, details.getMember().getId());
        return ResponseEntity.ok(ApiResponse.ok(ContractHistoryResponse.from(contract)));
    }

    @Operation(summary = "Subscribe to contract processing status")
    @GetMapping(value = "/{contractId}/processing-events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeProcessingStatus(
            Authentication authentication,
            @PathVariable Long contractId
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        return contractService.subscribeProcessingStatus(contractId, details.getMember().getId());
    }

    @Operation(summary = "Get authenticated user's contracts")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ContractHistoryResponse>>> getMyContracts(Authentication authentication) {
        CustomMemberDetails customMemberDetails = (CustomMemberDetails) authentication.getPrincipal();
//        List<Contract> contracts = contractService.findByMemberEmail(authentication.getName());
        List<Contract> contracts = contractService.findByMemberId(customMemberDetails.getMember().getId());
        if (contracts == null || contracts.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.fail("Contract not found"));
        }

        return ResponseEntity.ok(ApiResponse.ok(contracts.stream().map(ContractHistoryResponse::from).toList()));

    }

    @Operation(summary = "Get contract with checklist") //층간소음 mapping 추가
    @GetMapping("/{contractId}")
    public ResponseEntity<ApiResponse<ContractResponse>> getContract(
            Authentication authentication,
            @PathVariable Long contractId
    ) {
        CustomMemberDetails customMemberDetails = (CustomMemberDetails) authentication.getPrincipal();
        ContractResponse response = contractService.findByIdWithNoise(
                contractId,
                customMemberDetails.getMember().getId()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Regenerate contract checklist using existing OCR text")
    @PostMapping("/{contractId}/regenerate")
    public ResponseEntity<ApiResponse<ContractUploadResponse>> regenerateChecklist(
            Authentication authentication,
            @PathVariable Long contractId
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = details.getMember().getId();
        Contract contract = contractService.markRegenerationProcessing(contractId, memberId);
        contractAsyncProcessor.reprocess(contractId, memberId);

        ContractUploadResponse response = new ContractUploadResponse(
                contract.getId(),
                contract.getProcessingStatus()
        );

        return ResponseEntity.accepted().body(ApiResponse.ok(response));
    }

    @Operation(summary = "Upload contract pdf file to S3")
    @PostMapping("/{contractId}/pdf/upload")
    public ResponseEntity<ApiResponse<String>> uploadContractPdf(
            Authentication authentication,
            @PathVariable Long contractId,
            @RequestPart("pdf") MultipartFile pdfFile
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        String url = contractService.uploadContractReport(
                contractId,
                details.getMember().getId(),
                pdfFile
        );

        return ResponseEntity.ok(ApiResponse.ok(url));
    }

    @Operation(summary = "Update contract checklist item checked status")
    @PatchMapping("/{contractId}/checklist-items/{checklistItemId}/checked")
    public ResponseEntity<ApiResponse<ContractChecklistItemResponse>> updateChecklistItemChecked(
            Authentication authentication,
            @PathVariable Long contractId,
            @PathVariable Long checklistItemId,
            @Valid @RequestBody ContractChecklistItemCheckedUpdateRequest request
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        ContractChecklistItemResponse response = contractService.updateChecklistItemChecked(
                contractId,
                checklistItemId,
                details.getMember().getId(),
                request.checked()
        );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Toggle contract schedule tracking (D-day reminder on mypage)")
    @PatchMapping("/{contractId}/tracking")
    public ResponseEntity<ApiResponse<ContractHistoryResponse>> updateTrackingEnabled(
            Authentication authentication,
            @PathVariable Long contractId,
            @Valid @RequestBody ContractTrackingUpdateRequest request
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        ContractHistoryResponse response = contractService.updateTrackingEnabled(
                contractId,
                details.getMember().getId(),
                request.trackingEnabled()
        );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "Delete contract")
    @DeleteMapping("/{contractId}")
    public ResponseEntity<ApiResponse<Void>> deleteContract(
            Authentication authentication,
            @PathVariable Long contractId
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        contractService.deleteContract(contractId, details.getMember().getId());

        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
