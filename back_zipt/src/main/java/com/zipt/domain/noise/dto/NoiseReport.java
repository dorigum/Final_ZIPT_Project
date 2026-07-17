package com.zipt.domain.noise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoiseReport implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("address")
    private String address;

    @JsonProperty("region")
    private String region;

    @JsonProperty("complaintCount")
    private Integer complaintCount;

    @JsonProperty("regionalComplaintCount")
    private Integer regionalComplaintCount;

    @JsonProperty("noiseLevel")
    private Integer noiseLevel;

    @JsonProperty("riskLevel")
    private String riskLevel;

    @JsonProperty("stats")
    private List<NoiseTypeItem> stats;

    @JsonProperty("extractionConfidence")
    private Double extractionConfidence;

    @JsonProperty("analyzed")
    private Boolean analyzed;

    @JsonProperty("analyzedAt")
    private Long analyzedAt;
}