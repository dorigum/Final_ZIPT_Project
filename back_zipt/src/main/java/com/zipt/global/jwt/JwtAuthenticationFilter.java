package com.zipt.global.jwt;

import com.zipt.domain.auth.service.TokenBlacklistService;
import com.zipt.domain.member.entity.Member;
import com.zipt.global.security.CustomMemberDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // 1. Authorization 헤더에서 토큰 추출
        String token = resolveToken(request);

        // 2. 토큰 유효성 검증
        if (token != null
                && jwtTokenProvider.validateToken(token)
                && !tokenBlacklistService.isBlacklisted(token)
        ) {

            // 3. 토큰에서 회원 정보 추출
            // member id 필드 추가 - 이정건
            Long id = jwtTokenProvider.getId(token);
            String email = jwtTokenProvider.getEmail(token);
            String role = jwtTokenProvider.getRole(token);

            Member member = Member.builder().id(id).email(email).role(role).build();
            CustomMemberDetails customMemberDetails = new CustomMemberDetails(member);

            // 4. Authentication 객체 생성 → SecurityContextHolder에 저장
            //    (UserDetailsService 다시 호출 안 함 - 토큰 자체를 신뢰)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
//                            email,
                            customMemberDetails,
                            null, // JWT 방식에서 password 불필요
                            List.of(new SimpleGrantedAuthority(role))  // 권한 세팅
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 5. 다음 필터로 넘김 (토큰 없거나 유효하지 않으면 그냥 통과 → 이후 Security가 막음)
        filterChain.doFilter(request, response);
    }

    // "Bearer {token}" 형식에서 토큰만 추출
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }


}
