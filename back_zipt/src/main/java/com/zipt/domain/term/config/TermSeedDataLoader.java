package com.zipt.domain.term.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.term.dto.SeedPayload;
import com.zipt.domain.term.entity.RealEstateTerm;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;
import com.zipt.domain.term.repository.RealEstateTermRepository;
import com.zipt.domain.term.service.TermService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.LinkedHashSet;
import java.util.List;

@Component
@Slf4j
public class TermSeedDataLoader implements ApplicationRunner {

    private final RealEstateTermRepository repository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private final TermService termService;
    private final String seedLocation;
    private final String s3Key;

    public TermSeedDataLoader(
            RealEstateTermRepository repository,
            ObjectMapper objectMapper,
            ResourceLoader resourceLoader,
            TermService termService,
            @Value("${zipt.terms.seed-location:classpath:seed/terms.json}") String seedLocation,
            @Value("${zipt.terms.s3-key:seed/terms.json}") String s3Key
    ) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
        this.termService = termService;
        this.seedLocation = seedLocation;
        this.s3Key = s3Key;
    }

    /*
     * 스프링 부트 애플리케이션 시작 시(구동 완료 단계) 실행되는 데이터 초기화 로더입니다.
     * S3 동기화를 우선 시도하고, 예외 발생 시 로컬 백업 파일을 로드하는 Fallback 흐름을 갖습니다.
     */
    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            log.info("S3에서 부동산 용어 데이터 동기화를 시도합니다. Key: {}", s3Key);
            // S3 우선 시도
            int count = termService.syncFromS3(s3Key);
            log.info("S3 동기화 성공 — {}개 용어 갱신/등록 완료", count);
        } catch (Exception e) {
            // S3 연동 실패(예: 네트워크 에러, 권한 오류, 파일 누락 등) 시 로컬 JSON 데이터를 통한 복구(Fallback) 처리
            log.warn("S3 동기화에 실패하여 로컬 백업 리소스({})로부터 데이터를 로드합니다. 에러: {}", seedLocation, e.getMessage());
            loadLocalSeed();
        }
    }

    /*
     * 로컬 프로젝트 내 저장된 백업 용어 JSON 파일(classpath:seed/terms.json)을 로드하여
     * 기존 DB에 존재하지 않는 누락된 신규 용어 데이터들을 추가(Insert)합니다.
     */
    private void loadLocalSeed() {
        try {
            Resource seedResource = resourceLoader.getResource(seedLocation);
            if (!seedResource.exists()) {
                log.warn("로컬 백업 용어 데이터 파일이 존재하지 않습니다: {}", seedLocation);
                return;
            }

            try (InputStream input = seedResource.getInputStream()) {
                SeedPayload payload = objectMapper.readValue(input, SeedPayload.class);
                if (payload.terms() == null || payload.terms().isEmpty()) {
                    return;
                }

                // 기존 DB에 이미 적재된 용어(ID 기준)는 필터링하여 순수하게 신규 데이터만 선별
                List<RealEstateTerm> newTerms = payload.terms().stream()
                        .filter(term -> !repository.existsByTermId(term.id()))
                        .map(this::toEntity)
                        .toList();

                if (!newTerms.isEmpty()) {
                    repository.saveAll(newTerms);
                    log.info("로컬 백업 데이터 로드 성공 — {}개 신규 용어 추가 완료", newTerms.size());
                } else {
                    log.info("로컬 백업 데이터 로드 — 새로 추가할 용어가 없습니다.");
                }
            }
        } catch (Exception e) {
            log.error("로컬 백업 용어 데이터 로드 중 치명적인 에러가 발생했습니다.", e);
        }
    }

    private RealEstateTerm toEntity(SeedPayload.SeedTerm source) {
        SeedPayload.SeedOfficial official = source.official();
        SeedPayload.SeedZipt zipt = source.zipt();
        return RealEstateTerm.create(
                source.id(),
                source.term(),
                new LinkedHashSet<>(source.aliases() == null ? List.of() : source.aliases()),
                TermCategory.from(source.category()),
                zipt == null ? null : zipt.easy(),
                zipt == null ? null : zipt.tip(),
                zipt == null ? RiskLevel.NEUTRAL : RiskLevel.from(zipt.risk()),
                official == null ? null : official.definition(),
                official == null ? null : official.source(),
                official == null ? null : official.sourceUrl(),
                official == null ? null : official.license(),
                official == null ? null : official.fetchedAt(),
                source.isCore()
        );
    }
}