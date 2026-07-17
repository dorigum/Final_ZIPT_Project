package com.zipt.domain.contract.dto;

import jakarta.validation.constraints.NotNull;

public record ContractTrackingUpdateRequest(
        @NotNull Boolean trackingEnabled
) {
}
