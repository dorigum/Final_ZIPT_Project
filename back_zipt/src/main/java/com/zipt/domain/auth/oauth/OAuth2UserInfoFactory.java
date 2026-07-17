package com.zipt.domain.auth.oauth;

import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;

import java.util.Map;

public class OAuth2UserInfoFactory {

    @SuppressWarnings("unchecked")
    public static OAuth2UserInfo getOAuth2UserInfo(
            String provider,
            Map<String, Object> attributes
    ) {
        return switch (provider.toLowerCase()) {
            case "google" -> new GoogleUserInfo(attributes);
            case "kakao" -> new KakaoUserInfo(attributes);
            case "naver" -> new NaverUserInfo(attributes);
            default -> throw new ZiptException(ErrorCode.UNSUPPORTED_OAUTH_PROVIDER);
        };
    }
}
