package com.zipt.domain.contract.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import java.util.List;

@JsonPropertyOrder({
        "documentType",
        "confidence",
        "evidence",
        "missingFields",
        "reason"
})
public record ContractDocumentClassificationResponse(

        @JsonPropertyDescription("""
                Document type classification.
                LEASE_CONTRACT: Korean real estate lease contract
                NOT_LEASE_CONTRACT: clearly not a lease contract
                UNCERTAIN: cannot determine from OCR text
                MULTIPLE_LEASE_CONTRACTS: multiple different lease contracts are mixed
                MIXED_DOCUMENTS: lease contract and non-lease documents are mixed
                """)
        String documentType,

        @JsonPropertyDescription("Classification confidence from 0.0 to 1.0")
        Double confidence,

        @JsonPropertyDescription("Short OCR text evidence used for classification")
        List<String> evidence,

        @JsonPropertyDescription("Missing core lease contract fields")
        List<String> missingFields,

        @JsonPropertyDescription("Short reason for the classification")
        String reason
) {
    public boolean isLeaseContract() {
        return "LEASE_CONTRACT".equalsIgnoreCase(documentType);
    }
}
