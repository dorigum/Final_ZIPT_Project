# 🏠 ZIPT — 전세사기 방지 플랫폼 백엔드

> 등기부등본 분석 · 전세사기 위험도 평가 · HUG 전세보증보험 검증을 자동화하는 REST API 서버

---

## 📌 프로젝트 소개

ZIPT(집+PT)는 전세 계약 시 발생하는 전세사기를 예방하기 위한 플랫폼입니다.  
사용자가 등기부등본 PDF를 업로드하면 OCR로 텍스트를 추출하고,  
국토부 실거래가 API와 자체 알고리즘으로 위험도를 분석하여 직관적인 결과를 제공합니다.

url : https://zipt.store/

---

## 🛠 기술 스택

| 분류 | 기술 |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.5, Spring Security, Spring AI |
| ORM | JPA / Hibernate |
| Database | MySQL 8.0, Redis 7.2, PostgreSQL + pgvector |
| Build | Gradle |
| Auth | JWT, OAuth2 (Google / Kakao / Naver) |
| AI | AWS Bedrock Claude (Spring AI), Naver Clova OCR |
| Storage | AWS S3 |
| Infra | AWS EC2, Docker, docker-compose |
| CI/CD | GitHub Actions, Docker Hub |
| Monitoring | Prometheus, Grafana, Amazon CloudWatch |
| API Docs | Swagger (springdoc-openapi 2.8.8) |

---

## 🏗 시스템 아키텍처

```
사용자
  ↓ HTTPS
Route53 (zipt.store)
  ↓
CloudFront (CDN + Reverse Proxy)
  ├── /          → S3 (React 정적 파일)
  └── /api/**    → EC2:8080 (Spring Boot)

EC2 (Docker)
  ├── zipt-backend   Spring Boot :8080
  ├── zipt-mysql     MySQL 8.0   :3306
  ├── zipt-redis     Redis 7.2   :6379
  ├── zipt-postgres  pgvector    :5432
  ├── zipt-prometheus            :9090
  └── zipt-grafana               :3000
```

---

## ✨ 주요 기능

### 🔐 인증
- JWT AccessToken + RefreshToken 발급
- Refresh Token Redis 저장 (자동 만료)
- OAuth2 소셜 로그인 (Google / Kakao / Naver)

### 📄 등기부등본 분석
- Naver Clova OCR로 PDF/이미지 텍스트 추출
- 소유자, 근저당권, 전세권, 압류 정보 자동 파싱
- S3 `registry/` 폴더에 원본 파일 저장

### 📊 전세사기 위험도 분석 (ZIPT 자체 평가)
- `(대출 + 보증금) ÷ 집값 × 100` 공식으로 위험 점수 산정
- **안심 / 유의 / 경고** 3단계 등급으로 직관적 표시

### 🛡 HUG 전세보증보험 검증
- 공시가격 대비 부채비율 90% 이하 여부
- 선순위 대출 60% 이하 여부
- 보증금 한도 및 담보인정비율(LTV) 검증
- 5가지 조건 통과 시 최종 가입 가능 판정

### 🏘 국토부 실거래가 조회
- 주소 기반 매물 최근 거래가 자동 조회
- 공공데이터포털 API 연동

### 🔊 층간소음 분석
- 한국환경공단 API 연동
- Redis 캐싱으로 응답 속도 최적화

### 🤖 계약서 분석 — 비동기 + AI · RAG + 체크리스트

#### ① 비동기 처리 구조
- **계약서 업로드** → 즉시 응답 (대기 없음)
- **@Async 처리** → 전용 스레드풀에서 OCR + AI 분석 실행
- **상태 관리** → 처리중 · 완료 · 실패를 폴링으로 확인
- 긴 AI 처리 시간이 사용자 응답 속도에 영향을 주지 않도록 업로드와 분석을 분리

#### ② AI 특약 진단 + RAG
- **문서 임베딩** → 500토큰 청크 분할 · Titan 임베딩 모델로 벡터화
- **벡터 검색** → pgvector에서 관련 법령 · 기준 코사인 유사도 검색
- **AI 진단** → AWS Bedrock Claude로 특약별 위험 등급 + 체크리스트 생성
- AI가 근거 문서를 검색해 답하도록 하여 환각을 줄이고 출처를 제시

#### ③ 계약서 체크리스트
- **항목 추출** → OCR 텍스트에서 위험 특약 자동 탐지
- **위험 분류** → 주의 · 확인 필요 · 위험 3단계로 분류
- **결과 제공** → 항목별 설명 + 개선 권고안 반환
- 법률 지식 없이도 계약서의 위험 조항을 항목별로 확인 가능

---

## 📁 프로젝트 구조

```
back_zipt/
├── src/
│   ├── main/
│   │   ├── java/com/zipt/
│   │   │   ├── domain/          # 도메인별 Controller / Service / Repository / DTO
│   │   │   │   ├── auth/        # 인증 (JWT, OAuth2)
│   │   │   │   ├── analysis/    # 등기부등본 분석, 위험도
│   │   │   │   ├── contract/    # 계약서 분석
│   │   │   │   ├── member/      # 회원 관리
│   │   │   │   ├── noise/       # 층간소음
│   │   │   │   └── rag/         # RAG 파이프라인
│   │   │   ├── global/          # 공통 설정 (Security, CORS, S3, Swagger 등)
│   │   │   └── BackZiptApplication.java
│   │   └── resources/
│   │       ├── application.yml           # 공통 설정
│   │       └── application-dev.yml       # 개발/배포 환경 설정 (gitignore)
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml        # Prometheus 수집 설정
├── docker-compose.yml            # 컨테이너 구성
├── Dockerfile                    # 백엔드 2단계 빌드
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD 파이프라인
└── build.gradle
```

---

## ⚙️ 환경 변수

`application-dev.yml`은 `.gitignore`에 포함되어 있습니다.  
아래 항목을 직접 작성하거나 GitHub Secrets에 `APPLICATION_DEV_YML`로 등록해 사용하세요.

```yaml
spring:
  datasource:
    url: jdbc:mysql://zipt-mysql:3306/zipt?serverTimezone=Asia/Seoul
    username: {MYSQL_USER}
    password: {MYSQL_PASSWORD}

  data:
    redis:
      host: zipt-redis
      port: 6379

  datasource-vector:
    url: jdbc:postgresql://zipt-postgres:5432/zipt_vector
    username: {POSTGRES_USER}
    password: {POSTGRES_PASSWORD}

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: {GOOGLE_CLIENT_ID}
            client-secret: {GOOGLE_CLIENT_SECRET}
          kakao:
            client-id: {KAKAO_CLIENT_ID}
            client-secret: {KAKAO_CLIENT_SECRET}
          naver:
            client-id: {NAVER_CLIENT_ID}
            client-secret: {NAVER_CLIENT_SECRET}

  ai:
    bedrock:
      aws:
        access-key: {AWS_BEDROCK_ACCESS_KEY}
        secret-key: {AWS_BEDROCK_SECRET_KEY}

jwt:
  secret: {JWT_SECRET}

clova:
  ocr:
    url: {CLOVA_OCR_URL}
    secret: {CLOVA_OCR_SECRET}

cloud:
  aws:
    credentials:
      access-key: {AWS_S3_ACCESS_KEY}
      secret-key: {AWS_S3_SECRET_KEY}

oauth2:
  redirect-uri: http://localhost:5173/oauth/redirect
```

---

## 🚀 로컬 실행 방법

### 1. DB 컨테이너 먼저 실행

```bash
docker-compose up -d zipt-mysql zipt-redis zipt-postgres
```

### 2. application-dev.yml 작성

`src/main/resources/application-dev.yml` 파일을 위 환경변수 항목을 참고하여 작성합니다.  
(로컬 실행 시 DB 주소는 `localhost`로 설정)

### 3. IntelliJ에서 실행

```
Run/Debug Configurations
→ Active Profiles: dev
→ Run
```

### 4. API 문서 확인

```
[http://localhost:8080/swagger-ui/index.html](https://zipt.store/api/swagger-ui/index.html)
```

---

## 🔄 CI/CD 파이프라인

```
dev 브랜치 push
    ↓
GitHub Actions (deploy.yml)
    ├── application-dev.yml 생성 (GitHub Secret 주입)
    ├── Gradle 빌드 (bootJar)
    ├── Docker 이미지 빌드 + Docker Hub push
    ├── EC2에 docker-compose.yml + prometheus.yml scp 전송
    └── EC2 SSH 접속
        ├── docker pull (최신 이미지)
        ├── 기존 컨테이너 중지 및 제거
        └── docker-compose up -d (새 컨테이너 실행)
```

### GitHub Secrets 등록 목록

| Secret 이름 | 설명 |
|---|---|
| `APPLICATION_DEV_YML` | application-dev.yml 전체 내용 |
| `DOCKER_USERNAME` | Docker Hub 아이디 |
| `DOCKER_ACCESS_TOKEN` | Docker Hub 액세스 토큰 |
| `EC2_HOST` | EC2 퍼블릭 IP |
| `EC2_PRIVATE_KEY` | EC2 SSH 키 (.pem 내용) |

---

## 📊 모니터링

| 도구 | 주소 | 설명 |
|---|---|---|
| Swagger | `[/api/swagger-ui/index.html](https://zipt.store/api/swagger-ui/index.html#/)` | API 문서 |
| Prometheus | `EC2_IP:9090` | 메트릭 수집 |
| Grafana | `EC2_IP:3000` | JVM 대시보드 (ID: 4701) |
| CloudWatch | AWS 콘솔 | EC2 CPU/메모리/디스크 |

---

## 👥 팀원

| 이름 | 역할 |
|---|---|
| 이정건👑 | 백엔드 개발- 임대차계약서 분석, 비동기, Spring AI, 모니터링 |
| 구도연 | 프론트엔드 개발, 거주 인프라브리핑, 부동산 가이드 |
| 오혜진 | 백엔드 개발, 등기부등본 분석, AWS 인프라, CI/CD, 모니터링 |
| 이동혁 | 백엔드 개발, JWT구현, OAuth(naver/kakao/google), RAG |

---

## 🔗 관련 레포지토리

- **Frontend**: [1-ZIPT/front_zipt](https://github.com/1-ZIPT/front_zipt)
- **Backend**: [1-ZIPT/back_zipt](https://github.com/1-ZIPT/back_zipt)
