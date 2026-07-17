package com.zipt.domain.analysis.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * OCR로 추출한 등기부등본 데이터
 * OcrService → AnalysisService로 전달
 */
@Getter
@Builder
public class RegistryData {

    private String       address;               // 주소
    private String       ownerName;             // 소유자
    private Integer      buildingYear;          // 건축연도
    private boolean      rentalBusiness;        // 임대사업자 여부
    private String       rentalType;            // 장기일반민간임대

    private String propertyType;    // 건물용도 추가
    private List<Bond>   priorityBonds;         // 선순위 채권 목록
    private Long         totalPriorityAmount;   // 선순위 채권 합계

    private List<String> registryWarnings;      // 가등기·가처분 등 이상 징후

    @Getter
    @Builder
    public static class Bond {
        private int    rank;
        private String type;       // 근저당권, 가압류
        private String creditor;   // 채권자
        private String date;       // 설정일
        private Long   amount;     // 채권최고액
    }
}
