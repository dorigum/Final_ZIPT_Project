package com.zipt.domain.guide.dto;

import java.util.List;

// S3 원본 guides.json과 로컬 백업 guides.json을 같은 구조로 역직렬화하기 위한 DTO입니다.
public record GuideSeedPayload(List<SeedGuide> guides) {

    public record SeedGuide(
            // DB upsert 기준이 되는 고정 키입니다. 제목이 바뀌어도 이 값은 유지해야 합니다.
            String id,
            String title,
            String category,
            String summary,
            String content,
            List<String> tags,
            String source,
            String sourceNote,
            int displayOrder,
            boolean isPublished
    ) {
    }
}
