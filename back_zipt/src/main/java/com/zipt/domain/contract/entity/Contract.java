package com.zipt.domain.contract.entity;

import com.zipt.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contracts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /**
     * 계약 유형: 전세 / 보증금 있는 월세 / 월세
     */
    @Enumerated(EnumType.STRING)
    private ContractType contractType;

    /**
     * 계약 종류: 신규 / 합의 재계약 / 계약갱신요구권 갱신
     */
    @Enumerated(EnumType.STRING)
    private ContractKind contractKind;

    /**
     * 임차주택 정보
     */
    @Column(columnDefinition = "TEXT")
    private String propertyAddress;

    private String buildingStructure;

    private String buildingPurpose;

    private String leasedPart;

    /**
     * 금액 및 지급 정보
     */
    private Long depositAmount;

    private Long contractAmount;

    private Long intermediateAmount;

    private LocalDate intermediatePaymentDate;

    private Long balanceAmount;

    private LocalDate balancePaymentDate;

    private Long monthlyRent;

    private Integer monthlyRentPaymentDay;

    /**
     * 관리비
     */
    @Enumerated(EnumType.STRING)
    private MaintenanceFeeType maintenanceFeeType;

    private Long maintenanceFeeAmount;

    @Column(columnDefinition = "TEXT")
    private String maintenanceFeeCalculationMethod;

    /**
     * 임대차 기간
     */
    private LocalDate deliveryDate;

    private LocalDate endDate;

    /**
     * 미납 세금 / 선순위 확정일자
     */
    @Enumerated(EnumType.STRING)
    private DisclosureStatus unpaidTaxStatus;

    @Column(columnDefinition = "TEXT")
    private String unpaidTaxDescription;

    @Enumerated(EnumType.STRING)
    private PriorityFixedDateStatus priorityFixedDateStatus;

    @Column(columnDefinition = "TEXT")
    private String priorityFixedDateDescription;

    /**
     * 입주 전 수리
     */
    @Enumerated(EnumType.STRING)
    private RepairNeededStatus repairNeededStatus;

    @Column(columnDefinition = "TEXT")
    private String repairContent;

    private LocalDate repairCompletionDate;

    @Column(columnDefinition = "TEXT")
    private String repairDefaultHandling;

    /**
     * LLM 추출 품질
     */
    private Double extractionConfidence;

    @Column(columnDefinition = "TEXT")
    private String extractionWarnings;

    @Column(columnDefinition = "TEXT")
    private String missingFields;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ContractProcessingStatus processingStatus = ContractProcessingStatus.PROCESSING;

    @Column(columnDefinition = "TEXT")
    private String processingErrorMessage;

    /**
     * 사용자가 이 계약을 실제로 진행 중이라고 표시했는지 여부.
     * true일 때만 마이페이지에서 인도일/계약종료일 D-day 알림을 노출한다.
     */
    @Builder.Default
    private Boolean trackingEnabled = false;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ContractSpecialTerm> specialTerms = new ArrayList<>();

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ContractChecklistItem> checklistItems = new ArrayList<>();

    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContractDocument document;

    @OneToOne(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private ContractCheckbox checkbox;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void applyStructuredExtraction(
            ContractType contractType,
            ContractKind contractKind,
            String propertyAddress,
            String buildingStructure,
            String buildingPurpose,
            String leasedPart,
            Long depositAmount,
            Long contractAmount,
            Long intermediateAmount,
            LocalDate intermediatePaymentDate,
            Long balanceAmount,
            LocalDate balancePaymentDate,
            Long monthlyRent,
            Integer monthlyRentPaymentDay,
            MaintenanceFeeType maintenanceFeeType,
            Long maintenanceFeeAmount,
            String maintenanceFeeCalculationMethod,
            LocalDate deliveryDate,
            LocalDate endDate,
            DisclosureStatus unpaidTaxStatus,
            String unpaidTaxDescription,
            PriorityFixedDateStatus priorityFixedDateStatus,
            String priorityFixedDateDescription,
            RepairNeededStatus repairNeededStatus,
            String repairContent,
            LocalDate repairCompletionDate,
            String repairDefaultHandling,
            Double extractionConfidence,
            String extractionWarnings,
            String missingFields
    ) {
        this.contractType = contractType;
        this.contractKind = contractKind;

        this.propertyAddress = propertyAddress;
        this.buildingStructure = buildingStructure;
        this.buildingPurpose = buildingPurpose;
        this.leasedPart = leasedPart;

        this.depositAmount = depositAmount;
        this.contractAmount = contractAmount;
        this.intermediateAmount = intermediateAmount;
        this.intermediatePaymentDate = intermediatePaymentDate;
        this.balanceAmount = balanceAmount;
        this.balancePaymentDate = balancePaymentDate;
        this.monthlyRent = monthlyRent;
        this.monthlyRentPaymentDay = monthlyRentPaymentDay;

        this.maintenanceFeeType = maintenanceFeeType;
        this.maintenanceFeeAmount = maintenanceFeeAmount;
        this.maintenanceFeeCalculationMethod = maintenanceFeeCalculationMethod;

        this.deliveryDate = deliveryDate;
        this.endDate = endDate;

        this.unpaidTaxStatus = unpaidTaxStatus;
        this.unpaidTaxDescription = unpaidTaxDescription;
        this.priorityFixedDateStatus = priorityFixedDateStatus;
        this.priorityFixedDateDescription = priorityFixedDateDescription;

        this.repairNeededStatus = repairNeededStatus;
        this.repairContent = repairContent;
        this.repairCompletionDate = repairCompletionDate;
        this.repairDefaultHandling = repairDefaultHandling;

        this.extractionConfidence = extractionConfidence;
        this.extractionWarnings = extractionWarnings;
        this.missingFields = missingFields;
    }

    public void addSpecialTerm(ContractSpecialTerm specialTerm) {
        this.specialTerms.add(specialTerm);
        specialTerm.setContract(this);
    }

    public void clearSpecialTerms() {
        this.specialTerms.clear();
    }

    public void addChecklistItem(ContractChecklistItem checklistItem) {
        this.checklistItems.add(checklistItem);
        checklistItem.setContract(this);
    }

    public void replaceChecklistItems(List<ContractChecklistItem> checklistItems) {
        this.checklistItems.clear();

        if (checklistItems == null) {
            return;
        }

        checklistItems.forEach(this::addChecklistItem);
    }

    public void setDocument(ContractDocument document) {
        this.document = document;
        document.setContract(this);
    }

    public void setCheckbox(ContractCheckbox checkbox) {
        this.checkbox = checkbox;
        checkbox.setContract(this);
    }

    public void updateProcessingStatus(ContractProcessingStatus processingStatus, String errorMessage) {
        this.processingStatus = processingStatus;
        this.processingErrorMessage = errorMessage;
    }

    public void updateTrackingEnabled(boolean trackingEnabled) {
        this.trackingEnabled = trackingEnabled;
    }
}
