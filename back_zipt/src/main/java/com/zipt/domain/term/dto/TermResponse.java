package com.zipt.domain.term.dto;

import com.zipt.domain.term.entity.RealEstateTerm;
import com.zipt.domain.term.entity.TermCategory;

import java.time.LocalDate;
import java.util.List;

public record TermResponse(
        String id,
        String term,
        List<String> aliases,
        CategoryResponse category,
        OfficialDefinition official,
        ZiptDefinition zipt,
        boolean isCore
) {
    // DB 엔티티 구조를 API 계약에 맞춰 official/zipt 섹션으로 나눠 내려준다.
    public static TermResponse from(RealEstateTerm term) {
        OfficialDefinition official = term.getOfficialDefinition() == null
                ? null
                : new OfficialDefinition(
                        term.getOfficialDefinition(),
                        term.getSourceName(),
                        term.getSourceUrl(),
                        term.getLicense(),
                        term.getFetchedAt()
                );

        ZiptDefinition zipt = term.getEasyDefinition() == null
                ? null
                : new ZiptDefinition(
                        term.getEasyDefinition(),
                        term.getActionTip(),
                        term.getRiskLevel() != null ? term.getRiskLevel().name().toLowerCase() : null
                );

        return new TermResponse(
                term.getTermId(),
                term.getName(),
                term.getAliases().stream().sorted().toList(),
                CategoryResponse.from(term.getCategory()),
                official,
                zipt,
                term.isCore()
        );
    }

    public record CategoryResponse(String code, String label) {
        public static CategoryResponse from(TermCategory category) {
            return new CategoryResponse(category.name(), category.label());
        }
    }

    public record OfficialDefinition(
            String definition,
            String source,
            String sourceUrl,
            String license,
            LocalDate fetchedAt
    ) {
    }

    public record ZiptDefinition(String easy, String tip, String risk) {
    }
}