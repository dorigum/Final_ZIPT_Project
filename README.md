# ZIPT - 전월세 안전진단 풀스택 플랫폼

> KOSTA 파이널 프로젝트로 진행한 전월세 계약 안전진단 서비스입니다. 등기부등본 분석, 임대차계약서 AI 검토, 부동산 용어/가이드, 동네 인프라 브리핑을 하나의 사용자 흐름으로 연결했습니다.

## 프로젝트 소개

ZIPT는 사회초년생과 임차인이 전월세 계약 과정에서 놓치기 쉬운 위험 요소를 더 쉽게 확인할 수 있도록 만든 서비스입니다.

사용자는 등기부등본이나 임대차계약서를 업로드하고, 서비스는 OCR/AI 분석과 백엔드 검증 로직을 통해 위험도, 체크리스트, 보증보험 가능성, 계약서 특약 주의사항 등을 리포트 형태로 제공합니다. 프론트엔드는 분석 결과를 직관적인 카드, 게이지, 체크리스트, 마이페이지 이력으로 정리하고, 백엔드는 인증, 파일 업로드, 비동기 분석, 데이터 저장, CI/CD 배포 흐름을 담당합니다.

## 주요 기능

- 등기부등본 업로드 및 전세 위험도 분석
- 임대차계약서 업로드 및 AI 기반 체크리스트 생성
- HUG 전세보증보험 가능성 판단 보조
- 분석 결과 상세 리포트 및 PDF 저장/업로드
- 마이페이지 분석 이력 통합 관리
- 주소 기반 동네 인프라 지도와 AI 브리핑
- 부동산 용어 사전, 계약 가이드, 유용한 링크 제공
- JWT/OAuth2 기반 로그인 및 세션 관리
- Docker, GitHub Actions 기반 배포 자동화 구성

## 기술 스택

### Frontend

| 영역 | 기술 |
| --- | --- |
| Framework | React 19 |
| Build | Vite |
| Routing | React Router DOM |
| Server State | TanStack React Query |
| Client State | Zustand |
| Style | SCSS, CSS Module |
| HTTP | Axios, Fetch |
| Document | html2canvas, jsPDF |
| Map/AI | Kakao Maps SDK, Gemini API |

### Backend

| 영역 | 기술 |
| --- | --- |
| Language | Java 21 |
| Framework | Spring Boot 3.5, Spring Security |
| ORM | Spring Data JPA, Hibernate |
| Database | MySQL, Redis, PostgreSQL + pgvector |
| Auth | JWT, OAuth2 Google/Kakao/Naver |
| AI/OCR | AWS Bedrock Claude, Naver Clova OCR |
| Storage | AWS S3 |
| API Docs | Swagger / springdoc-openapi |
| Infra | Docker, docker-compose, AWS EC2/S3/CloudFront |
| CI/CD | GitHub Actions, Docker Hub |
| Monitoring | Prometheus, Grafana, CloudWatch |

## 프로젝트 구조

```text
Final_ZIPT_Project/
│
├── 4_documents/                 프로젝트 기획, 회고, 트러블슈팅, 작업 로그
│
├── back_zipt/                    Spring Boot 백엔드
│   ├── src/main/java/com/zipt/
│   │   ├── config/               Security, Redis, S3, Swagger 등 설정
│   │   ├── domain/
│   │   │   ├── analysis/         등기부등본 분석 도메인
│   │   │   ├── auth/             JWT/OAuth 인증 도메인
│   │   │   ├── contract/         계약서 분석 및 체크리스트 도메인
│   │   │   ├── guide/            부동산 가이드 도메인
│   │   │   ├── member/           회원 도메인
│   │   │   ├── noise/            층간소음/지역 통계 도메인
│   │   │   ├── rag/              RAG 검색/임베딩 도메인
│   │   │   └── term/             부동산 용어 도메인
│   │   └── global/               공통 예외, JWT, OCR, S3, 응답 객체
│   ├── src/main/resources/       application 설정, prompt, seed 데이터
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── front_zipt/                   React 프론트엔드
    ├── src/api/                  API 클라이언트와 도메인별 요청 함수
    ├── src/components/           공통 UI 및 도메인 컴포넌트
    ├── src/hooks/                React Query 기반 커스텀 훅
    ├── src/pages/                라우트 단위 페이지
    ├── src/store/                Zustand 전역 상태
    ├── src/styles/               전역 스타일과 디자인 토큰
    ├── src/utils/                포맷팅/JWT/CSS 유틸
    ├── package.json
    └── vite.config.js
```

## 서비스 흐름

```text
사용자
  ↓
React Frontend
  ↓
Spring Boot API
  ├── 인증/회원 관리
  ├── 파일 업로드 및 S3 저장
  ├── OCR 텍스트 추출
  ├── AI/RAG 기반 계약서 분석
  ├── 등기부 위험도 계산
  └── 분석 이력 저장
  ↓
MySQL / Redis / PostgreSQL(pgvector)
```

## 실행 방법

### Frontend

```bash
cd front_zipt
npm install
npm run dev
```

기본 개발 서버는 `http://localhost:5173`입니다.

### Backend

```bash
cd back_zipt
./gradlew bootRun
```

Windows 환경에서는 다음 명령을 사용할 수 있습니다.

```bash
gradlew.bat bootRun
```

### Docker Compose

```bash
cd back_zipt
docker-compose up -d
```

## 환경 변수

실제 운영 키와 비밀값은 저장소에 커밋하지 않고 환경 변수 또는 GitHub Secrets로 주입하는 것을 기준으로 구성했습니다.

예시 항목:

```text
JWT_SECRET=
GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_SECRET=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_S3_ACCESS_KEY=
AWS_S3_SECRET_KEY=
CLOVA_OCR_SECRET=
MOLIT_API_KEY=
VITE_API_BASE_URL=
VITE_KAKAO_MAP_KEY=
VITE_GEMINI_API_KEY=
```

## 보안 정리

포트폴리오용 저장소로 정리하면서 다음 항목은 제외하거나 placeholder로 변경했습니다.

- `.env`, `.env.*` 파일 제외
- `node_modules`, `dist`, `build`, `.gradle`, IDE 설정 제외
- 기존 하위 프로젝트의 `.git` 폴더 제외
- JWT 기본 secret, admin token 예시, API key 주석값 placeholder 처리
- docker-compose의 로컬 더미 비밀번호 placeholder 처리

## 담당/기여 포인트 정리

포트폴리오에서 강조할 수 있는 구현 포인트입니다.

- React Router 기반 공개/보호 라우팅 구성
- Axios interceptor 기반 access token 주입 및 401 refresh queue 처리
- Zustand 인증 상태와 React Query 서버 상태 분리
- 파일 업로드 기반 등기부/계약서 분석 플로우 구현
- 계약서 체크리스트 낙관적 업데이트 및 분석 진행 상태 처리
- 마이페이지 분석 이력 통합 관리 UX 구현
- Kakao Maps SDK 지연 로드와 주소 기반 인프라 브리핑 구성
- Spring Security + JWT + OAuth2 인증 구조 구성
- OCR/AI/RAG 분석 도메인 설계 및 비동기 처리 흐름 구성
- Docker/GitHub Actions 기반 배포 파이프라인 구성

## 참고

이 저장소는 포트폴리오 제출 및 프로젝트 회고를 위한 개인 백업용 저장소입니다. 실제 운영 환경의 비밀값과 배포 설정은 별도 Secret Manager 또는 GitHub Secrets에서 관리해야 합니다.
