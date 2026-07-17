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

## 담당 역할 및 주요 기여

커밋 내역을 기준으로 보면, 주로 **프론트엔드 UI/UX 고도화와 사용자 플로우 안정화**를 중심으로 개발했고, 백엔드에서는 프론트 기능을 완성하기 위해 필요한 일부 API/예외 처리/연동 기능을 보완했습니다.

### Frontend 중심 기여

- **서비스 핵심 화면 UI/UX 개선**
  - 게스트 홈, 로그인 회원 홈, 분석 상세 화면, 마이페이지, 용어 사전, 부동산 가이드, 인프라 지도 화면의 레이아웃과 반응형 UI를 개선했습니다.
  - 등기부등본/임대차계약서 분석 결과를 사용자가 빠르게 이해할 수 있도록 게이지, 배지, 카드, 체크리스트, 진행 상태 UI를 정리했습니다.
  - 모바일 웹에서 버튼 줄바꿈, 카드 오버플로우, 긴 파일명 말줄임, 헤더 메뉴 노출, CTA 크기 등 실제 사용 중 불편한 부분을 반복적으로 개선했습니다.

- **분석 플로우와 결과 리포트 UX 구현**
  - 등기부등본 분석과 임대차계약서 분석 업로드 화면을 정리하고, 최근 분석 이력과 상세 리포트로 자연스럽게 이어지는 흐름을 구성했습니다.
  - 분석 진행 중 화면, 실패 상태 화면, 재시도 안내, 결과 상세 이동 버튼 등 예외 상황까지 포함한 사용자 흐름을 보완했습니다.
  - 계약서 분석 결과에서는 위험 조항, 체크리스트, 필수 확인 항목을 사용자가 직접 점검할 수 있도록 UI를 개선했습니다.

- **마이페이지 및 분석 이력 관리**
  - 등기부등본 분석 이력과 임대차계약서 분석 이력을 마이페이지에서 통합적으로 볼 수 있도록 정리했습니다.
  - 삭제 API 연동, 최신순 정렬, 실패 상태 표시, 파일명/주소 표시, 탭 상태 유지 등 이력 관리 UX를 다듬었습니다.
  - 주소가 일치하는 등기부등본과 계약서를 묶어 보여주는 서류 매칭 섹션을 추가해 사용자가 같은 매물의 서류들을 함께 확인할 수 있도록 개선했습니다.

- **지도/인프라 브리핑 기능 고도화**
  - Kakao Maps SDK 기반 주소 검색, 현재 위치 조회, 카테고리 필터, POI 마커/리스트 동기화 UI를 개선했습니다.
  - 도보 거리, 카테고리별 생활 인프라, 지도 마커 hover 상호작용 등 지도 화면의 사용성을 높였습니다.
  - Gemini API를 활용한 동네 인프라 브리핑 프롬프트를 정교화하고, 모델 호환성 fallback과 출력 안정성을 보완했습니다.

- **프론트엔드 구조와 성능 개선**
  - React Router 기반 공개/보호 라우팅과 구 경로 redirect를 정리했습니다.
  - Zustand 인증 상태와 React Query 서버 상태를 분리해 로그인 상태, 회원 정보, 분석 이력 캐시를 관리했습니다.
  - Axios interceptor로 access token 주입, 401 refresh queue, 강제 로그아웃 처리를 구성했습니다.
  - React.lazy 기반 라우트 코드 스플리팅, PDF 저장 기능 지연 로딩, 이미지 최적화(vite-imagetools) 등을 적용해 초기 로딩 부담을 줄였습니다.

### Backend 연동 및 보완 기여

- **프론트 기능 완성을 위한 API 보완**
  - 마이페이지 계약 D-day 알림 여부를 토글할 수 있는 tracking API를 추가해 프론트의 리마인더 기능과 연결했습니다.
  - 부동산 가이드 공개 접근 허용, S3 기반 가이드/용어 동기화 등 콘텐츠 제공 흐름을 보완했습니다.

- **예외 처리 및 안정성 개선**
  - 등기부등본 분석 실패 상황에서 프론트가 실패 UI를 표시할 수 있도록 백엔드 실패 응답 처리를 보완했습니다.
  - Spring Security 인증 예외가 공통 예외 처리 흐름에서 다뤄지도록 `GlobalExceptionHandler`를 보강했습니다.

### 문제 해결 방식

- 기능 구현 후 실제 화면에서 발생하는 UI 깨짐, 모바일 오버플로우, 비동기 상태 불일치, 분석 실패 케이스를 반복적으로 확인하며 개선했습니다.
- 단순히 화면을 만드는 것보다 **업로드 → 분석 진행 → 실패/완료 → 상세 리포트 → 이력 관리**까지 이어지는 전체 사용자 여정을 기준으로 기능을 정리했습니다.
- 프론트에서 필요한 백엔드 응답 형태와 예외 케이스를 함께 확인하며, 프론트/백엔드 경계에서 생기는 문제를 직접 추적하고 보완했습니다.

### 포트폴리오에서 강조할 수 있는 역량

- React 기반 복합 서비스 화면 설계와 반응형 UI 구현
- React Query/Zustand/Axios를 활용한 인증 및 서버 상태 관리
- 파일 업로드, 분석 진행 상태, 실패 처리, PDF 저장 등 실사용 플로우 구현
- 지도 SDK와 외부 AI API를 활용한 사용자 맞춤형 정보 제공
- Spring Security/JWT/OAuth2 기반 인증 흐름 이해와 API 연동
- CI/CD, Docker, AWS 배포 구조를 고려한 풀스택 프로젝트 경험

## 참고

이 저장소는 포트폴리오 제출 및 프로젝트 회고를 위한 개인 백업용 저장소입니다. 실제 운영 환경의 비밀값과 배포 설정은 별도 Secret Manager 또는 GitHub Secrets에서 관리해야 합니다.

