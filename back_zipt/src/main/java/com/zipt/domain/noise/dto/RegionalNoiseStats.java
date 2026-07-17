package com.zipt.domain.noise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionalNoiseStats {

    @JsonProperty("page")
    private Integer page;

    @JsonProperty("perPage")
    private Integer perPage;

    @JsonProperty("totalCount")
    private Integer totalCount;

    @JsonProperty("currentCount")
    private Integer currentCount;

    @JsonProperty("matchCount")
    private Integer matchCount;

    @JsonProperty("data")
    private List<NoiseDataItem> data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoiseDataItem {

        @JsonProperty("연도")
        private Integer year;

        @JsonProperty("뛰거나 걷는 소리")
        private Integer running;

        @JsonProperty("망치질")
        private Integer hammering;

        @JsonProperty("가구 (끌거나 찍는 행위)")
        private Integer furniture;

        @JsonProperty("문 개폐")
        private Integer door;

        @JsonProperty("가전제품(TV 청소기 세탁기)")
        private Integer appliance;

        @JsonProperty("악기(피아노 등)")
        private Integer instrument;

        @JsonProperty("기타")
        private Integer other;

        // 총합 계산
        public Integer getTotal() {
            return (running != null ? running : 0) +
                    (hammering != null ? hammering : 0) +
                    (furniture != null ? furniture : 0) +
                    (door != null ? door : 0) +
                    (appliance != null ? appliance : 0) +
                    (instrument != null ? instrument : 0) +
                    (other != null ? other : 0);
        }
    }
}