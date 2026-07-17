package com.zipt.domain.auth.controller;

import com.zipt.domain.auth.dto.TokenResponse;
import com.zipt.domain.auth.service.AuthService;
import com.zipt.domain.auth.util.RefreshTokenCookieProvider;
import com.zipt.domain.member.dto.CreateMemberDto;
import com.zipt.domain.member.service.MemberService;
import com.zipt.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberService memberService;
    private final AuthService authService;
    private final RefreshTokenCookieProvider refreshTokenCookieProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request, HttpServletResponse response) {

        String email = request.get("email");
        String password = request.get("password");
        TokenResponse tokens = authService.login(email, password);

        setRefreshTokenCookie(response, tokens.refreshToken());
        return ResponseEntity.ok(new TokenResponse(tokens.accessToken(), null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
            ) {
        TokenResponse tokens = authService.reissue(refreshToken);
        return ResponseEntity.ok(new TokenResponse(tokens.accessToken(), null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody CreateMemberDto dto) {
        memberService.createMember(dto);
        // 가입 성공 메시지
        return ResponseEntity.ok(ApiResponse.ok("회원가입이 완료되었습니다."));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        String accessToken =
                resolveAccessToken(authorization);
        authService.logout(accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }

    private String resolveAccessToken(String authorization) {
        if(authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = refreshTokenCookieProvider.create(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
