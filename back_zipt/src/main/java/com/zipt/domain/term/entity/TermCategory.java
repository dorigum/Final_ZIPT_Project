package com.zipt.domain.term.entity;

import java.util.Arrays;

public enum TermCategory {
    DEPOSIT_SAFETY("보증금 안전·위험 예방"),
    CONTRACT_BASICS("계약·계약서"),
    HOUSING_TYPE("주거 형태·주택 구조"),
    AREA_PRICE_POLICY("면적·가격·정책");

    private final String label;

    TermCategory(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    // seed JSON에는 enum 이름을 쓰지만, 추후 API 요청에서는 화면 라벨도 허용할 수 있도록 열어둔다.
    public static TermCategory from(String value) {
        String normalized = value == null ? "" : value.trim();
        return Arrays.stream(values())
                .filter(category -> category.name().equalsIgnoreCase(normalized) || category.label.equals(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 용어 카테고리입니다: " + value));
    }
}
