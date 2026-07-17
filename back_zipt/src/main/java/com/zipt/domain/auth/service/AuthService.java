package com.zipt.domain.auth.service;

import com.zipt.domain.auth.dto.TokenResponse;
import com.zipt.domain.auth.entity.Auth;
import com.zipt.domain.auth.repository.AuthRepository;
import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.repository.MemberRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.jwt.JwtTokenProvider;
import com.zipt.global.security.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ObjectProvider<AuthenticationManager> authenticationManagerProvider;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRepository authRepository;
    private final MemberRepository memberRepository;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * 회원 정보를 인증 후 꺼내는 메소드
     * @param email
     * @param password
     * @return CustomMemberDetails
     */
    private CustomMemberDetails getMemberDetails(String email, String password) {

        // 1. email + password로 인증 시도
        // 내부적으로 CustomMemberDetailsService.loadUserByUsername() 호출됨
        AuthenticationManager authenticationManager = authenticationManagerProvider.getObject();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        if(!authentication.isAuthenticated()) {
            throw new ZiptException(ErrorCode.MEMBER_NOT_FOUND);
        }

        // 2. 인증 성공 → CustomMemberDetails에서 정보 꺼냄
        CustomMemberDetails memberDetails =
                (CustomMemberDetails) authentication.getPrincipal();

        return memberDetails;
    }

    /**
     * access + refresh 발급 후 refresh를 DB에 upsert
     * 일반 로그인 / OAuth 로그인 양쪽이 공유하는 단일 진입점.
     */
    // 기존 Member email 필드 제거 - 이정건
    /*@Transactional
    public TokenResponse issueTokens(String email, String role) {
        String accessToken = jwtTokenProvider.generateAccessToken(email, role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(email);

        saveOrUpdateRefreshToken(email, refreshToken);

        return new TokenResponse(accessToken, refreshToken);
    }*/

    @Transactional
    public TokenResponse issueTokens(Member member, String role) {
        String accessToken = jwtTokenProvider.generateAccessToken(member, role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(member);

        saveOrUpdateRefreshToken(member, refreshToken);

        return new TokenResponse(accessToken, refreshToken);
    }

    /**
     * 로그인: access + refresh 토큰을 함께 발급하고 refresh는 DB에 저장
     */
    @Transactional
    public TokenResponse login(String email, String password) {
        CustomMemberDetails memberDetails = this.getMemberDetails(email, password);

        // 기존 Member email 필드 제거 - 이정건
//        String memberEmail = memberDetails.getUsername();
        Member member = memberDetails.getMember();
        String role = memberDetails.getAuthorities().iterator().next().getAuthority();

//        return issueTokens(memberEmail, role);
        return issueTokens(member, role);
    }

    /**
     * refresh 토큰으로 access 토큰 재발급
     */
    @Transactional(readOnly = true)
    public TokenResponse reissue(String refreshToken) {
        // 1. 토큰 자체 유효성(서명/만료) 검증
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new ZiptException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 2. DB에 저장된 토큰과 비교
        // 기존 Member email 필드 제거 - 이정건
        /*String email = jwtTokenProvider.getEmail(refreshToken);
        Auth auth = authRepository.findByEmail(email)
                .orElseThrow(() -> new ZiptException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (!refreshToken.equals(auth.getRefreshToken())) {
            throw new ZiptException(ErrorCode.REFRESH_TOKEN_MISMATCH);
        }

        // 3. role 조회 후 새 access 토큰 발급 (refresh는 그대로 유지)
        Member member = memberRepository.findByEmail(email);
        if (member == null) {
            throw new ZiptException(ErrorCode.MEMBER_NOT_FOUND);
        }

        String accessToken = jwtTokenProvider.generateAccessToken(email, member.getRole());

        return new TokenResponse(accessToken, refreshToken);*/

        Long memberId = jwtTokenProvider.getId(refreshToken);
        Auth auth = authRepository.findByMemberId(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));

        if (!refreshToken.equals(auth.getRefreshToken())) {
            throw new ZiptException(ErrorCode.REFRESH_TOKEN_MISMATCH);
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));

        // refresh 토큰은 회전하지 않고 그대로 유지, access 토큰만 새로 발급
        String accessToken = jwtTokenProvider.generateAccessToken(member, member.getRole());

        return new TokenResponse(accessToken, refreshToken);
    }

//    기존 Member email 필드 제거 - 이정건
    /*private void saveOrUpdateRefreshToken(String email, String refreshToken) {
        authRepository.findByEmail(email)
                .ifPresentOrElse(
                        auth -> auth.updateRefreshToken(refreshToken, jwtTokenProvider.getRefreshTokenExpiry()),
                        () -> authRepository.save(Auth.builder()
                                .email(email)
                                .refreshToken(refreshToken)
                                .expiredAt(jwtTokenProvider.getRefreshTokenExpiry())
                                .build())
                );
    }*/

    private void saveOrUpdateRefreshToken(Member member, String refreshToken) {
        authRepository.findByMemberId(member.getId())
                .ifPresentOrElse(
                        auth -> auth.updateRefreshToken(refreshToken, jwtTokenProvider.getRefreshTokenExpiry()),
                        () -> authRepository.save(Auth.builder()
                                .member(member)
                                .refreshToken(refreshToken)
                                .expiredAt(jwtTokenProvider.getRefreshTokenExpiry())
                                .build())
                );
    }

    @Transactional
    public void logout(String accessToken, String refreshToken) {
        // 1. AccessToken을 블랙리스트에 등록
        if(accessToken != null && jwtTokenProvider.validateToken(accessToken)) {
            long remaining = jwtTokenProvider.getRemainingTime(accessToken);
            tokenBlacklistService.addTokenToBlacklist(accessToken, remaining);
        }

        // 2. RefreshToken DB(Auth) 삭제
        if(refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return;
        }
        Long memberId = jwtTokenProvider.getId(refreshToken);
        authRepository.findByMemberId(memberId)
                .ifPresent(authRepository::delete);
    }
}
