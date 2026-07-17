package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

public record PropertyExtract(

        @JsonPropertyDescription("임차주택 소재지. 도로명주소")
        String address,

        @JsonPropertyDescription("건물 구조. 예: 철근콘크리트, 벽돌조 등")
        String buildingStructure,

        @JsonPropertyDescription("건물 용도. 예: 공동주택, 다가구주택, 오피스텔, 근린생활시설 등")
        String buildingPurpose,

        @JsonPropertyDescription("임차할 부분. 동, 층, 호 등")
        String leasedPart
) {
}