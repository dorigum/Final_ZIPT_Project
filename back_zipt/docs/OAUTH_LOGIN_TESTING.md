# OAuth 로그인 테스트 가이드

아래 문서는 현재 프로젝트(`back_zipt`)에서 제공하는 OAuth 소셜 로그인을 개발/로컬에서 테스트하는 방법을 단계별로 정리한 것입니다.

체크리스트
- [ ] 애플리케이션을 로컬에서 실행(예: `dev` 프로파일)
- [ ] OAuth 제공자(Google / Kakao / Naver)에서 OAuth 앱(클라이언트) 등록 및 Redirect URI 설정
- [ ] `application-dev.yml` 또는 환경변수에 클라이언트 ID/SECRET 설정
- [ ] 브라우저 또는 Postman으로 로그인 흐름 수행하고 access/refresh 토큰 확인

1. 개요
- OAuth 시작 URL: `/api/oauth2/authorization/{provider}`
  - 예: `/api/oauth2/authorization/google`, `/api/oauth2/authorization/kakao`, `/api/oauth2/authorization/naver`
- OAuth 콜백(Provider → 서버): `/api/login/oauth2/code/{provider}`
  - 이는 Spring Security 설정에 맞게 서버가 리다이렉트 받는 엔드포인트입니다.
- 로그인 성공 후 서버 동작(현재 코드 기준)
  - `OAuth2SuccessHandler`가 동작하여
    - refreshToken을 HttpOnly 쿠키(`refreshToken`)로 설정
    - accessToken을 쿼리파라미터로 앞단(프론트) 리다이렉트: 기본값 `http://localhost:3000/oauth/redirect?accessToken=...`

2. 사전 준비
- 로컬에서 애플리케이션 실행: 프로젝트 루트에서
```bash
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun
```
  - 또는 IDE에서 `dev` 프로파일로 실행

- `application-dev.yml`에 기본 설정이 있으나(개발용 더미 값 포함) 실제 테스트 시에는 각 제공자의 앱에서 발급받은 `client-id`/`client-secret`을 환경변수로 덮어쓰거나 `application-*.yml`에 설정하세요.
  - Spring Boot 환경변수 형태 예시 (대문자+언더스코어):
    - SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID
    - SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET
    - 동일 규칙으로 `KAKAO`, `NAVER` 등

3. OAuth 제공자(앱) 등록 시 Redirect URI
- 백엔드에서 provider에 등록해야 하는 Redirect URI는 아래와 같습니다 (프로젝트 설정 기준):
  - http://localhost:8080/api/login/oauth2/code/{registrationId}
    - 예: Google: http://localhost:8080/api/login/oauth2/code/google
  - 반드시 provider 설정에서 정확히 등록해야 합니다. (대소문자 및 경로 정확히 일치)

4. 기본 제공자 엔드포인트 (application-dev.yml 확인)
- Google (기본 제공이므로 provider 생략 가능)
- Kakao
  - authorization-uri: https://kauth.kakao.com/oauth/authorize
  - token-uri: https://kauth.kakao.com/oauth/token
  - user-info-uri: https://kapi.kakao.com/v2/user/me
- Naver
  - authorization-uri: https://nid.naver.com/oauth2.0/authorize
  - token-uri: https://nid.naver.com/oauth2.0/token
  - user-info-uri: https://openapi.naver.com/v1/nid/me

5. 테스트 방법 (권장 순서)

A) 브라우저를 이용한 수동 테스트 (가장 쉬움)
1. 서버 실행 (위 2번 참조)
2. 브라우저에서 아래 URL로 접속하여 로그인 흐름 시작
   - http://localhost:8080/api/oauth2/authorization/google
3. provider의 로그인/동의 절차를 완료하면 서버가 콜백을 받아 처리한 뒤 최종적으로 프론트 리다이렉트(기본: http://localhost:3000/oauth/redirect)로 이동합니다.
   - 이 최종 URL에 accessToken이 쿼리 파라미터로 붙습니다: ?accessToken=eyJ... 
   - 또한 응답에서 Set-Cookie 헤더로 `refreshToken`(HttpOnly)이 설정됩니다.
4. 브라우저 개발자도구 -> Network / Application 탭에서
   - Query string에서 `accessToken` 확인
   - Cookies에서 `refreshToken` 확인(브라우저에서 HttpOnly는 JS로 접근 불가하지만 DevTools에서 볼 수 있음)
5. 발급된 Access Token으로 보호된 API 호출 테스트
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:8080/api/some/protected/endpoint
```
  - (프로젝트 내 보호된 엔드포인트 경로를 사용하세요)

B) Postman을 이용한 테스트(토큰을 직접 사용하여 API 호출)
1. 브라우저 흐름으로 얻은 `accessToken`을 복사
2. Postman에서 Authorization 탭 -> Bearer Token에 토큰을 넣고 보호된 엔드포인트 호출

  또는 Postman의 OAuth2 인증 흐름을 직접 사용하려면
  - Authorization URL: provider의 authorization-uri
  - Token URL: provider의 token-uri
  - Callback/Redirect URL: http://localhost:8080/api/login/oauth2/code/{provider}
  - Client ID/Secret: provider에서 발급받은 값
  - Get New Access Token을 사용해 코드 발급 및 토큰 교환 시도 가능하나, 서버가 중간에 사용자 정보를 처리하도록 설계되어 있어 브라우저 흐름(서버 callback 후 리다이렉트)을 권장합니다.

C) 프론트가 없을 때(서버가 최종 리다이렉트하는 URI를 테스트용으로 변경)
1. 기본적으로 `OAuth2SuccessHandler`는 `oauth2.redirect-uri` 프로퍼티를 사용합니다. 기본값은 `http://localhost:3000/oauth/redirect`입니다.
2. 로컬에서 프론트가 없고 토큰을 서버에서 직접 확인하고 싶다면 실행 시 환경변수로 덮어쓰세요:
```bash
export OAUTH2_REDIRECT_URI=http://localhost:8080/oauth/callback-test
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun
```
  - 위처럼 설정하면 로그인 완료 후 서버가 `http://localhost:8080/oauth/callback-test?accessToken=...` 로 리다이렉트하므로 서버 로그/브라우저에서 쿼리 파라미터를 확인할 수 있습니다.

6. 확인 포인트 / 디버깅
- Redirect URI mismatch 오류
  - provider에 등록된 Redirect URI와 실제 요청의 콜백 URL이 일치하는지 확인하세요.
- HTTPS 요구
  - 일부 provider는 프로덕션 클라이언트에 HTTPS 리다이렉트를 요구합니다. 로컬 테스트 시에는 로컬 개발용 앱으로 설정하거나 ngrok 등으로 공개 HTTPS 엔드포인트를 만들어 사용하세요.
- SameSite / Secure 옵션으로 인해 쿠키가 전달되지 않을 수 있음
  - `OAuth2SuccessHandler`에서 refresh cookie를 `secure:false`, `sameSite:Lax`로 설정되어 있지만 운영 환경에선 변경되어야 합니다. 로컬 테스트 시 브라우저 정책에 따라 다르게 동작할 수 있습니다.
- 서버 로그 레벨
  - `application-dev.yml`에서 `org.springframework.security: DEBUG`로 설정되어 있어 로그를 통해 인증 흐름을 추적하세요.

7. DB/회원 생성 확인
- OAuth 로그인 시 사용자 정보(email 등)가 DB의 회원 테이블에 저장되는지 확인하려면 MySQL에서 해당 테이블을 조회하세요.
```sql
SELECT * FROM member WHERE email = '테스트메일@example.com';
```

8. 요약 명령/예시
- 서버 실행
```bash
export SPRING_PROFILES_ACTIVE=dev
./gradlew bootRun
```
- 브라우저에서 시작 URL (Google 예시)
```
http://localhost:8080/api/oauth2/authorization/google
```
- 보호된 API 호출 예시
```bash
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:8080/api/your/protected
```

문제가 있거나 특정 provider 설정(예: Kakao 앱 등록 단계, Naver scope 설정 등)에 대한 자세한 가이드를 원하시면 알려주세요. 해당 provider별 화면 예시와 Redirect URI 등록 방법까지 단계별로 정리해 드리겠습니다.

