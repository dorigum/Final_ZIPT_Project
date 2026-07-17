package com.zipt.domain.guide.repository;

import com.zipt.domain.guide.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuideRepository extends JpaRepository<Guide, Long> {

    List<Guide> findByPublishedTrueOrderByDisplayOrderAsc();

    Optional<Guide> findByGuideId(String guideId);

    Optional<Guide> findFirstByGuideIdIsNullAndDisplayOrder(int displayOrder);
}
