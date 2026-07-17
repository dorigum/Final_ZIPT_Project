package com.zipt.domain.member.dto;

import com.zipt.domain.member.entity.Member;

public record GetMemberResponse (
    Long id,
    String email,
    String name,
    String role,
    String provider,
    String isDeleted,
    String createdAt,
    String updatedAt
) {
    public static GetMemberResponse from(Member member) {
        return new GetMemberResponse(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getRole(),
                member.getProvider(),
                member.getIsDeleted(),
                member.getCreatedAt().toString(),
                member.getUpdatedAt().toString()
        );
    }
}
