package com.zipt.domain.contract.dto;

import jakarta.validation.constraints.NotNull;

public record ContractChecklistItemCheckedUpdateRequest(
        @NotNull Boolean checked
) {
}
