package com.zipt.domain.auth.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Refresh Token 쿠키 생성 로직을 한 곳에서 관리
 */
@Component
public class RefreshTokenCookieProvider {
    public static final String COOKIE_NAME = "refreshToken";
    private static final Duration MAX_AGE = Duration.ofDays(14);

    private final boolean secure;
    private final String sameSite;

    public RefreshTokenCookieProvider(@Value("${cookie.refresh.secure}") boolean secure,
                                      @Value("${cookie.refresh.same-site}") String sameSite) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public ResponseCookie create(String refreshToken) {
        return ResponseCookie.from(COOKIE_NAME, refreshToken)
                .maxAge(MAX_AGE)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .httpOnly(true)
                .build();
    }

    public ResponseCookie expire() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .maxAge(Duration.ZERO)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .httpOnly(true)
                .build();
    }


}
