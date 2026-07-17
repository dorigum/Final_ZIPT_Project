package com.zipt.domain.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/public/hello")
    public String publicHello() {
        return "누구나 접근 가능한 페이지";
    }

    @GetMapping("/home")
    public String home(Authentication authentication) {
        System.out.println(authentication);
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst().map(GrantedAuthority::getAuthority).orElse("없음");

        String result = """
        === 로그인 사용자 ===
        이메일: %s
        권한: %s
        """.formatted(email, role);


        return result;
    }
}
