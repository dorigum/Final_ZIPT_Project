package com.zipt.domain.contract.service;

import com.zipt.domain.contract.dto.ContractUploadFile;
import com.zipt.domain.contract.entity.ContractProcessingStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractAsyncProcessor {

    private final ContractService contractService;
    private final ContractProcessingStatusService contractProcessingStatusService;

    @Async("contractTaskExecutor")
    public void process(Long contractId, Long memberId, List<ContractUploadFile> files) {
        contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.PROCESSING, null);
        try {
            List<MultipartFile> multipartFiles = files.stream()
                    .map(InMemoryMultipartFile::new)
                    .map(MultipartFile.class::cast)
                    .toList();
            contractService.processContractFiles(contractId, memberId, multipartFiles);
        } catch (Exception e) {
            log.error("Contract processing failed. contractId={}", contractId, e);
            contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.FAILED, e.getMessage());
        }
    }

    @Async("contractTaskExecutor")
    public void reprocess(Long contractId, Long memberId) {
        try {
            contractService.reprocessContract(contractId, memberId);
        } catch (Exception e) {
            log.error("Contract reprocessing failed. contractId={}", contractId, e);
            contractProcessingStatusService.updateStatus(contractId, memberId, ContractProcessingStatus.FAILED, e.getMessage());
        }
    }

    private record InMemoryMultipartFile(ContractUploadFile file) implements MultipartFile {

        @Override
        public String getName() {
            return "contractFiles";
        }

        @Override
        public String getOriginalFilename() {
            return file.originalFilename();
        }

        @Override
        public String getContentType() {
            return file.contentType();
        }

        @Override
        public boolean isEmpty() {
            return file.bytes() == null || file.bytes().length == 0;
        }

        @Override
        public long getSize() {
            return file.bytes() != null ? file.bytes().length : 0;
        }

        @Override
        public byte[] getBytes() {
            return file.bytes();
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(getBytes());
        }

        @Override
        public void transferTo(java.io.File dest) {
            throw new UnsupportedOperationException("In-memory upload files cannot be transferred");
        }
    }
}
