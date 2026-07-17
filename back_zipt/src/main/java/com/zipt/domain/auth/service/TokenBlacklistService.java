package com.zipt.domain.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "blacklist:";
    private static final String BLACKLIST_VALUE = "logout";

    private final StringRedisTemplate redisTemplate;

    // 로그아웃된 AccessToken을 블랙리스트에 등록. TTL = 토큰 잔여 만료시간
    public void addTokenToBlacklist(String accessToken, long ttlMillis) {
        if(accessToken == null || ttlMillis <= 0) {
            return;
        }
        try {
            String key = KEY_PREFIX + hash(accessToken);
            redisTemplate.opsForValue()
                    .set(key, BLACKLIST_VALUE, Duration.ofMillis(ttlMillis));
        } catch (Exception e) {
            // 등록 실패해도 로그아웃 흐름은 막지 않음.
            log.warn("블랙리스트 등록 실패(Redis 장애). 로그아웃은 계속 진행");
        }
    }

    // 요청 토큰이 블랙리스트에 있는지 확인
    public boolean isBlacklisted(String accessToken) {
        if(accessToken == null) {
            return false;
        }

        try {
            String key = KEY_PREFIX + hash(accessToken);
            log.info("블랙리스트 조회: {}", key);
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            log.warn("블랙리스트 조회 실패(Redis 장애). fail-open으로 통과");
            return false;
        }
    }

    // 토큰 원문을 SHA-256 해시 -> 키 길이 절감 + Redis에 원문 토큰 노출 방지
    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            // SHA-256은 표준 알고리즘
            throw new IllegalStateException("SHA-256 해시 생성 실패", e);
        }
    }

}
