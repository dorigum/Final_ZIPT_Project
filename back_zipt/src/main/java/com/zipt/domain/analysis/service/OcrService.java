package com.zipt.domain.analysis.service;

import com.zipt.domain.analysis.dto.RegistryData;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.ocr.OcrTextExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrService {

    private static final String INVALID_ADDRESS = "주소 인식 불가";
    private static final List<String> REGISTRY_TITLE_KEYWORDS = List.of(
            "등기사항전부증명서",
            "등기사항",
            "등기부"
    );
    private static final List<String> REGISTRY_SECTION_KEYWORDS = List.of(
            "표제부",
            "갑구",
            "을구"
    );
    private static final List<String> REGISTRY_DETAIL_KEYWORDS = List.of(
            "순위번호",
            "등기목적",
            "접수",
            "권리자 및 기타사항",
            "표시번호",
            "부동산의 표시",
            "소유권",
            "근저당권",
            "채권최고액"
    );

    private final OcrTextExtractionService ocrTextExtractionService;

    public RegistryData extract(MultipartFile file) {
        String fullText = ocrTextExtractionService.extractText(file);
        validateRegistryDocumentText(fullText);

        RegistryData registryData = parseRegistryText(fullText);
        validateParsedRegistryData(registryData);
        return registryData;
    }

    private RegistryData parseRegistryText(String text) {
        List<RegistryData.Bond> bonds = new ArrayList<>();
        long total = 0;
        List<String> warnings = new ArrayList<>();

        Integer buildingYear = null;
        Pattern yearPattern = Pattern.compile("(\\d{4})년\\s*\\d{1,2}월\\s*\\d{1,2}일");
        Matcher ym = yearPattern.matcher(text);
        if (ym.find()) {
            try {
                buildingYear = Integer.parseInt(ym.group(1));
            } catch (NumberFormatException e) {
                log.warn("건축연도 파싱 실패");
            }
        }

        String ownerName = null;
        Pattern ownerPattern = Pattern.compile("소유자\\s+([가-힣]{2,10})");
        Matcher om = ownerPattern.matcher(text);
        if (om.find()) {
            ownerName = om.group(1).trim();
            log.info("소유자명 추출: {}", ownerName);
        }

        String propertyType = "기타";
        for (String t : List.of("아파트", "오피스텔", "다세대", "빌라", "단독주택", "근린주택")) {
            if (text.contains(t)) {
                propertyType = t;
                break;
            }
        }

        Pattern mortgagePattern = Pattern.compile("채권최고액\\s*금\\s*([\\d,]+)\\s*원");
        Matcher mm = mortgagePattern.matcher(text);
        int rank = 1;
        while (mm.find()) {
            long amount = Long.parseLong(mm.group(1).replace(",", ""));
            bonds.add(RegistryData.Bond.builder()
                    .rank(rank++)
                    .type("근저당권")
                    .creditor("금융기관")
                    .amount(amount)
                    .build());
            total += amount;
        }

        Pattern seizurePattern = Pattern.compile("청구금액\\s*금\\s*([\\d,]+)\\s*원");
        Matcher sm = seizurePattern.matcher(text);
        while (sm.find()) {
            long amount = Long.parseLong(sm.group(1).replace(",", ""));
            bonds.add(RegistryData.Bond.builder()
                    .rank(rank++)
                    .type("가압류")
                    .creditor("미상")
                    .amount(amount)
                    .build());
            total += amount;
        }

        if (text.contains("가등기")) warnings.add("가등기 발견 - 소유권 이전 분쟁 가능성");
        if (text.contains("가처분")) warnings.add("가처분 발견 - 처분 제한 상태");
        if (text.contains("예고등기")) warnings.add("예고등기 발견 - 등기 무효 소송 진행 중");

        boolean isRental = List.of("민간임대주택", "임대사업자", "장기일반민간임대")
                .stream().anyMatch(text::contains);
        String rentalType = text.contains("공공지원") ? "공공지원민간임대"
                : text.contains("장기일반") ? "장기일반민간임대" : null;

        Pattern addrPattern = Pattern.compile(
                "(서울|경기|부산|인천|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\\n]{0,80}(호|층|동|번지)"
        );
        Matcher am = addrPattern.matcher(text);
        String address = am.find() ? am.group(0).trim() : INVALID_ADDRESS;

        return RegistryData.builder()
                .address(address)
                .ownerName(ownerName)
                .buildingYear(buildingYear)
                .propertyType(propertyType)
                .priorityBonds(bonds)
                .totalPriorityAmount(total)
                .rentalBusiness(isRental)
                .rentalType(rentalType)
                .registryWarnings(warnings)
                .build();
    }

    private void validateRegistryDocumentText(String text) {
        if (text == null || text.isBlank()) {
            throw new ZiptException(ErrorCode.INVALID_REGISTRY_DOCUMENT);
        }

        long titleKeywordCount = countMatchedKeywords(text, REGISTRY_TITLE_KEYWORDS);
        long sectionKeywordCount = countMatchedKeywords(text, REGISTRY_SECTION_KEYWORDS);
        long detailKeywordCount = countMatchedKeywords(text, REGISTRY_DETAIL_KEYWORDS);

        // 단순 안내문이나 매뉴얼에도 "등기부", "갑구", "을구"가 등장할 수 있어 실제 등기부 구조 키워드를 함께 확인합니다.
        if (titleKeywordCount < 1 || sectionKeywordCount < 1 || detailKeywordCount < 1) {
            throw new ZiptException(ErrorCode.INVALID_REGISTRY_DOCUMENT);
        }
    }

    private long countMatchedKeywords(String text, List<String> keywords) {
        return keywords.stream()
                .filter(text::contains)
                .count();
    }

    private void validateParsedRegistryData(RegistryData registryData) {
        if (registryData == null
                || registryData.getAddress() == null
                || registryData.getAddress().isBlank()
                || INVALID_ADDRESS.equals(registryData.getAddress())) {
            throw new ZiptException(ErrorCode.INVALID_REGISTRY_DOCUMENT);
        }
    }
}
