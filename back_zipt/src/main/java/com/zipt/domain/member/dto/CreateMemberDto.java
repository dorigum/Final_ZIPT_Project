package com.zipt.domain.member.dto;


import com.zipt.domain.member.entity.Member;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@ToString(exclude = "password")
public class CreateMemberDto {
    private String email;
    private String name;
    private String password;

    public Member toMember(CreateMemberDto dto) {
        return Member.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .password(dto.getPassword())
                .role("ROLE_USER")
                .isDeleted("N")
                .build();
    }
}
