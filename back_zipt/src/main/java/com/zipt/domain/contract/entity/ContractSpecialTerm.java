package com.zipt.domain.contract.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_special_terms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContractSpecialTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    protected void setContract(Contract contract) {
        this.contract = contract;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    @ToString.Exclude
    private Contract contract;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    private SpecialTermType termType;

    private Boolean tenantProtective;

    private Boolean needsReview;

    private Integer displayOrder;
}