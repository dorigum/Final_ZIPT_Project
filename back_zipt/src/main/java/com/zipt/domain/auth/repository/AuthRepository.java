package com.zipt.domain.auth.repository;

import com.zipt.domain.auth.entity.Auth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<Auth, Long> {
//    기존 Member email 필드 제거 - 이정건
//    Optional<Auth> findByEmail(String email);
    Optional<Auth> findByMemberId(Long memberId);
}
