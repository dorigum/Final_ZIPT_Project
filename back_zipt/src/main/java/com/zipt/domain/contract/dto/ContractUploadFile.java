package com.zipt.domain.contract.dto;

import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public record ContractUploadFile(
        String originalFilename,
        String contentType,
        byte[] bytes
) {
    public static List<ContractUploadFile> from(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }

        return files.stream()
                .map(ContractUploadFile::from)
                .toList();
    }

    private static ContractUploadFile from(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }

        try {
            return new ContractUploadFile(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes()
            );
        } catch (IOException e) {
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }
    }
}
