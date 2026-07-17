package com.zipt.domain.contract.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContractDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    protected void setContract(Contract contract) {
        this.contract = contract;
    }

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false, unique = true)
    @ToString.Exclude
    private Contract contract;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    public void updateExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }

    public void updateFileUrl(String url) {
        this.fileUrl = url;
    }
}
