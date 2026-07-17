package com.zipt.domain.guide.dto;

import java.util.List;

public record GuideListResponse(long count, List<GuideResponse> guides) {
}
