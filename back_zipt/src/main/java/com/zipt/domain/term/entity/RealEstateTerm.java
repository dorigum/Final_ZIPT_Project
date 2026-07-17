package com.zipt.domain.term.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "real_estate_terms")
public class RealEstateTerm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "term_id", nullable = false, unique = true, length = 100)
    private String termId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    // 별칭은 별도 컬렉션 테이블에 저장해 대표 용어뿐 아니라 줄임말/유사어로도 검색할 수 있게 둔다.
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "term_aliases", joinColumns = @JoinColumn(name = "real_estate_term_id"))
    @Column(name = "alias", nullable = false, length = 100)
    private Set<String> aliases = new LinkedHashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TermCategory category;

    @Column(name = "easy_definition", columnDefinition = "text")
    private String easyDefinition;

    @Column(name = "action_tip", columnDefinition = "text")
    private String actionTip;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 20)
    private RiskLevel riskLevel = RiskLevel.NEUTRAL;

    @Column(name = "official_definition", columnDefinition = "text")
    private String officialDefinition;

    @Column(name = "source_name", length = 200)
    private String sourceName;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(length = 200)
    private String license;

    @Column(name = "fetched_at")
    private LocalDate fetchedAt;

    @Column(name = "is_core", nullable = false)
    private boolean core;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected RealEstateTerm() {
    }

    // 시드 데이터와 향후 관리 화면에서 같은 생성 규칙을 쓰도록 기본값 보정을 한곳에 모은다.
    public static RealEstateTerm create(
            String termId,
            String name,
            Set<String> aliases,
            TermCategory category,
            String easyDefinition,
            String actionTip,
            RiskLevel riskLevel,
            String officialDefinition,
            String sourceName,
            String sourceUrl,
            String license,
            LocalDate fetchedAt,
            boolean core
    ) {
        RealEstateTerm term = new RealEstateTerm();
        term.termId = termId;
        term.name = name;
        term.aliases = aliases == null ? new LinkedHashSet<>() : new LinkedHashSet<>(aliases);
        term.category = category;
        term.easyDefinition = easyDefinition;
        term.actionTip = actionTip;
        term.riskLevel = riskLevel == null ? RiskLevel.NEUTRAL : riskLevel;
        term.officialDefinition = officialDefinition;
        term.sourceName = sourceName;
        term.sourceUrl = sourceUrl;
        term.license = license;
        term.fetchedAt = fetchedAt;
        term.core = core;
        return term;
    }

    // JPA 라이프사이클 콜백으로 생성/수정 시간을 엔티티 내부에서 일관되게 관리한다.
    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTermId() {
        return termId;
    }

    public String getName() {
        return name;
    }

    public Set<String> getAliases() {
        return aliases;
    }

    public TermCategory getCategory() {
        return category;
    }

    public String getEasyDefinition() {
        return easyDefinition;
    }

    public String getActionTip() {
        return actionTip;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public String getOfficialDefinition() {
        return officialDefinition;
    }

    public String getSourceName() {
        return sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public String getLicense() {
        return license;
    }

    public LocalDate getFetchedAt() {
        return fetchedAt;
    }

    public boolean isCore() {
        return core;
    }

    public void update(
            String name,
            Set<String> aliases,
            TermCategory category,
            String easyDefinition,
            String actionTip,
            RiskLevel riskLevel,
            String officialDefinition,
            String sourceName,
            String sourceUrl,
            String license,
            LocalDate fetchedAt,
            boolean core
    ) {
        this.name = name;
        this.aliases = aliases == null ? new LinkedHashSet<>() : new LinkedHashSet<>(aliases);
        this.category = category;
        this.easyDefinition = easyDefinition;
        this.actionTip = actionTip;
        this.riskLevel = riskLevel == null ? RiskLevel.NEUTRAL : riskLevel;
        this.officialDefinition = officialDefinition;
        this.sourceName = sourceName;
        this.sourceUrl = sourceUrl;
        this.license = license;
        this.fetchedAt = fetchedAt;
        this.core = core;
    }
}