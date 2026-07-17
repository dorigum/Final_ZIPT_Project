package com.zipt.domain.guide.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.guide.dto.GuideSeedPayload;
import com.zipt.domain.guide.service.GuideService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
@Slf4j
public class GuideSeedDataLoader implements ApplicationRunner {

    private final GuideService guideService;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private final String seedLocation;
    private final String s3Key;

    public GuideSeedDataLoader(
            GuideService guideService,
            ObjectMapper objectMapper,
            ResourceLoader resourceLoader,
            @Value("${zipt.guides.seed-location:classpath:seed/guides.json}") String seedLocation,
            @Value("${zipt.guides.s3-key:seed/guides.json}") String s3Key
    ) {
        this.guideService = guideService;
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
        this.seedLocation = seedLocation;
        this.s3Key = s3Key;
    }

    /*
     * 서버 기동 시 S3의 guides.json을 우선 동기화합니다.
     * S3 접근 실패 시에도 서비스가 빈 데이터로 뜨지 않도록 로컬 백업 JSON을 fallback으로 사용합니다.
     */
    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("S3에서 부동산 계약 가이드 데이터 동기화를 시도합니다. Key: {}", s3Key);
            int count = guideService.syncFromS3(s3Key);
            log.info("S3 가이드 동기화 성공 — {}개 가이드 갱신/등록 완료", count);
        } catch (Exception e) {
            log.warn("S3 가이드 동기화에 실패하여 로컬 백업 리소스({})를 로드합니다. 에러: {}", seedLocation, e.getMessage());
            loadLocalSeed();
        }
    }

    /*
     * 로컬 백업 파일도 S3와 같은 payload 형식을 사용합니다.
     * 운영 S3가 잠시 불안정해도 개발/시연 환경에서는 기본 가이드를 유지할 수 있습니다.
     */
    private void loadLocalSeed() {
        try {
            Resource seedResource = resourceLoader.getResource(seedLocation);
            if (!seedResource.exists()) {
                log.warn("로컬 백업 가이드 데이터 파일이 존재하지 않습니다: {}", seedLocation);
                return;
            }

            try (InputStream input = seedResource.getInputStream()) {
                GuideSeedPayload payload = objectMapper.readValue(input, GuideSeedPayload.class);
                int count = guideService.sync(payload);
                log.info("로컬 백업 가이드 데이터 로드 성공 — {}개 가이드 갱신/등록 완료", count);
            }
        } catch (Exception e) {
            log.error("로컬 백업 가이드 데이터 로드 중 오류가 발생했습니다.", e);
        }
    }
}
