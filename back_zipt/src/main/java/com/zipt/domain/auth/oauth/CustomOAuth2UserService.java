package com.zipt.domain.auth.oauth;

import com.zipt.domain.member.entity.Member;
import com.zipt.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final MemberService memberService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // 1. 부모(DefaultOAuth2UserService)가 provider에서 사용자 정보 받아옴
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 2. 어느 소셜인지 식별 (yml의 registration 키 이름)
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // 3. 공통 형태 변환
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory
                .getOAuth2UserInfo(provider, oAuth2User.getAttributes());

        // 4. DB에서 찾기
        Member member = memberService.findOrCreateMember(userInfo);

	    Map<String, Object> attributes = new HashMap<>(oAuth2User.getAttributes());
        attributes.put("member", member);

        // 5. provider 응답에서 사용자 식별 키 가져옴
        String nameAttributeKey = userRequest
                .getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        // 6. SecurityContext에 저장될 인증 주체 반환
        // 권한은 DB의 role을 사용 -> 이후 JWT/인가에 활용
        return new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority(member.getRole())),
//    기존 Member email 필드 제거 - 이정건
//                oAuth2User.getAttributes(),
                attributes,
                nameAttributeKey
        );
    }
}
