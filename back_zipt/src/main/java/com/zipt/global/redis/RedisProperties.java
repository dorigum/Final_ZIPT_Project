package com.zipt.global.redis;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "zipt.redis")
@Getter
@Setter
public class RedisProperties {
    // Spring의 relaxed binding 규칙에 의해 yml에서 자동 매핑
    private int cacheDatabase = 1; // zipt.redis.noise-database
    private int blacklistDatabase = 0; // zipt.redis.blacklist-database
}
