package com.zipt.domain.member.service;

import com.zipt.domain.auth.oauth.OAuth2UserInfo;
import com.zipt.domain.member.dto.CreateMemberDto;
import com.zipt.domain.member.dto.GetMemberResponse;
import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.repository.MemberRepository;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
    private final PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public void createMember(CreateMemberDto dto) {
        Member existedMember = memberRepository.findByEmail(dto.getEmail());
        if(existedMember != null) {
            // 이메일 중복됐을 시 예외 처리
            throw new ZiptException(ErrorCode.EMAIL_DUPLICATED);
        }

        dto.setPassword(passwordEncoder.encode(dto.getPassword()));
        Member newMember = dto.toMember(dto);
        memberRepository.save(newMember);
    }

    @Override
    public GetMemberResponse getCurrentMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ZiptException(ErrorCode.MEMBER_NOT_FOUND));
        return GetMemberResponse.from(member);
    }

    @Override
    public Member findOrCreateMember(OAuth2UserInfo userInfo) {

        // 1. provider + providerId로 기존 회원 조회
        // 2. 있으면 그 회원 반환(로그인), 없으면 registerOAuthMember() 회원가입
        return memberRepository.findByProviderAndProviderId(
                userInfo.getProvider(),
                userInfo.getProviderUserId()
        ).orElseGet(() -> registerOAuthMember(userInfo));
    }

    //OAuth 신규 회원가입
    private Member registerOAuthMember(OAuth2UserInfo userInfo) {
        Member member = Member.builder()
                .email(userInfo.getEmail())
                .name(userInfo.getName())
                .provider(userInfo.getProvider())
                .providerId(userInfo.getProviderUserId())
                .role("ROLE_USER")
                .password(null)
                .isDeleted("N")
                .build();
        return memberRepository.save(member);
    }

}
