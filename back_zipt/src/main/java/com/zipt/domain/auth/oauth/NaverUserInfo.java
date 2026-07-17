package com.zipt.domain.auth.oauth;


import java.util.Map;

public class NaverUserInfo implements OAuth2UserInfo {

    // 네이버 응답은 { resultcode, message, response: {...} } 구조라 response 내부만 보관
    private final Map<String, Object> response;

    @SuppressWarnings("unchecked")
    public NaverUserInfo(Map<String, Object> attributes) {
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override
    public String getProvider() {
        return "naver";
    }

    @Override
    public String getProviderUserId() {
        return (String) response.get("id");
    }

    @Override
    public String getEmail() {
        return (String) response.get("email");
    }

    @Override
    public String getName() {
        // 이름(name) 대신 닉네임(nickname) 사용
        return (String) response.get("nickname");
    }
}
