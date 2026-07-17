package com.zipt.config;

import com.zipt.global.redis.RedisProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
@RequiredArgsConstructor
public class RedisConfig {
    // 운영 ElastiCache에서 password/TLS 켜져도 이 파일은 수정 불필요(yml만 변경)

    private final RedisProperties props;

    // spring.data.redis의 host/port 재사용
    @Value("${spring.data.redis.host:localhost}")
    private String host;
    @Value("${spring.data.redis.port:6379}")
    private int port;

    // 공통: DB 번호를 받아 커넥션 팩토리 생성
    private LettuceConnectionFactory createFactory(int database) {
        RedisStandaloneConfiguration conf
                = new RedisStandaloneConfiguration(host, port);
        conf.setDatabase(database);
        return new LettuceConnectionFactory(conf);
    }

    // 블랙리스트 전용 팩토리
    @Bean
    public RedisConnectionFactory blacklistConnectionFactory() {
        return createFactory(props.getBlacklistDatabase());
    }

    // 노이즈 전용 팩토리
    @Bean
    public RedisConnectionFactory cacheConnectionFactory() {
        return createFactory(props.getCacheDatabase());
    }

    // 블랙리스트 템플릿
    @Bean
    public StringRedisTemplate stringRedisTemplate(
            @Qualifier("blacklistConnectionFactory") RedisConnectionFactory connectionFactory
    ) {
        return new StringRedisTemplate(connectionFactory);
    }

    @Bean
    public RedisCacheManager cacheManager(
            @Qualifier("cacheConnectionFactory") RedisConnectionFactory connectionFactory
    ) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1)) // 캐시 만료 시간 (1시간)
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer())); // 객체->JSON
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }


}
