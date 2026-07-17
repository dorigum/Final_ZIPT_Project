package com.zipt.domain.guide.dto;

import com.zipt.domain.guide.entity.Guide;

import java.util.List;

public record GuideResponse(
        Long id,
        String guideId,
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
    public static GuideResponse from(Guide guide) {
        return new GuideResponse(
                guide.getId(),
                guide.getGuideId(),
                guide.getTitle(),
                guide.getCategory(),
                guide.getSummary(),
                guide.getContent(),
                guide.getTags(),
                guide.getSource(),
                guide.getSourceNote(),
                guide.getDisplayOrder(),
                guide.isPublished()
        );
    }
}
