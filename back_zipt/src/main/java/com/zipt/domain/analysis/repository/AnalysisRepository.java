package com.zipt.domain.analysis.repository;

import com.zipt.domain.analysis.entity.AnalysisResult;
import com.zipt.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisRepository extends JpaRepository<AnalysisResult, Long> {

//    // 회원별 이력 전체 조회 (최신순)
//    List<AnalysisResult> findAllByMemberOrderByCreatedAtDesc(Member member);
//    // 특정 분석 결과 단건 조회 (본인 것인지 확인용)
//    Optional<AnalysisResult> findByIdAndMember(Long id, Member member);
    // Member 객체 발급 변경으로 수정 -260624
    List<AnalysisResult> findAllByMemberIdOrderByCreatedAtDesc(Long memberId);
    Optional<AnalysisResult> findByIdAndMemberId(Long id, Long memberId);

}
