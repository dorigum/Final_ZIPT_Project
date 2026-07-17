package com.zipt.domain.auth.oauth;

import com.zipt.domain.auth.dto.TokenResponse;
import com.zipt.domain.auth.service.AuthService;
import com.zipt.domain.auth.util.RefreshTokenCookieProvider;
import com.zipt.domain.member.entity.Member;
import com.zipt.global.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthService authService;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;

    // 로그인 성공 후 토큰을 들려 보낼 프론트 주소(env로 교체 가능)
    @Value("${oauth2.redirect-uri:http://localhost:5173/oauth/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // 1. 인증 객체에서 provider + 사용자 attributes 꺼냄
        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;

        // 기존 Member email 필드 제거 - 이정건
//        String provider = authToken.getAuthorizedClientRegistrationId();
        OAuth2User principal = authToken.getPrincipal();

        // 2. 공통 형태 변환 -> email 추출
//        OAuth2UserInfo userInfo = OAuth2UserInfoFactory
//                .getOAuth2UserInfo(provider, principal.getAttributes());
//        String email = userInfo.getEmail();
        Member member = (Member) principal.getAttributes().get("member");

        // 3. 권한(role)은 CustomOAuth2UserService가 심어둔 값 그대로 사용
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        // 일반 로그인과 동일 경로로 발급 + Auth 저장
        TokenResponse tokens = authService.issueTokens(member, role);

        // refresh는 URL대신 HttpOnly 쿠키에 저장(노출 최소화)
        ResponseCookie refreshCookie = refreshTokenCookieProvider.create(tokens.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // access만 쿼리로 전달
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", tokens.accessToken())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
