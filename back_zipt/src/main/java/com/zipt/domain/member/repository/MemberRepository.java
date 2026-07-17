package com.zipt.domain.member.repository;

import com.zipt.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByEmail(String email);

    // provider + providerId로 회원 조회(OAuth 회원 고유 식별)
    Optional<Member> findByProviderAndProviderId(String provider, String providerId);

}
