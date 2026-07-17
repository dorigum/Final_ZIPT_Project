package com.zipt.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;   // Spring Boot 기본 제공 빈

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;   // 401, "로그인이 필요합니다"

        response.setStatus(errorCode.getStatus());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");          // 한글 깨짐 방지

        String body = objectMapper.writeValueAsString(
                ApiResponse.fail(errorCode.getMessage())
        );
        response.getWriter().write(body);
    }
}
