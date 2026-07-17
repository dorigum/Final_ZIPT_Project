package com.zipt.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // OAuth
    UNSUPPORTED_OAUTH_PROVIDER(400, "지원하지 않는 소셜 로그인입니다"),

    // 회원
    MEMBER_NOT_FOUND(404,    "존재하지 않는 회원입니다"),
    EMAIL_DUPLICATED(409,    "이미 사용 중인 이메일입니다"),
    INVALID_PASSWORD(401,    "비밀번호가 올바르지 않습니다"),
    UNAUTHORIZED(401,        "인증에 실패했습니다"),

    // JWT
    JWT_EXPIRED(401,         "토큰이 만료되었습니다"),
    JWT_INVALID(401,         "유효하지 않은 토큰입니다"),
    INVALID_REFRESH_TOKEN(401,    "유효하지 않은 리프레시 토큰입니다"),
    REFRESH_TOKEN_NOT_FOUND(401,  "저장된 리프레시 토큰이 없습니다"),
    REFRESH_TOKEN_MISMATCH(401,   "리프레시 토큰이 일치하지 않습니다"),

    // 분석
    OCR_FAILED(500,          "OCR 분석에 실패했습니다"),
    MARKET_PRICE_FAILED(503, "시세 조회에 실패했습니다"),
    FILE_TOO_LARGE(400,      "파일 크기는 20MB 이하여야 합니다"),
    UNSUPPORTED_FILE(400,    "JPG, PNG, PDF만 업로드 가능합니다"),
    INVALID_REGISTRY_DOCUMENT(422, "등기부등본 문서를 인식하지 못했습니다"),
    ANALYSIS_NOT_FOUND(404,  "분석 결과를 찾을 수 없습니다"),
    OCR_CONFIG_MISSING(500, "OCR 서비스 설정이 필요합니다"),

    // 계약서
    CONTRACT_NOT_FOUND(404, "존재하지 않는 계약서입니다"),
    INVALID_LEASE_CONTRACT(400, "임대차 계약서로 확인되지 않습니다"),
    MULTIPLE_LEASE_CONTRACTS(400, "서로 다른 임대차 계약서가 발견되었습니다"),
    MIXED_DOCUMENTS(400, "임대차 계약서가 아닌 문서가 발견되었습니다"),
    CHECKLIST_ITEM_NOT_FOUND(404, "존재하지 않는 체크리스트 항목입니다"),

    // 용어
    TERM_NOT_FOUND(404,      "존재하지 않는 용어입니다"),
    INVALID_TERM_SEARCH_CONDITION(400, "올바르지 않은 용어 검색 조건입니다"),

    // 공통
    INTERNAL_ERROR(500,      "서버 오류가 발생했습니다");


    private final int    status;
    private final String message;
}
