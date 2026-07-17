package com.zipt.domain.rag.controller;

import com.zipt.domain.rag.dto.RagEmbedResponse;
import com.zipt.domain.rag.service.RagService;
import com.zipt.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "RAG", description = "RAG 문서 임베딩 API")
@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
public class RagController {
    private final RagService ragService;

    @Operation(summary = "RAG 문서 임베딩", description = "PDF/JPEG/PNG 파일을 OCR로 텍스트 추출 후 임베딩하여 PostgreSQL에 저장합니다.")
    @PostMapping(value = "/embed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RagEmbedResponse>> embed(
            @RequestPart("files") List<MultipartFile> files
    ) {
        RagEmbedResponse response = ragService.embed(files);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
