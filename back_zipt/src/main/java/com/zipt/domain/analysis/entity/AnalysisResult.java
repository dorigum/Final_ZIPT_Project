package com.zipt.domain.analysis.entity;



import com.zipt.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Builder
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    // ── 매물 정보 ──────────────────────────────
    @Column(nullable = false, length = 300)
    private String address;

    @Column(name = "owner_name", length = 50)
    private String ownerName;


    @Column(name = "property_type", length = 20)
    private String propertyType;            // 아파트, 빌라, 오피스텔

    @Column(name = "building_year")
    private Integer buildingYear;

    // ── 금액 (원 단위) ─────────────────────────
    @Column(nullable = false)
    private Long deposit;                   // 전세보증금

    @Column(name = "market_price")
    private Long marketPrice;               // 추정 시세

    @Column(name = "official_price")
    private Long officialPrice;             // 공시가격

    @Column(name = "total_priority_amount")
    private Long totalPriorityAmount;       // 선순위 채권 합계

    // ── LTV 결과 ───────────────────────────────
    @Column(name = "ltv_ratio", columnDefinition = "DECIMAL(5,1)")
    private Double ltvRatio;              // 87.1

    @Column(name = "risk_level", length = 20)
    private String riskLevel;              // SAFE, WARNING, DANGER

    @Column(name = "risk_score")
    private Integer riskScore;             // 5~95점

    @Column(name = "score_grade", length = 20)
    private String scoreGrade;             // PREMIUM, CAUTION, DANGER

    // ── 보증보험 결과 ──────────────────────────
    @Column(name = "insurance_eligible")
    private Boolean insuranceEligible;

    @Column(name = "hug_debt_ratio", columnDefinition = "DECIMAL(5,1)")
    private Double hugDebtRatio;       // HUG 부채비율


    @Column(name = "priority_ratio", columnDefinition = "DECIMAL(5,1)")
    private Double priorityRatio;      // 선순위 채권 비율

    @Column(name = "total_ltv", columnDefinition = "DECIMAL(5,1)")
    private Double totalLtv;
    // ── 임대사업자 ─────────────────────────────
    @Column(name = "is_rental_business", nullable = false)
    private boolean rentalBusiness = false;

    @Column(name = "rental_type", length = 50)
    private String rentalType;             // 장기일반민간임대

    // ── 채권 목록 (JSON) ───────────────────────
    // [{"rank":1,"type":"근저당권","creditor":"국민은행","amount":144000000}]
    @Column(name = "priority_bonds", columnDefinition = "JSON")
    private String priorityBonds;

    // ── 파일 URL (S3) ──────────────────────────
    @Column(name = "registry_image_url", length = 500)
    private String registryImageUrl;       // 등기부등본 이미지

    @Setter
    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    //추가
    @Column(name = "registry_file_name")
    private String registryFileName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnalysisProcessingStatus processingStatus = AnalysisProcessingStatus.PROCESSING;

    @Column(name = "processing_error_message", length = 1000)
    private String processingErrorMessage;

    // ── 빌더 ──────────────────────────────────
    @Builder
    private AnalysisResult(Member member,
                           String address, String ownerName, String propertyType, Integer buildingYear,
                           Long deposit, Long marketPrice, Long officialPrice,
                           Long totalPriorityAmount,
                           Double ltvRatio,          //
                           String riskLevel,
                           Integer riskScore, String scoreGrade,
                           Boolean insuranceEligible,
                           Double hugDebtRatio,      //
                           Double priorityRatio,     //
                           Double totalLtv,          //
                           boolean rentalBusiness, String rentalType,
                           String priorityBonds,
                           String registryImageUrl, String pdfUrl) {
        this.member               = member;
        this.address              = address;
        this.ownerName            = ownerName;
        this.propertyType         = propertyType;
        this.buildingYear         = buildingYear;
        this.deposit              = deposit;
        this.marketPrice          = marketPrice;
        this.officialPrice        = officialPrice;
        this.totalPriorityAmount  = totalPriorityAmount;
        this.ltvRatio             = ltvRatio;
        this.riskLevel            = riskLevel;
        this.riskScore            = riskScore;
        this.scoreGrade           = scoreGrade;
        this.insuranceEligible    = insuranceEligible;
        this.hugDebtRatio         = hugDebtRatio;
        this.priorityRatio        = priorityRatio;
        this.totalLtv             = totalLtv;
        this.rentalBusiness       = rentalBusiness;
        this.rentalType           = rentalType;
        this.priorityBonds        = priorityBonds;
        this.registryImageUrl     = registryImageUrl;
        this.pdfUrl               = pdfUrl;
    }
    // ── 비즈니스 메서드 ───────────────────────
    public void updatePdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public void updateProcessingStatus(AnalysisProcessingStatus processingStatus, String errorMessage) {
        this.processingStatus = processingStatus;
        this.processingErrorMessage = errorMessage;
    }
}
