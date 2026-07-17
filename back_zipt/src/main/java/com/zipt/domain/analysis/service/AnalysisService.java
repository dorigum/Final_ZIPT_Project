package com.zipt.domain.analysis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.analysis.dto.*;
import com.zipt.domain.analysis.entity.AnalysisProcessingStatus;
import com.zipt.domain.analysis.entity.AnalysisResult;
import com.zipt.domain.analysis.repository.AnalysisRepository;
import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.repository.MemberRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalysisService {

    private static final String INVALID_ADDRESS = "주소 인식 불가";

    private final OcrService ocrService;
    private final MarketPriceService marketPriceService;
    private final LtvService ltvService;
    private final AnalysisRepository analysisRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AnalysisResponse analyze(Long memberId,
                                    MultipartFile file,
                                    Long deposit,
                                    String propertyType) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));

        try {
            RegistryData registry = ocrService.extract(file);
            log.info("OCR 완료 - 주소: {}", registry.getAddress());

            long marketPrice = marketPriceService.getMarketPrice(registry.getAddress());
            long officialPrice = (long) (marketPrice * 0.7);

            LtvResult ltv = ltvService.calculate(
                    registry.getTotalPriorityAmount(),
                    deposit,
                    marketPrice
            );

            InsuranceResult insurance = ltvService.checkInsurance(
                    deposit,
                    marketPrice,
                    officialPrice,
                    registry.getTotalPriorityAmount(),
                    propertyType
            );

            AnalysisResult saved = analysisRepository.save(
                    AnalysisResult.builder()
                            .member(member)
                            .address(registry.getAddress())
                            .propertyType(propertyType)
                            .ownerName(registry.getOwnerName())
                            .buildingYear(registry.getBuildingYear())
                            .deposit(deposit)
                            .marketPrice(marketPrice)
                            .officialPrice(officialPrice)
                            .totalPriorityAmount(registry.getTotalPriorityAmount())
                            .ltvRatio(ltv.getLtvRatio())
                            .riskLevel(ltv.getRiskLevel())
                            .riskScore(ltv.getRiskScore())
                            .scoreGrade(ltv.getScoreGrade())
                            .insuranceEligible(insurance.getEligible())
                            .hugDebtRatio(insurance.getHugDebtRatio())
                            .priorityRatio(insurance.getPriorityRatio())
                            .totalLtv(insurance.getTotalLtv())
                            .rentalBusiness(registry.isRentalBusiness())
                            .rentalType(registry.getRentalType())
                            .priorityBonds(toBondJson(registry.getPriorityBonds()))
                            .processingStatus(AnalysisProcessingStatus.COMPLETED)
                            .processingErrorMessage(null)
                            .registryFileName(originalFilename(file))
                            .build()
            );

            log.info("분석 결과 저장 완료 - id: {}", saved.getId());
            return toResponse(saved, registry, ltv, insurance, officialPrice);
        } catch (ZiptException e) {
            log.warn("Analysis processing failed. memberId={}, fileName={}, message={}",
                    memberId, originalFilename(file), e.getMessage());
            return saveFailedAnalysis(member, file, deposit, propertyType, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected analysis processing failure. memberId={}, fileName={}",
                    memberId, originalFilename(file), e);
            return saveFailedAnalysis(member, file, deposit, propertyType, ErrorCode.INTERNAL_ERROR.getMessage());
        }
    }

    public List<AnalysisHistoryResponse> getHistory(Long memberId) {
        return analysisRepository
                .findAllByMemberIdOrderByCreatedAtDesc(memberId)
                .stream()
                .map(AnalysisHistoryResponse::from)
                .toList();
    }

    public AnalysisResponse getDetail(Long memberId, Long id) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));

        AnalysisResult result = analysisRepository.findByIdAndMemberId(id, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.ANALYSIS_NOT_FOUND));

        if (AnalysisProcessingStatus.FAILED.equals(result.getProcessingStatus())) {
            return toResponse(result, null, null, null, result.getOfficialPrice());
        }

        InsuranceResult insurance = ltvService.checkInsurance(
                result.getDeposit(),
                result.getMarketPrice(),
                result.getOfficialPrice(),
                result.getTotalPriorityAmount(),
                result.getPropertyType()
        );

        return toResponse(result, null, null, insurance, result.getOfficialPrice());
    }

    @Transactional
    public void deleteAnalysis(Long memberId, Long id) {
        AnalysisResult result = analysisRepository.findByIdAndMemberId(id, memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.ANALYSIS_NOT_FOUND));

        analysisRepository.delete(result);
        log.info("분석 삭제 완료 - id: {}, memberId: {}", id, memberId);
    }

    private AnalysisResponse saveFailedAnalysis(Member member,
                                                MultipartFile file,
                                                Long deposit,
                                                String propertyType,
                                                String errorMessage) {
        AnalysisResult failed = analysisRepository.save(
                AnalysisResult.builder()
                        .member(member)
                        .address(INVALID_ADDRESS)
                        .propertyType(propertyType)
                        .deposit(deposit)
                        .priorityBonds("[]")
                        .processingStatus(AnalysisProcessingStatus.FAILED)
                        .processingErrorMessage(truncate(errorMessage))
                        .registryFileName(originalFilename(file))
                        .build()
        );

        return toResponse(failed, null, null, null, failed.getOfficialPrice());
    }

    private AnalysisResponse toResponse(AnalysisResult e,
                                        RegistryData registry,
                                        LtvResult ltv,
                                        InsuranceResult insurance,
                                        Long officialPrice) {
        return AnalysisResponse.builder()
                .id(e.getId())
                .address(e.getAddress())
                .ownerName(e.getOwnerName())
                .propertyType(e.getPropertyType())
                .buildingYear(e.getBuildingYear())
                .rentalBusiness(e.isRentalBusiness())
                .rentalType(e.getRentalType())
                .priorityBonds(registry != null ? registry.getPriorityBonds() : null)
                .registryWarnings(registry != null ? registry.getRegistryWarnings() : null)
                .deposit(e.getDeposit())
                .marketPrice(e.getMarketPrice())
                .officialPrice(officialPrice)
                .totalPriorityAmount(e.getTotalPriorityAmount())
                .ltvRatio(e.getLtvRatio())
                .riskLevel(e.getRiskLevel())
                .riskScore(e.getRiskScore())
                .scoreGrade(e.getScoreGrade())
                .riskFactors(ltv != null ? ltv.getRiskFactors() : null)
                .insuranceEligible(e.getInsuranceEligible())
                .hugDebtRatio(e.getHugDebtRatio())
                .priorityRatio(e.getPriorityRatio())
                .totalLtv(e.getTotalLtv())
                .insuranceRecommendation(insurance != null ? insurance.getRecommendation() : null)
                .insuranceConditions(insurance != null ? insurance.getConditions() : null)
                .registryImageUrl(e.getRegistryImageUrl())
                .pdfUrl(e.getPdfUrl())
                .analyzedAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .processingStatus(e.getProcessingStatus())
                .processingErrorMessage(e.getProcessingErrorMessage())
                .build();
    }

    private String toBondJson(List<RegistryData.Bond> bonds) {
        if (bonds == null || bonds.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(bonds);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() > 1000 ? value.substring(0, 1000) : value;
    }

    private String originalFilename(MultipartFile file) {
        return file != null ? file.getOriginalFilename() : null;
    }
}
