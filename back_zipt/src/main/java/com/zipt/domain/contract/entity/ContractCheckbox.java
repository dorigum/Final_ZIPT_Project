package com.zipt.domain.contract.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_checkboxes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContractCheckbox {

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

    @Column(columnDefinition = "TEXT")
    private String rawResultJson;

    @Enumerated(EnumType.STRING)
    private DisclosureStatus unpaidTaxStatus;

    @Enumerated(EnumType.STRING)
    private PriorityFixedDateStatus priorityFixedDateStatus;

    @Enumerated(EnumType.STRING)
    private RepairNeededStatus repairNeededStatus;

    @Column(columnDefinition = "TEXT")
    private String repairContent;

    private LocalDate repairCompletionDate;

    @Column(columnDefinition = "TEXT")
    private String repairDefaultHandling;

    @Column(columnDefinition = "TEXT")
    private String specialCheckboxes;

    @Column(columnDefinition = "TEXT")
    private String warnings;

    private Double confidence;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void updateResult(
            String rawResultJson,
            DisclosureStatus unpaidTaxStatus,
            PriorityFixedDateStatus priorityFixedDateStatus,
            RepairNeededStatus repairNeededStatus,
            String repairContent,
            LocalDate repairCompletionDate,
            String repairDefaultHandling,
            String specialCheckboxes,
            String warnings,
            Double confidence
    ) {
        this.rawResultJson = rawResultJson;
        this.unpaidTaxStatus = unpaidTaxStatus;
        this.priorityFixedDateStatus = priorityFixedDateStatus;
        this.repairNeededStatus = repairNeededStatus;
        this.repairContent = repairContent;
        this.repairCompletionDate = repairCompletionDate;
        this.repairDefaultHandling = repairDefaultHandling;
        this.specialCheckboxes = specialCheckboxes;
        this.warnings = warnings;
        this.confidence = confidence;
    }
}
