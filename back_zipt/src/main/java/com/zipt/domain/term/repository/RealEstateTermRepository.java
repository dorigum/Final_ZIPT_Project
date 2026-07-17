package com.zipt.domain.term.repository;

import com.zipt.domain.term.entity.RealEstateTerm;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RealEstateTermRepository extends JpaRepository<RealEstateTerm, Long> {

    Optional<RealEstateTerm> findByTermId(String termId);

    boolean existsByTermId(String termId);

    // 검색어가 없으면 필터 조건만 적용하고, 검색어가 있으면 용어명/쉬운 설명/별칭을 함께 조회한다.
    // 별칭 조인으로 같은 용어가 여러 번 나올 수 있어 distinct로 결과 중복을 막는다.
    @Query("""
            select distinct term
            from RealEstateTerm term
            left join term.aliases alias
            where (:category is null or term.category = :category)
              and (:riskLevel is null or term.riskLevel = :riskLevel)
              and (
                    :query is null
                    or lower(term.name) like lower(concat('%', :query, '%'))
                    or lower(coalesce(term.easyDefinition, '')) like lower(concat('%', :query, '%'))
                    or lower(alias) like lower(concat('%', :query, '%'))
              )
            """)
    Page<RealEstateTerm> search(
            @Param("query") String query,
            @Param("category") TermCategory category,
            @Param("riskLevel") RiskLevel riskLevel,
            Pageable pageable
    );
}