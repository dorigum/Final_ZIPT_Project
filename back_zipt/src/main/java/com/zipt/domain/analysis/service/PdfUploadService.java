package com.zipt.domain.analysis.service;

import com.zipt.domain.analysis.entity.AnalysisResult;
import com.zipt.domain.analysis.repository.AnalysisRepository;
import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.repository.MemberRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfUploadService {

    private final AnalysisRepository analysisRepository;
    private final MemberRepository   memberRepository;
    private final S3Service          s3Service;

    /**
     * 프론트에서 생성한 PDF → S3 업로드 → presigned URL 반환
     *
     * @param email   요청 회원 이메일
     * @param id      분석 결과 id
     * @param pdfFile 프론트에서 전송한 PDF 파일
     * @return S3 presigned URL (1시간 유효)
     */
    @Transactional
    // 260624수정
    public String uploadAndGetUrl(Long memberId, Long id, MultipartFile pdfFile) {
       //회원확인 //수정
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));

        // 2. 분석 결과 확인 (본인 것만) //수정
        AnalysisResult result = analysisRepository
                .findByIdAndMemberId(id, memberId)   // ← memberId로 직접 조회
                .orElseThrow(() -> new ZiptException(ErrorCode.ANALYSIS_NOT_FOUND));
        try {
            // 3. S3 업로드
            String key = "pdf/" + id + "_report.pdf";
            s3Service.upload(pdfFile.getBytes(), key, "application/pdf");

            // 4. pdfUrl DB 저장
            result.setPdfUrl(key);
            log.info("PDF S3 업로드 완료 — id: {} key: {}", id, key);

            // 5. presigned URL 반환
           // String presignedUrl = s3Service.generatePresignedUrl(key, Duration.ofHours(1));
//            log.info("PDF S3 업로드 완료 — id: {} key: {}", id, key);
//            return presignedUrl; //현재는 presinged url 반환하지 않아서 주석처리
            return key;

        } catch (Exception e) {
            log.error("PDF 업로드 실패 상세: {}", e.getMessage(), e);  // ← 스택트레이스 전체 출력
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
        }
    }
}