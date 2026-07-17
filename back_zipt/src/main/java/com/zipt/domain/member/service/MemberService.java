package com.zipt.domain.member.service;

import com.zipt.domain.auth.oauth.OAuth2UserInfo;
import com.zipt.domain.member.dto.CreateMemberDto;
import com.zipt.domain.member.dto.GetMemberResponse;
import com.zipt.domain.member.entity.Member;

import java.security.Principal;
import java.util.Optional;

public interface MemberService {
    public void createMember(CreateMemberDto dto);

    public GetMemberResponse getCurrentMember(Long memberId);

    //OAuth 사용자 정보로 회원을 찾고, 없으면 새로 가입시켜 반환
    public Member findOrCreateMember(OAuth2UserInfo userInfo);


}
