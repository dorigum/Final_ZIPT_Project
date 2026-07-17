package com.zipt.domain.term.entity;

public enum RiskLevel {
    SAFE,
    WARN,
    DANGER,
    NEUTRAL;

    // 위험도 값이 비어 있는 시드 데이터는 중립으로 처리해 용어 노출 자체는 유지한다.
    public static RiskLevel from(String value) {
        return value == null || value.isBlank() ? NEUTRAL : valueOf(value.trim().toUpperCase());
    }
}
