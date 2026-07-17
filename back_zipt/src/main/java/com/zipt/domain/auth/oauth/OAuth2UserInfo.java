package com.zipt.domain.auth.oauth;

public interface OAuth2UserInfo {
    String getProvider(); // "google", "kakao", "naver"
    String getProviderUserId();
    String getEmail();
    String getName();
}
