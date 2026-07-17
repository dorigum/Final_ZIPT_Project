package com.zipt.domain.noise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoiseTypeItem implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 민원 유형 (예: 층간소음, 건설소음 등)
     */
    @JsonProperty("category")
    private String category;

    /**
     * 유형별 민원 건수
     */
    @JsonProperty("count")
    private Integer count;

    /**
     * 비율 (%)
     */
    @JsonProperty("percentage")
    private Double percentage;

    /**
     * 지역명
     */
    @JsonProperty("region")
    private String region;

    /**
     * 시군구명
     */
    @JsonProperty("subRegion")
    private String subRegion;

    /**
     * 연도
     */
    @JsonProperty("year")
    private String year;

    /**
     * 추세 (상승/하강/보합)
     */
    @JsonProperty("trend")
    private String trend;
}
