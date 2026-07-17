package com.zipt.domain.term.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.term.dto.SeedPayload;
import com.zipt.domain.term.dto.TermListResponse;
import com.zipt.domain.term.dto.TermResponse;
import com.zipt.domain.term.entity.RealEstateTerm;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;
import com.zipt.domain.term.repository.RealEstateTermRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.s3.S3Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(readOnly = true)
public class TermService {

    private final RealEstateTermRepository repository;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    public TermService(
            RealEstateTermRepository repository,
            S3Service s3Service,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.s3Service = s3Service;
        this.objectMapper = objectMapper;
    }

    /*
     * AWS S3 버킷에 보관 중인 최신 부동산 용어 JSON 파일을 읽어와 데이터베이스에 일괄 갱신 및 추가(Upsert) 작업을 진행합니다.
     *
     * @param s3Key S3 버킷 상의 용어 JSON 파일 경로 (예: seed/terms.json)
     * @return 성공적으로 반영 완료된 부동산 용어의 총 개수
     */
    @Transactional
    public int syncFromS3(String s3Key) {
        // 1. S3Service를 통해 AWS S3의 파일 데이터 스트림(InputStream)을 다운로드
        try (InputStream input = s3Service.download(s3Key)) {
            // 2. Jackson ObjectMapper를 활용하여 JSON 바이너리를 DTO 자바 레코드 객체로 바인딩
            SeedPayload payload = objectMapper.readValue(input, SeedPayload.class);
            if (payload.terms() == null || payload.terms().isEmpty()) {
                return 0;
            }

            int count = 0;
            // 3. JSON에서 로드된 개별 용어 데이터를 하나씩 돌며 DB 반영 작업(Upsert) 수행
            for (SeedPayload.SeedTerm seedTerm : payload.terms()) {
                RealEstateTerm term = repository.findByTermId(seedTerm.id())
                        .map(existing -> {
                            // 3-1. 이미 DB에 동일한 ID의 용어가 존재하는 경우 -> 기존 엔티티 필드값 일괄 업데이트(Update)
                            SeedPayload.SeedZipt zipt = seedTerm.zipt();
                            SeedPayload.SeedOfficial official = seedTerm.official();
                            existing.update(
                                    seedTerm.term(),
                                    new LinkedHashSet<>(seedTerm.aliases() == null ? List.of() : seedTerm.aliases()),
                                    TermCategory.from(seedTerm.category()),
                                    zipt == null ? null : zipt.easy(),
                                    zipt == null ? null : zipt.tip(),
                                    zipt == null ? RiskLevel.NEUTRAL : RiskLevel.from(zipt.risk()),
                                    official == null ? null : official.definition(),
                                    official == null ? null : official.source(),
                                    official == null ? null : official.sourceUrl(),
                                    official == null ? null : official.license(),
                                    official == null ? null : official.fetchedAt(),
                                    seedTerm.isCore()
                            );
                            return existing;
                        })
                        // 3-2. 기존 용어가 존재하지 않는 신규 ID일 경우 -> 신규 엔티티 인스턴스 생성(Insert)
                        .orElseGet(() -> toEntity(seedTerm));
                
                // 4. DB 영속성 컨텍스트 저장 및 데이터 갱신 반영
                repository.save(term);
                count++;
            }
            return count;
        } catch (Exception e) {
            log.error("S3 용어 동기화 실패: {}", e.getMessage(), e);
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
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

    public TermListResponse search(
            String query,
            TermCategory category,
            RiskLevel riskLevel,
            int page,
            int size
    ) {
        // 빈 문자열은 검색 조건에서 제외해 전체 목록/필터 조회와 같은 경로를 사용한다.
        String normalizedQuery = query == null || query.isBlank() ? null : query.trim();
        Page<RealEstateTerm> result = repository.search(
                normalizedQuery,
                category,
                riskLevel,
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"))
        );

        return new TermListResponse(
                LocalDate.now(),
                result.getNumberOfElements(),
                // 프론트가 별도 카테고리 API 없이 필터 목록을 그릴 수 있도록 응답에 포함한다.
                Arrays.stream(TermCategory.values()).map(TermResponse.CategoryResponse::from).toList(),
                result.getContent().stream().map(TermResponse::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    public TermResponse getByTermId(String termId) {
        return repository.findByTermId(termId)
                .map(TermResponse::from)
                .orElseThrow(() -> new ZiptException(ErrorCode.TERM_NOT_FOUND));
    }
}