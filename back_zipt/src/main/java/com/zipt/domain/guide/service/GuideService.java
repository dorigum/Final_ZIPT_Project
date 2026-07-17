package com.zipt.domain.guide.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.guide.dto.GuideListResponse;
import com.zipt.domain.guide.dto.GuideResponse;
import com.zipt.domain.guide.dto.GuideSeedPayload;
import com.zipt.domain.guide.entity.Guide;
import com.zipt.domain.guide.repository.GuideRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.s3.S3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class GuideService {

    private final GuideRepository repository;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper;

    public GuideService(
            GuideRepository repository,
            S3Service s3Service,
            ObjectMapper objectMapper
    ) {
        this.repository = repository;
        this.s3Service = s3Service;
        this.objectMapper = objectMapper;
    }

    /*
     * S3에 보관된 최신 가이드 JSON을 읽어와 DB에 반영합니다.
     * guideId 기준으로 기존 행은 update, 신규 행은 insert 하므로 운영 중 문구 수정이 가능합니다.
     */
    @Transactional
    public int syncFromS3(String s3Key) {
        try (InputStream input = s3Service.download(s3Key)) {
            GuideSeedPayload payload = objectMapper.readValue(input, GuideSeedPayload.class);
            return sync(payload);
        } catch (Exception e) {
            log.error("S3 가이드 동기화 실패: {}", e.getMessage(), e);
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /*
     * S3와 로컬 fallback이 같은 upsert 규칙을 쓰도록 공통 동기화 로직을 분리했습니다.
     * 반환값은 JSON에서 정상 반영된 가이드 개수입니다.
     */
    @Transactional
    public int sync(GuideSeedPayload payload) {
        if (payload == null || payload.guides() == null || payload.guides().isEmpty()) {
            return 0;
        }

        int count = 0;
        for (GuideSeedPayload.SeedGuide seedGuide : payload.guides()) {
            String guideId = normalizeGuideId(seedGuide.id());
            Guide guide = findUpsertTarget(guideId, seedGuide)
                    .map(existing -> {
                        existing.assignGuideId(guideId);
                        existing.update(
                                seedGuide.title(),
                                seedGuide.category(),
                                seedGuide.summary(),
                                seedGuide.content(),
                                seedGuide.tags(),
                                seedGuide.source(),
                                seedGuide.sourceNote(),
                                seedGuide.displayOrder(),
                                seedGuide.isPublished()
                        );
                        return existing;
                    })
                    .orElseGet(() -> toEntity(guideId, seedGuide));

            repository.save(guide);
            count++;
        }
        return count;
    }

    /*
     * guideId는 S3 JSON과 DB 행을 연결하는 기준이라 비어 있으면 upsert가 불가능합니다.
     * 잘못된 seed는 조용히 새 데이터로 넣지 않고 동기화 실패로 드러내는 편이 안전합니다.
     */
    private String normalizeGuideId(String guideId) {
        if (guideId == null || guideId.isBlank()) {
            throw new ZiptException(ErrorCode.INTERNAL_ERROR);
        }
        return guideId.trim();
    }

    /*
     * 우선 guideId로 찾고, 전환 이전에 적재된 데이터는 displayOrder로 한 번 보정합니다.
     * 보정 후에는 guideId가 저장되므로 다음 동기화부터는 guideId 경로만 사용됩니다.
     */
    private Optional<Guide> findUpsertTarget(String guideId, GuideSeedPayload.SeedGuide seedGuide) {
        return repository.findByGuideId(guideId)
                .or(() -> repository.findFirstByGuideIdIsNullAndDisplayOrder(seedGuide.displayOrder()));
    }

    private Guide toEntity(String guideId, GuideSeedPayload.SeedGuide source) {
        return Guide.create(
                guideId,
                source.title(),
                source.category(),
                source.summary(),
                source.content(),
                source.tags(),
                source.source(),
                source.sourceNote(),
                source.displayOrder(),
                source.isPublished()
        );
    }

    public GuideListResponse list(String category, String query) {
        String normalizedCategory = (category == null || category.isBlank() || "all".equalsIgnoreCase(category))
                ? null
                : category.trim();
        String normalizedQuery = (query == null || query.isBlank()) ? null : query.trim().toLowerCase();

        List<GuideResponse> guides = repository.findByPublishedTrueOrderByDisplayOrderAsc().stream()
                .filter(guide -> normalizedCategory == null || normalizedCategory.equalsIgnoreCase(guide.getCategory()))
                .filter(guide -> normalizedQuery == null
                        || guide.getTitle().toLowerCase().contains(normalizedQuery)
                        || guide.getSummary().toLowerCase().contains(normalizedQuery)
                        || guide.getTags().stream().anyMatch(tag -> tag.toLowerCase().contains(normalizedQuery)))
                .map(GuideResponse::from)
                .toList();

        return new GuideListResponse(guides.size(), guides);
    }
}
