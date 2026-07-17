package com.zipt.domain.contract.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_checklist_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContractChecklistItem {

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

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String actionRequired;

    @Column(columnDefinition = "TEXT")
    private String referenceText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChecklistRiskLevel riskLevel;

    @Column(nullable = false)
    private Boolean required;

    @Column(nullable = false)
    private Boolean checked;

    public void updateChecked(Boolean checked) {
        this.checked = checked;
    }
}
