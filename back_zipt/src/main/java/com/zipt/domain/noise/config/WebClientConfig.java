package com.zipt.domain.noise.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    /**
     * WebClient 빈 설정 (Noise 전용)
     * - 비동기 HTTP 호출을 위한 WebClient 구성
     * - 타임아웃: 10초
     * - 메모리 버퍼: 16MB
     */
    @Bean
    public WebClient noiseWebClient() {  // 
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024)) // 16MB
                .build();

        return WebClient.builder()
                .baseUrl("https://api.odcloud.kr/api")
                .exchangeStrategies(strategies)
                .build();
    }
}