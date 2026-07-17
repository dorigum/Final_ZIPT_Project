package com.zipt.config;

import com.zipt.domain.auth.oauth.CustomOAuth2UserService;
import com.zipt.domain.auth.oauth.OAuth2SuccessHandler;
import com.zipt.domain.auth.service.TokenBlacklistService;
import com.zipt.global.jwt.JwtAuthenticationFilter;
import com.zipt.global.jwt.JwtTokenProvider;
import com.zipt.global.security.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http, TokenBlacklistService tokenBlacklistService) throws Exception {
            http
                    .cors(Customizer.withDefaults())
                    .csrf(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers("/public/**", "/api/auth/**", "/api/terms/**").permitAll() // 회원이 아닌 일반 사용자도 용어 페이지를 볼 수 있도록 설정
                            .requestMatchers("/actuator/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/guides/**").permitAll()
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                            //.requestMatchers("/api/analysis/**").permitAll() jwt 인증 완성해서 주석처리 | 260619
                            .requestMatchers("/api/swagger-ui/**", "/api/v3/api-docs/**",  "/api/swagger-ui.html").permitAll()
                            .requestMatchers("/api/oauth2/**", "/api/login/oauth2/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .oauth2Login(oauth -> oauth
                            // 소셜 로그인 시작 URL: /api/oauth2/authorization/{provider}
                            .authorizationEndpoint(endpoint ->
                                    endpoint.baseUri("/api/oauth2/authorization"))
                            // 소셜 콜백(redirect) URL: /api/login/oauth2/code/{provider}
                            .redirectionEndpoint(endpoint ->
                                    endpoint.baseUri("/api/login/oauth2/code/*"))
                            .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                            .successHandler(oAuth2SuccessHandler)
                    )
            // 인증 실패 시 로그인 페이지 리다이렉트 대신 401 반환(JWT 인증 실패 시)
//            .exceptionHandling(ex -> ex
//                    .authenticationEntryPoint(
//                            (req, res, authException) ->
//                                    res.sendError(ErrorCode.UNAUTHORIZED.getStatus(), ErrorCode.UNAUTHORIZED.getMessage())
//                    )
//            )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            // UsernamePasswordAuthenticationFilter 앞에 JWT 필터 삽입
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider, tokenBlacklistService),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    //CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite 개발 서버
                "http://localhost:3000",   //
                "https://d27gh1f0gqgr0g.cloudfront.net", //cloudfront 추가 -260701 오혜진
                "http://d27gh1f0gqgr0g.cloudfront.net", // cloudfront 추가 - 20260703 이동혁
                "https://zipt.store", //zipt.store 추가 - 20260706 오혜진
                "https://www.zipt.store" //zipt.store 추가 - 20260706 오혜진
        ));
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }


}
