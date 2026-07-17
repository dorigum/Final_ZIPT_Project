package com.zipt.domain.member.controller;

import com.zipt.domain.member.dto.GetMemberResponse;
import com.zipt.domain.member.service.MemberService;
import com.zipt.global.response.ApiResponse;
import com.zipt.global.security.CustomMemberDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<GetMemberResponse>> getMember(
            Authentication authentication
    ) {
        CustomMemberDetails details = (CustomMemberDetails) authentication.getPrincipal();
        GetMemberResponse response = memberService.getCurrentMember(details.getMember().getId());

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
