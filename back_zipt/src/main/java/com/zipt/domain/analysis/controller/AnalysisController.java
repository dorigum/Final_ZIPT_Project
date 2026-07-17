package com.zipt.domain.analysis.controller;

import com.zipt.domain.analysis.dto.AnalysisHistoryResponse;
import com.zipt.domain.analysis.dto.AnalysisResponse;
import com.zipt.domain.analysis.entity.AnalysisProcessingStatus;
import com.zipt.domain.analysis.service.AnalysisService;
import com.zipt.domain.analysis.service.PdfUploadService;
import com.zipt.global.response.ApiResponse;
import com.zipt.global.security.CustomMemberDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Tag(name = "전세사기 위험판단", description = "등기부등본 분석 API")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final PdfUploadService pdfUploadService;

    /**
     * POST /api/analysis/analyze
     * 등기부등본 분석 — OCR + LTV + 보증보험 + 점수
     */
    @Operation(summary = "등기부등본 분석")
    @PostMapping(value = "/analyze",
            consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyze(
            Authentication authentication,
            @RequestPart("registryImage") MultipartFile registryImage,
            @RequestParam("deposit")      Long deposit,
            @RequestParam(value = "propertyType", defaultValue = "아파트")
            String propertyType
    ) {
        // TODO: JWT 완성 후 변경
       // String email = authentication.getName();
        //260624 email에서 Member 객체로 발급 변경
        CustomMemberDetails memberDetails = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = memberDetails.getMember().getId();
        AnalysisResponse result = analysisService.analyze(
                memberId, registryImage, deposit, propertyType
        );
        if (AnalysisProcessingStatus.FAILED.equals(result.getProcessingStatus())) {
            // OCR은 수행됐지만 등기부등본으로 볼 수 없는 파일이면 프론트가 실패 화면으로 분기할 수 있게 422로 응답합니다.
            return ResponseEntity.unprocessableEntity()
                    .body(ApiResponse.<AnalysisResponse>builder()
                            .success(false)
                            .message(result.getProcessingErrorMessage())
                            .data(result)
                            .build());
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/analysis/history
     * 분석 이력 목록 조회
     */
    @Operation(summary = "분석 이력 목록")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<AnalysisHistoryResponse>>> history(
            Authentication authentication
    ) {
//        // TODO: JWT 완성 후 user.getUsername()  변경
        CustomMemberDetails memberDetails = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = memberDetails.getMember().getId();
        return ResponseEntity.ok(
                ApiResponse.ok(analysisService.getHistory(memberId)));
    }


    /**
     * GET /api/analysis/{id}
     * 분석 결과 상세 조회
     */
    @Operation(summary = "분석 결과 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnalysisResponse>> detail(
            Authentication authentication,
            @PathVariable Long id
    ) {
        CustomMemberDetails memberDetails = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = memberDetails.getMember().getId();
        AnalysisResponse result =
                analysisService.getDetail(memberId, id);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/analysis/{id}
     * 분석 결과 삭제 (프론트 삭제 버튼 연결) 260626
     */
    @Operation(summary = "분석 결과 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAnalysis(
            Authentication authentication,
            @PathVariable Long id
    ) {
        CustomMemberDetails memberDetails = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = memberDetails.getMember().getId();

        analysisService.deleteAnalysis(memberId, id);

        return ResponseEntity.ok(ApiResponse.ok(null));
    }


    /**
     * GET /api/analysis/{id}/pdf
     * PDF 다운로드 — PdfExportService 개발 후 연결
     */
    @Operation(summary = "PDF 리포트 다운로드")
    @GetMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<String>> downloadPdf(
            @PathVariable Long id
    ) {
        // TODO: PdfExportService 개발 후 연결
        return ResponseEntity.ok(ApiResponse.ok("PDF 기능 구현"));
    }
    /**
     * POST /api/analysis/{id}/pdf/upload
     * 프론트에서 생성한 PDF → S3 업로드 → presigned URL 반환
     */
    @Operation(summary = "PDF 리포트 S3 업로드")
    @PostMapping(value = "/{id}/pdf/upload", consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadPdf(
            Authentication authentication,
            @PathVariable Long id,
            @RequestPart("pdf") MultipartFile pdfFile
    ) {
        CustomMemberDetails memberDetails = (CustomMemberDetails) authentication.getPrincipal();
        Long memberId = memberDetails.getMember().getId();
       // String presignedUrl = pdfUploadService.uploadAndGetUrl(email, id, pdfFile);
        String url = pdfUploadService.uploadAndGetUrl(memberId, id, pdfFile);
        return ResponseEntity.ok(ApiResponse.ok(url));
    }
}
