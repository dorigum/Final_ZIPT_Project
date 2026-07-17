package com.zipt.domain.analysis.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class AnalysisRequest {

    // multipart/form-data로 전달
    // registryImage: MultipartFile (Controller에서 별도 파라미터로 받음)

    @NotNull(message = "전세보증금을 입력해주세요")
    @Min(value = 1, message = "전세보증금은 1원 이상이어야 합니다")
    private Long deposit;               // 전세보증금

    @NotBlank(message = "매물 유형을 선택해주세요")
    private String propertyType;        // 아파트, 빌라, 오피스텔
}
