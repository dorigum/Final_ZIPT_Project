package com.zipt.domain.auth.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken
) {
}
