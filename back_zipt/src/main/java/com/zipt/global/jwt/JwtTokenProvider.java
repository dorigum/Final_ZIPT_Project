package com.zipt.global.jwt;

import com.zipt.domain.member.entity.Member;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    // application.properties에서 값 주입
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-expiration:1209600000}") long refreshTokenExpiration
    ) {
        // 문자열 시크릿 키 → HMAC-SHA 용 SecretKey 객체로 변환
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    // Access Token 발급
    public String generateAccessToken(String email, String role) {
        return Jwts.builder()
                .subject(email)                             // 토큰 주체 (email)
                .claim("role", role)                        // 추가 클레임 (권한 정보)
                .issuedAt(new Date())                       // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(secretKey)                        // 서명
                .compact();
    }

    // Access Token 발급 (Member id 포함)
    public String generateAccessToken(Member member, String role) {
        return Jwts.builder()
                .subject(member.getEmail())                             // 토큰 주체 (email)
                .claim("id", member.getId())
                .claim("role", role)                        // 추가 클레임 (권한 정보)
                .issuedAt(new Date())                       // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(secretKey)                        // 서명
                .compact();
    }

    // Refresh Token 발급 (email만 담은 가벼운 토큰)
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    // Refresh Token 발급 (member)
    public String generateRefreshToken(Member member) {
        return Jwts.builder()
                .subject(member.getEmail())
                .claim("id", member.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(secretKey)
                .compact();
    }

    // Refresh Token 만료 시각 조회 (DB 저장용)
    public LocalDateTime getRefreshTokenExpiry() {
        return LocalDateTime.now().plus(refreshTokenExpiration, ChronoUnit.MILLIS);
    }

    // 토큰에서 id 추출
    public Long getId(String token) {
        return getClaims(token).get("id", Long.class);
    }

    // 토큰에서 email 추출
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    // 토큰에서 role 추출
    public String getRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            getClaims(token); // 파싱 실패하면 예외 발생
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 토큰 남은 만료시간 반환(ms) - 블랙리스트 TTL 계산용
    // 이미 만료됐거나 파싱 실패 시 0 반환 (호출부에서 0이면 등록 skip)
    public long getRemainingTime(String token) {
        try {
            Date expiration =
                    getClaims(token).getExpiration();
            long remaining =
                    expiration.getTime() - System.currentTimeMillis();
            return Math.max(0, remaining);
        } catch (Exception e) {
            return 0;
        }
    }

    // 토큰 파싱 → Claims 추출 (내부 공통 메서드)
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
