package com.zipt.domain.contract.service;

import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.repository.ContractRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ContractReportService {

    private final ContractRepository contractRepository;
    private final S3Service s3Service;

    @Transactional
    public String uploadContractReport(Long contractId, Long memberId, MultipartFile pdfFile) {
        String key = "contracts/" + contractId + "_report.pdf";
        try {
            Contract contract = contractRepository.findByIdAndMemberId(contractId, memberId)
                    .orElseThrow(() -> new ZiptException(ErrorCode.CONTRACT_NOT_FOUND));

            s3Service.upload(pdfFile.getBytes(), key, "application/pdf");
            contract.getDocument().updateFileUrl(key);
            contractRepository.save(contract);

            return key;
        } catch (IOException e) {
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
        }
    }
}
