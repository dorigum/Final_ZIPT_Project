# ZIPT 프로젝트 트러블슈팅 기록

이 문서는 ZIPT 프로젝트 개발 중 발생한 트러블슈팅 내역을 정리한 독립 문서입니다.

---

## 1. `80% EXECUTING`에서 멈춘 것처럼 보임

### 증상
```text
> Task :bootRun
80% EXECUTING
```

### 원인
* Spring Boot 서버가 실행 중이면 Gradle task가 종료되지 않고 계속 대기한다.
* 멈춘 것이 아니라 서버가 켜진 정상 상태다.

### 해결
* 종료하려면 터미널에서 `Ctrl + C`
* 서버 실행 중에는 브라우저에서 API 또는 로그인 URL 접근 가능

---

## 2. 8080 포트 이미 사용 중

### 증상
```text
Web server failed to start. Port 8080 was already in use.
```

### 원인
* 기존 백엔드 서버가 이미 실행 중이거나, 다른 프로세스가 8080 포트를 사용 중.

### 확인
```powershell
netstat -ano | findstr :8080
```

### 종료
```powershell
taskkill /PID {PID} /F
```

### 대안
```powershell
.\gradlew.bat bootRun --args='--server.port=8081'
```
단, 포트를 바꾸면 카카오 Redirect URI도 해당 포트로 추가 등록해야 하므로 로컬에서는 8080 유지가 더 단순하다.

---

## 3. `/login?error`와 `Invalid credentials`

### 증상
```text
http://localhost:8080/login?error
Invalid credentials
```

### 원인
* Spring Security 기본 실패 페이지로 이동한 상태.
* 처음에는 실패 원인이 화면에 드러나지 않았다.

### 조치
* `OAuth2FailureHandler`를 추가해서 실패 원인을 로그와 프론트 콜백 URL로 전달하도록 변경했다.

### 이후 실패 시 예시
```text
http://localhost:5173/oauth/callback?error=oauth_failed&message=...
```

---

## 4. OAuth `state` 검증 실패 가능성

### 증상
* 카카오 로그인 후 계속 `/login?error`로 이동
* 백엔드 로그에 명확한 에러가 보이지 않음

### 원인 후보
* OAuth2 로그인은 인증 요청 시 생성한 `state`를 세션에 저장하고 콜백에서 검증한다.
* 그런데 보안 설정이 완전 stateless이면 OAuth2 인증 요청 저장소가 정상 동작하지 않을 수 있다.

### 기존 설정
```java
SessionCreationPolicy.STATELESS
```

### 수정
```java
SessionCreationPolicy.IF_REQUIRED
```

### 결과
* OAuth 로그인에 필요한 최소 세션 사용을 허용했다.
* JWT 기반 API 호출은 여전히 Bearer 토큰 중심으로 동작한다.

---

## 5. `invalid_token_response 401`

### 증상
```text
Login failed: [invalid_token_response] An error occurred while attempting to retrieve the OAuth 2.0 Access Token Response: 401 : [no body]
```

### 의미
* 카카오 로그인 동의까지는 성공했다.
* 백엔드가 카카오에서 Access Token을 발급받는 단계에서 401 인증 실패가 발생했다.

### 확인한 내용
* REST API 키가 현재 앱의 키와 동일한지 확인했다.
* Redirect URI가 아래 값과 정확히 일치하는지 확인했다.
  `http://localhost:8080/login/oauth2/code/kakao`
* OpenID Connect는 현재 구조와 무관하므로 OFF로 유지했다.
* 동의항목은 `profile_nickname`만 필요했다.

### 해결
* 카카오 개발자 콘솔에서 Client Secret을 생성/활성화했다.
* `backend/.env`에 아래 값을 추가했다.
  ```properties
  KAKAO_CLIENT_SECRET=카카오_Client_Secret
  KAKAO_CLIENT_AUTH_METHOD=client_secret_post
  ```

### 주의
* Client Secret 값은 저장소에 커밋하면 안 된다.
* `backend/.env`는 gitignore에 포함되어 있다.
