package com.zipt.domain.analysis.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class MarketPriceService {

    @Value("${api.molit.key:}")
    private String molitKey;

    private final WebClient webClient = WebClient.create();

    // 법정동 코드 매핑 (시군구 코드 5자리)
    // OCR 주소에서 시군구 추출 후 매핑
    private static final Map<String, String> LAWD_CD_MAP = new HashMap<>();
    static {
        // 서울
        LAWD_CD_MAP.put("종로구",   "11110");
        LAWD_CD_MAP.put("중구",     "11140");
        LAWD_CD_MAP.put("용산구",   "11170");
        LAWD_CD_MAP.put("성동구",   "11200");
        LAWD_CD_MAP.put("광진구",   "11215");
        LAWD_CD_MAP.put("동대문구", "11230");
        LAWD_CD_MAP.put("중랑구",   "11260");
        LAWD_CD_MAP.put("성북구",   "11290");
        LAWD_CD_MAP.put("강북구",   "11305");
        LAWD_CD_MAP.put("도봉구",   "11320");
        LAWD_CD_MAP.put("노원구",   "11350");
        LAWD_CD_MAP.put("은평구",   "11380");
        LAWD_CD_MAP.put("서대문구", "11410");
        LAWD_CD_MAP.put("마포구",   "11440");
        LAWD_CD_MAP.put("양천구",   "11470");
        LAWD_CD_MAP.put("강서구",   "11500");
        LAWD_CD_MAP.put("구로구",   "11530");
        LAWD_CD_MAP.put("금천구",   "11545");
        LAWD_CD_MAP.put("영등포구", "11560");
        LAWD_CD_MAP.put("동작구",   "11590");
        LAWD_CD_MAP.put("관악구",   "11620");
        LAWD_CD_MAP.put("서초구",   "11650");
        LAWD_CD_MAP.put("강남구",   "11680");
        LAWD_CD_MAP.put("송파구",   "11710");
        LAWD_CD_MAP.put("강동구",   "11740");
        // 경기
        LAWD_CD_MAP.put("분당구",   "41135");
        LAWD_CD_MAP.put("수원시",   "41110");
        LAWD_CD_MAP.put("성남시",   "41130");
        LAWD_CD_MAP.put("고양시",   "41280");
        LAWD_CD_MAP.put("용인시",   "41460");
        LAWD_CD_MAP.put("부천시",   "41190");
        LAWD_CD_MAP.put("안산시",   "41270");
        LAWD_CD_MAP.put("안양시",   "41170");
        LAWD_CD_MAP.put("남양주시", "41360");
        LAWD_CD_MAP.put("화성시",   "41590");
        LAWD_CD_MAP.put("평택시",   "41220");
        LAWD_CD_MAP.put("의정부시", "41150");
        LAWD_CD_MAP.put("파주시",   "41480");
        LAWD_CD_MAP.put("광주시",   "41610");
        LAWD_CD_MAP.put("시흥시",   "41390");
        LAWD_CD_MAP.put("김포시",   "41570");
        LAWD_CD_MAP.put("광명시",   "41210");
        LAWD_CD_MAP.put("하남시",   "41450");
        LAWD_CD_MAP.put("구리시",   "41310");
        LAWD_CD_MAP.put("오산시",   "41370");
        LAWD_CD_MAP.put("이천시",   "41500");
        LAWD_CD_MAP.put("안성시",   "41550");
        LAWD_CD_MAP.put("의왕시",   "41430");
        LAWD_CD_MAP.put("과천시",   "41290");
        LAWD_CD_MAP.put("군포시",   "41410");
        LAWD_CD_MAP.put("양주시",   "41630");
        LAWD_CD_MAP.put("포천시",   "41650");
        LAWD_CD_MAP.put("동두천시", "41250");
        LAWD_CD_MAP.put("여주시",   "41670");
    }

    /**
     * 국토부 실거래가 API → 추정 시세 조회
     * 주소에서 법정동 코드 추출 → 해당 시군구 최근 거래가 평균 반환
     *
     * API: 국토교통부_아파트매매 실거래자료
     * URL: https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade
     *
     */
    public long getMarketPrice(String address) {
        if (molitKey == null || molitKey.isBlank()) {
            log.warn("국토부 API 키 없음 → Mock 시세 반환");
            return 73_000_0000L;   // 7.3억
        }

        try {
            // 1. 주소에서 법정동 코드 추출
            String lawdCd = extractLawdCd(address);
            if (lawdCd == null) {
                log.warn("법정동 코드 추출 실패 — 주소: {} → Mock 반환", address);
                return 73_000_0000L;
            }

            // 2. 전용면적 추출 (유사 면적 거래가 조회용)
            // OCR에서 면적 정보가 없으면 84㎡ 기준으로 조회
            double targetAr = 84.0;

            // 3. 최근 2개월 거래 데이터 조회
            String dealYmd = LocalDate.now()
                    .minusMonths(1)
                    .format(DateTimeFormatter.ofPattern("yyyyMM"));

            String xml = callMolitApi(lawdCd, dealYmd);
            if (xml == null || xml.isBlank()) {
                log.warn("실거래가 API 응답 없음 → Mock 반환");
                return 73_000_0000L;
            }

            // 4. 유사 면적 평균 거래가 계산
            long avgPrice = parseAveragePrice(xml, targetAr);

            if (avgPrice <= 0) {
                log.warn("유사 면적 거래 데이터 없음 → Mock 반환");
                return 73_000_0000L;
            }

            log.info("실거래가 조회 완료 — 법정동: {} → 평균 {}만원", lawdCd, avgPrice / 10000);
            return avgPrice;

        } catch (Exception e) {
            log.error("실거래가 API 호출 실패: {}", e.getMessage());
            return 73_000_0000L;
        }
    }

    /**
     * 공시가격 조회
     * 임시: 실거래가 시세의 70% 로 계산
     * (공시가격은 통상 시세의 60~80% 수준)
     * TODO: 공동주택가격정보 서비스 API 연동 후 교체
     */
    public long getOfficialPrice(String address) {
        long marketPrice = getMarketPrice(address);
        long officialPrice = (long)(marketPrice * 0.7);
        log.info("공시가격 추정 — 시세 {}원 × 0.7 = {}원", //공시가격 api를 찾기가 어려워서 추정공시가격
                marketPrice, officialPrice);
        return officialPrice;
    }

    /**
     * 국토부 실거래가 API 호출
     */
    private String callMolitApi(String lawdCd, String dealYmd) {
        try {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade")
                    .queryParam("serviceKey", molitKey)
                    .queryParam("LAWD_CD",    lawdCd)
                    .queryParam("DEAL_YMD",   dealYmd)
                    .queryParam("numOfRows",  100)
                    .queryParam("pageNo",     1)
                    .toUriString();

            return webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        } catch (Exception e) {
            log.error("API 호출 오류: {}", e.getMessage());
            return null;
        }
    }

    /**
     * XML 응답에서 유사 면적 평균 거래가 계산
     * dealAmount: 만원 단위 → 원 단위로 변환
     * 예) 142,750 → 1,427,500,000원 (14.275억)
     * 전용면적 ±15㎡ 범위 내 거래 데이터 평균 계산
     */
    private long parseAveragePrice(String xml, double targetAr) {
        Pattern dealPattern = Pattern.compile(
                "<dealAmount>([\\d,\\s]+)</dealAmount>.*?<excluUseAr>([\\d.]+)</excluUseAr>",
                Pattern.DOTALL
        );

        Matcher m = dealPattern.matcher(xml);
        long sum   = 0;
        int  count = 0;

        while (m.find()) {
            try {
                long   amount = Long.parseLong(m.group(1).replaceAll("[,\\s]", ""));
                double ar     = Double.parseDouble(m.group(2).trim());

                // 유사 면적 필터 (±15㎡)
                if (Math.abs(ar - targetAr) <= 15.0) {
                    sum += amount * 10_000L;   // 만원 → 원
                    count++;
                }
            } catch (NumberFormatException e) {
                // 파싱 실패 시 skip
            }
        }

        return count > 0 ? sum / count : 0;
    }

    /**
     * 주소에서 법정동 코드(5자리) 추출
     */
    private String extractLawdCd(String address) {
        if (address == null) return null;

        // 시군구 단위로 매핑 (구 → 시 순서로 우선 매핑)
        for (Map.Entry<String, String> entry : LAWD_CD_MAP.entrySet()) {
            if (address.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        log.warn("법정동 코드 매핑 실패 — 주소: {}", address);
        return null;
    }
}