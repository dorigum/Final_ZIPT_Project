package com.zipt.domain.noise.service;

import com.zipt.domain.noise.dto.NoiseReport;
import com.zipt.domain.noise.dto.NoiseTypeItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoiseService {

    private final WebClient webClient;

    @Value("${api.molit.key}")
    private String apiKey;

    @Value("${api.noise.api-url-reason}")
    private String apiUrlReason;

    @Value("${api.noise.api-url-region}")
    private String apiUrlRegion;

    @Cacheable(value = "noiseReport", key = "#address")
    public NoiseReport analyzeNoise(String address) {
        log.info("층간소음 분석 시작: {}", address);

        try {
            // Step 1: 두 API 호출
            Map<String, Object> reasonData = fetchReasonAnalysis();
            Map<String, Object> regionData = fetchRegionAnalysis();

            // Step 2: 지역 추출
            String region = extractRegion(address);

            // Step 3: 최종 보고서 생성
            NoiseReport report = buildNoiseReport(address, region, reasonData, regionData);

            log.info("층간소음 분석 완료: {} - 민원건수: {}", address, report.getComplaintCount());
            return report;

        } catch (Exception e) {
            log.error("층간소음 분석 오류: {}", e.getMessage(), e);
            return createDefaultReport(address);
        }
    }

    private Map<String, Object> fetchReasonAnalysis() {
        log.debug("원인별 분석 API 호출: {}", apiUrlReason);
        try {
            String url = apiUrlReason +
                    "?serviceKey=" + apiKey +
                    "&page=1&perPage=50&returnType=json";

            Map<String, Object> response = webClient.get()
                    .uri(url)  // ← 전체 URL을 바로 전달
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .block();

            log.debug("원인별 분석 API 응답: {}", response != null ? "성공" : "실패");
            return response != null ? response : new HashMap<>();
        } catch (Exception e) {
            log.error("원인별 분석 API 호출 실패: {}", e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * 지역별 분석 API 호출
     */
    private Map<String, Object> fetchRegionAnalysis() {
        log.debug("지역별 분석 API 호출: {}", apiUrlRegion);
        try {
            String url = apiUrlRegion +
                    "?serviceKey=" + apiKey +
                    "&page=1&perPage=50&returnType=json";

            Map<String, Object> response = webClient.get()
                    .uri(url)  // ← 전체 URL을 바로 전달
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .block();

            log.debug("지역별 분석 API 응답: {}", response != null ? "성공" : "실패");
            return response != null ? response : new HashMap<>();
        } catch (Exception e) {
            log.error("지역별 분석 API 호출 실패: {}", e.getMessage());
            return new HashMap<>();
        }
    }
    /**
     * 주소에서 지역명 추출
     */
    private String extractRegion(String address) {
        if (address == null || address.isEmpty()) return "";
        String[] parts = address.split(" ");
        if (parts.length > 0) {
            String sido = parts[0];
            // "서울시" → "서울"
            return sido
                    .replace("광역시", "")
                    .replace("시", "")
                    .replace("도", "");
        }
        return "";
    }

    /**
     * 두 API 응답을 합쳐서 NoiseReport 생성
     */
    private NoiseReport buildNoiseReport(String address, String region,
                                         Map<String, Object> reasonData,
                                         Map<String, Object> regionData) {
        List<NoiseTypeItem> noiseItems = new ArrayList<>();
        int totalCount = 0;
        int regionalCount = 0;

        // ========== 원인별 분석 데이터 처리 ==========
        try {
            List<?> reasonDataList = (List<?>) reasonData.get("data");
            if (reasonDataList != null && !reasonDataList.isEmpty()) {
                Map<String, Object> item = (Map<String, Object>) reasonDataList.get(0);

                totalCount = calculateReasonTotal(item);

                noiseItems.add(createNoiseItem("뛰거나 걷는 소리",
                        getIntValue(item, "뛰거나 걷는 소리"), totalCount));
                noiseItems.add(createNoiseItem("망치질",
                        getIntValue(item, "망치질"), totalCount));
                noiseItems.add(createNoiseItem("가구 이동",
                        getIntValue(item, "가구 (끌거나 찍는 행위)"), totalCount));
                noiseItems.add(createNoiseItem("문 개폐",
                        getIntValue(item, "문 개폐"), totalCount));
                noiseItems.add(createNoiseItem("가전제품",
                        getIntValue(item, "가전제품(TV 청소기 세탁기)"), totalCount));
                noiseItems.add(createNoiseItem("악기",
                        getIntValue(item, "악기(피아노 등)"), totalCount));
                noiseItems.add(createNoiseItem("기타",
                        getIntValue(item, "기타"), totalCount));
            }
        } catch (Exception e) {
            log.warn("원인별 데이터 처리 실패: {}", e.getMessage());
        }

        // ========== 지역별 분석 데이터 처리 ==========
        List<?> regionDataList = null;  // ← 여기서 선언!
        try {
            regionDataList = (List<?>) regionData.get("data");  // ← 여기서 할당
            if (regionDataList != null && !regionDataList.isEmpty()) {
                // 최신 데이터 (마지막 항목) 선택
                Map<String, Object> item = (Map<String, Object>) regionDataList.get(regionDataList.size() - 1);
                regionalCount = getIntValue(item, region);

                log.debug("지역별 데이터 - 연도: {}, 지역: {}, 건수: {}",
                        item.get("연도"), region, regionalCount);
            }
        } catch (Exception e) {
            log.warn("지역별 데이터 처리 실패: {}", e.getMessage());
        }

        // ========== 최종 리포트 생성 ==========
//        int noiseLevel = calculateNoiseLevel(totalCount);
//        String riskLevel = determineRiskLevel(totalCount);
        //지역별 추가
        int noiseLevel = calculateNoiseLevel(regionalCount);
        String riskLevel = determineRiskLevel(regionalCount);

        return NoiseReport.builder()
                .address(address)
                .region(region)
                .regionalComplaintCount(regionalCount)
                //.complaintCount(totalCount)
                .complaintCount(regionalCount)
                .noiseLevel(noiseLevel)
                .riskLevel(riskLevel)
                .stats(noiseItems)
                .extractionConfidence(0.95)
                .analyzed(true)
                .analyzedAt(System.currentTimeMillis())
                .build();
    }

    /**
     * NoiseTypeItem 생성 헬퍼 메서드
     */
    private NoiseTypeItem createNoiseItem(String category, int count, int total) {
        return NoiseTypeItem.builder()
                .category(category)
                .count(count)
                .percentage(calculatePercentage(count, total))
                .build();
    }

    /**
     * Map에서 정수값 추출
     */
    private int getIntValue(Map<String, Object> data, String key) {
        try {
            Object value = data.get(key);
            if (value != null && value instanceof Number) {
                return ((Number) value).intValue();
            }
        } catch (Exception e) {
            log.warn("값 추출 실패 - key: {}, error: {}", key, e.getMessage());
        }
        return 0;
    }

    /**
     * 원인별 총 민원 건수 계산
     */
    private int calculateReasonTotal(Map<String, Object> data) {
        int total = 0;
        String[] reasons = {
                "뛰거나 걷는 소리",
                "망치질",
                "가구 (끌거나 찍는 행위)",
                "문 개폐",
                "가전제품(TV 청소기 세탁기)",
                "악기(피아노 등)",
                "기타"
        };

        for (String reason : reasons) {
            total += getIntValue(data, reason);
        }
        return total;
    }

    /**
     * 소음 수준 계산
     */
    private int calculateNoiseLevel(int complaintCount) {
        return Math.min(90, Math.max(50, 50 + (complaintCount / 10)));
    }

    /**
     * 위험도 판정
     */
    private String determineRiskLevel(int complaintCount) {
        if (complaintCount == 0) {
            return "LOW";
        } else if (complaintCount <= 50) {
            return "MEDIUM";
        } else {
            return "HIGH";
        }
    }

    /**
     * 백분율 계산
     */
    private Double calculatePercentage(int value, int total) {
        if (total == 0) return 0.0;
        return (double) (value * 100) / total;
    }

    /**
     * 기본 보고서 (오류 시)
     */
    private NoiseReport createDefaultReport(String address) {
        return NoiseReport.builder()
                .address(address)
                .complaintCount(0)
                .noiseLevel(50)
                .riskLevel("LOW")
                .stats(new ArrayList<>())
                .extractionConfidence(0.0)
                .analyzed(false)
                .analyzedAt(System.currentTimeMillis())
                .build();
    }

    /**
     * 지역 통계 조회
     */
    @Cacheable(value = "noiseStats", key = "#address")
    public Map<String, Object> getNoiseStats(String address) {
        log.info("지역 통계 조회: {}", address);
        return fetchRegionAnalysis();
    }
}