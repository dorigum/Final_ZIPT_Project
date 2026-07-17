package com.zipt.domain.term.dto;

import java.time.LocalDate;
import java.util.List;

/*
 * AWS S3 또는 로컬 백업 JSON 파일로부터 부동산 용어 데이터를 역직렬화하기 위한 DTO 레코드 패키지입니다.
 */
public record SeedPayload(List<SeedTerm> terms) {
    
    /*
     * 개별 부동산 용어 원시 데이터를 담는 레코드입니다.
     * 
     * @param id 용어 고유 식별자 (ID)
     * @param term 용어명
     * @param aliases 동의어/약어 리스트
     * @param category 용어 카테고리 (예: 계약, 등기, 세금 등)
     * @param official 외부 출처 원문 정보
     * @param zipt ZIPT 가공 쉬운 정의 및 팁 정보
     * @param isCore 메인 화면 노출 여부 (핵심 용어)
     */
    public record SeedTerm(
            String id,
            String term,
            List<String> aliases,
            String category,
            SeedOfficial official,
            SeedZipt zipt,
            boolean isCore
    ) {}

    /*
     * 공공데이터 등 외부 출처의 용어 정의와 메타데이터를 담는 레코드입니다.
     */
    public record SeedOfficial(
            String definition,
            String source,
            String sourceUrl,
            String license,
            LocalDate fetchedAt
    ) {}

    /*
     * ZIPT 서비스 자체에서 재가공한 쉬운 정의, 가이드 팁, 위험도(경고 레벨) 데이터를 담는 레코드입니다.
     */
    public record SeedZipt(String easy, String tip, String risk) {}
}


