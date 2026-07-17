package com.zipt.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

	@Bean
	public ChatClient chatClient(ChatClient.Builder builder) {
		return builder
				.defaultSystem("""
                        당신은 부동산 계약 전문 엔진입니다.
                        반드시 사용자가 제공한 정보만 사용하세요.
                        텍스트에 없는 값은 null로 설정하세요.
                        """)
				.build();
	}


}