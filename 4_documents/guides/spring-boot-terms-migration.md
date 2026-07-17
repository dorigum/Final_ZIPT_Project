# 부동산 용어 사전 Spring Boot 전환 및 로컬 개발 연동 가이드

이 가이드는 기존 React 정적 목업 기반의 용어 사전 데이터를 Spring Boot 백엔드와 연동하고, 로컬 개발 환경을 성공적으로 기동하기 위한 절차와 트러블슈팅 방안을 설명합니다.

---

## 1. 아키텍처 및 역할 분비

```text
[Vite + React 화면 (front_zipt)] 
       │ 
       │ (CORS 해소를 위한 Vite Proxy /api/terms)
       ▼ 
[Spring Boot WAS (back_zipt)] 
       │ 
       │ (Spring Data JPA)
       ▼ 
[DB (로컬 H2 / 운영 PostgreSQL)]
```

---

## 2. 로컬 개발 환경 연동 설정

### ① 프론트엔드 API 프록시 설정
프론트엔드(`front_zipt`)에서 백엔드 API 서버(`http://localhost:8080`)로 요청 시 CORS 문제를 방지하기 위해 `vite.config.js`에 프록시가 설정되어 있습니다.

```javascript
// front_zipt/vite.config.js 예시
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
});
```
- 프론트엔드에서는 Axios/Fetch 호출 시 `/api/terms` 형식의 상대 경로로 요청하면, 개발 서버가 이를 `http://localhost:8080/api/terms`로 우회 전송합니다.

### ② 백엔드 데이터베이스 초기 데이터 적재 (Seed)
- 백엔드 실행 시 `src/main/resources/seed/terms.json`에 정제된 80개의 HUG 부동산 용어 데이터가 JSON 형태로 존재합니다.
- 애플리케이션 시작 시 데이터베이스에 용어 데이터가 비어 있을 경우, 이를 자동으로 파싱하여 `real_estate_terms` 및 `term_aliases` 테이블에 JPA 엔티티로 적재(`CommandLineRunner` 혹은 별도 Seed Loader 로직 수행)하도록 설계되어 있습니다.

---

## 3. 로컬 테스트 및 빌드 트러블슈팅

### ① 전체 빌드 및 테스트 실패 해결 (S3 환경 설정 누락 건)
**현상**:
백엔드 루트에서 `./gradlew test` 실행 시, 용어 사전 테스트는 통과하지만 전체 테스트 컨텍스트 로드(`contextLoads()`)가 실패하는 현상이 발생합니다.

**원인**:
- 프로젝트 공통 설정 파일에서 AWS S3 기능(`S3Config.java`)이 빈으로 등록될 때 `cloud.aws.credentials.access-key` 등의 AWS 환경 변수를 필수 요구하지만, 로컬 또는 CI 테스트 환경에는 이 변수가 주입되어 있지 않기 때문입니다.

**대처 및 검증 방법**:
1. **용어 기능 독립 검증**: 용어 도메인 패키지(`com.zipt.domain.term.*`) 테스트만 명시적으로 지정하여 실행합니다.
   ```bash
   # Windows PowerShell / CMD
   ./gradlew.bat test --tests com.zipt.domain.term.*
   ```
2. **로컬 테스트 프로파일 적용**: 로컬 DB 및 AWS 모의(Mocking) 설정을 지정하기 위해 `src/test/resources/application.yml`에 더미 크레덴셜 정보를 선언하여 실행하도록 팀원 간 공유를 권장합니다.

### ② SecurityConfig 접근 권한 이슈 (415, 403 Forbidden)
- 용어 사전 API는 비로그인 사용자도 자유롭게 열람할 수 있는 오픈 API로 제공될 예정입니다.
- 이를 위해 스프링 시큐리티 설정 파일(`SecurityConfig.java`)에 아래 설정을 적용해야 합니다.
  ```java
  .requestMatchers("/api/terms/**").permitAll()
  ```
- *주의*: `SecurityConfig.java`는 JWT 로그인, 마이페이지 연동을 담당하는 팀원들과 작업이 겹칠 수 있으므로 개별 기능 개발 브랜치(`feature/terms`)에서는 수정을 지양하고, 최종 `dev` 브랜치 병합(PR) 과정에서 함께 조율하여 반영합니다.

### ③ PowerShell 한글 깨짐 현상
- 소스 파일 및 JSON 시드 파일이 Windows PowerShell 콘솔에서 출력될 때 한글이 깨지는 현상이 있다면, 이는 파일 내부의 깨짐이 아닌 터미널 인코딩 문제입니다.
- 모든 소스 코드와 시드 데이터는 반드시 **UTF-8 (no BOM)** 포맷으로 저장 및 편집되어야 하며, 터미널 출력을 검증할 때는 IDE 내장 터미널을 이용하거나 인코딩 값을 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`로 변경하여 확인하십시오.
