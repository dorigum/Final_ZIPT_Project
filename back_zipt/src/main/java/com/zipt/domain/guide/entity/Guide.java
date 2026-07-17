package com.zipt.domain.guide.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guides")
public class Guide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // S3 JSON 원본과 DB 행을 안정적으로 매칭하기 위한 고정 식별자입니다.
    // 제목이나 노출 순서가 바뀌어도 guideId는 유지해야 기존 데이터를 update할 수 있습니다.
    @Column(name = "guide_id", unique = true, length = 100)
    private String guideId;

    @Column(nullable = false, length = 200)
    private String title;

    // contract(계약·절차) | rights(권리관계·등기부) | process(등기·신고·세금) | case(부동산 판례)
    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, columnDefinition = "text")
    private String summary;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "guide_tags", joinColumns = @JoinColumn(name = "guide_id"))
    @Column(name = "tag", nullable = false, length = 50)
    @OrderColumn(name = "tag_order")
    private List<String> tags = new ArrayList<>();

    @Column(length = 200)
    private String source;

    @Column(name = "source_note", length = 500)
    private String sourceNote;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "is_published", nullable = false)
    private boolean published;

    protected Guide() {
    }

    public static Guide create(
            String guideId,
            String title,
            String category,
            String summary,
            String content,
            List<String> tags,
            String source,
            String sourceNote,
            int displayOrder,
            boolean published
    ) {
        Guide guide = new Guide();
        guide.guideId = guideId;
        guide.title = title;
        guide.category = category;
        guide.summary = summary;
        guide.content = content;
        guide.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags);
        guide.source = source;
        guide.sourceNote = sourceNote;
        guide.displayOrder = displayOrder;
        guide.published = published;
        return guide;
    }

    public void update(
            String title,
            String category,
            String summary,
            String content,
            List<String> tags,
            String source,
            String sourceNote,
            int displayOrder,
            boolean published
    ) {
        this.title = title;
        this.category = category;
        this.summary = summary;
        this.content = content;
        this.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags);
        this.source = source;
        this.sourceNote = sourceNote;
        this.displayOrder = displayOrder;
        this.published = published;
    }

    public Long getId() {
        return id;
    }

    public String getGuideId() {
        return guideId;
    }

    public void assignGuideId(String guideId) {
        this.guideId = guideId;
    }

    public String getTitle() {
        return title;
    }

    public String getCategory() {
        return category;
    }

    public String getSummary() {
        return summary;
    }

    public String getContent() {
        return content;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getSource() {
        return source;
    }

    public String getSourceNote() {
        return sourceNote;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public boolean isPublished() {
        return published;
    }
}
