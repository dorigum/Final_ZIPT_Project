# ZIPT Frontend

> 전월세 계약 전후에 필요한 등기부등본 분석, 임대차계약서 검토, 동네 인프라 확인, 부동산 용어/가이드 탐색을 한 화면 흐름으로 연결하는 React 기반 프론트엔드입니다.

## 현재 코드 기준

- 원격 저장소: `https://github.com/1-ZIPT/front_zipt1`
- 기준 브랜치: `origin/dev`
- 로컬 브랜치: `feature/ui-ux`
- 확인 일자: 2026-07-07
- 최신 `origin/dev` fetch 후 비교 결과: 현재 로컬 브랜치와 `origin/dev` 사이의 코드 커밋 차이는 없습니다.
- 로컬 미추적 파일: `.claude/launch.json.backup`
- 빌드 검증: `npm run build` 성공

## 프로젝트 개요

ZIPT는 사용자가 전월세 계약 과정에서 마주하는 서류와 정보를 쉽게 해석하도록 돕는 프론트엔드 애플리케이션입니다. 등기부등본과 계약서를 업로드하면 백엔드 분석 결과를 리포트 형태로 보여주고, 사용자는 마이페이지에서 분석 이력을 다시 확인하거나 PDF로 보관할 수 있습니다.

주요 사용자 흐름은 다음과 같습니다.

1. 회원가입/로그인 또는 OAuth 로그인
2. 등기부등본 분석 또는 임대차계약서 분석
3. 분석 진행/실패/완료 상태 확인
4. 상세 리포트 조회 및 PDF 업로드/저장
5. 마이페이지에서 등기부/계약서 이력 통합 관리
6. 지도 기반 동네 인프라와 AI 브리핑 확인
7. 부동산 용어 사전, 가이드, 유용한 링크 탐색

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 런타임/번들러 | Vite 8, React 19 |
| 라우팅 | React Router DOM 7 |
| 서버 상태 | TanStack React Query 5 |
| 클라이언트 상태 | Zustand 5 |
| HTTP | Axios, Fetch(SSE/외부 API) |
| 스타일 | SCSS, CSS Module, 전역 디자인 토큰 |
| 문서/PDF | html2canvas, jsPDF |
| 지도/AI | Kakao Maps SDK, Gemini API 연동 |
| 이미지 처리 | vite-imagetools |

## 실행 방법

```bash
npm install
npm run dev
```

기본 개발 서버는 `http://localhost:5173`에서 실행됩니다.

프로덕션 빌드:

```bash
npm run build
```

미리보기:

```bash
npm run build
npm run preview
```

현재 `package.json`에는 `preview` 스크립트가 없으므로 필요하면 다음 스크립트를 추가해 사용할 수 있습니다.

```json
{
  "scripts": {
    "preview": "vite preview"
  }
}
```

## 환경 변수

| 변수 | 설명 |
| --- | --- |
| `VITE_API_BASE_URL` | 운영 환경 API Base URL. 개발 환경에서는 Vite proxy 때문에 기본적으로 `/api`를 사용합니다. |
| `VITE_KAKAO_MAP_KEY` | Kakao Maps JavaScript SDK 키 |
| `VITE_GEMINI_API_KEY` | 동네 인프라 AI 브리핑용 Gemini API 키 |

개발 환경 API 프록시는 [vite.config.js](./vite.config.js)에 정의되어 있습니다.

```js
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
    },
  },
}
```

## 폴더 구조

```text
front_zipt/
│
├── 📁 public/
│   └── favicon.svg                 ← 서비스 파비콘
│
├── 📁 src/
│   ├── 📁 api/                     ← 백엔드/외부 API 요청 모듈
│   │   ├── instance.js             ← Axios 공통 인스턴스, 토큰 주입, 401 refresh 처리
│   │   ├── authApi.js              ← 로그인, 로그아웃, 토큰 refresh API
│   │   ├── memberApi.js            ← 내 회원 정보 조회 API
│   │   ├── analysisApi.js          ← 등기부등본 분석/이력/상세/PDF API
│   │   ├── contractApi.js          ← 계약서 분석/이력/상세/체크리스트/SSE/PDF API
│   │   ├── guideApi.js             ← 부동산 가이드 API
│   │   └── geminiApi.js            ← 동네 인프라 AI 브리핑 API
│   │
│   ├── 📁 assets/
│   │   └── profiles/               ← 프로필 이미지 리소스
│   │
│   ├── 📁 components/              ← 재사용 UI/도메인 컴포넌트
│   │   ├── analysis/               ← 등기부 분석 업로드, 리포트, 데이터 정규화
│   │   ├── auth/                   ← 로그인, 회원가입, SNS 로그인 컴포넌트
│   │   ├── common/                 ← 버튼, 카드, 배지, 헤더, 보호 라우트, 공통 상태 UI
│   │   ├── contract/               ← 계약서 업로드, 분석 리포트, 정규화
│   │   ├── home/                   ← 홈 화면 섹션 컴포넌트
│   │   ├── map/                    ← Kakao 지도, 인프라 카드, AI 브리핑, 주소 경고 모달
│   │   ├── mypage/                 ← 마이페이지 리포트 라이브러리 훅
│   │   ├── terms/                  ← 용어 카드 컴포넌트
│   │   └── infra/                  ← 인프라 관련 보조 컴포넌트
│   │
│   ├── 📁 hooks/                   ← React Query 기반 커스텀 훅
│   │   ├── useAnalysis.js          ← 등기부 분석 mutation/query 훅
│   │   ├── useContract.js          ← 계약서 mutation/query 훅
│   │   └── useRevealOnScroll.js    ← 스크롤 reveal 인터랙션 훅
│   │
│   ├── 📁 mocks/                   ← 로컬 fallback/mock 데이터
│   │   ├── ziptData.js
│   │   ├── terms.json
│   │   └── guides.json
│   │
│   ├── 📁 pages/                   ← 라우트 단위 페이지
│   │   ├── analysis/               ← 등기부 분석 업로드/상세 페이지
│   │   ├── auth/                   ← 로그인, 회원가입, OAuth redirect 페이지
│   │   ├── contract/               ← 계약서 분석 업로드/상세 페이지
│   │   ├── guide/                  ← 부동산 가이드 목록/상세 페이지
│   │   ├── home/                   ← 게스트/회원 홈 페이지
│   │   ├── links/                  ← 유용한 링크 페이지
│   │   ├── map/                    ← 동네 인프라 지도 페이지
│   │   ├── mypage/                 ← 마이페이지
│   │   └── terms/                  ← 부동산 용어 사전 페이지
│   │
│   ├── 📁 store/
│   │   └── useAuthStore.js         ← Zustand 인증/회원 전역 상태
│   │
│   ├── 📁 styles/                  ← 전역 스타일과 디자인 토큰
│   │   ├── global.scss             ← 전체 레이아웃/공통 스타일
│   │   ├── tokens.scss             ← 디자인 토큰
│   │   └── variables.scss          ← SCSS 변수
│   │
│   ├── 📁 utils/                   ← 공통 유틸리티
│   │   ├── format.js               ← 날짜/숫자 포맷팅
│   │   ├── jwt.js                  ← JWT 유틸
│   │   └── toCssVariable.js        ← 동적 CSS 변수 변환 유틸
│   │
│   ├── App.jsx                     ← 전체 라우팅, 인증 초기화, 레이아웃 구성
│   ├── main.jsx                    ← React 진입점
│   └── queryClient.js              ← TanStack Query 공통 설정
│
├── index.html                      ← Vite HTML 진입점
├── package.json                    ← 프로젝트 스크립트/의존성 설정
├── package-lock.json               ← 의존성 버전 고정
├── vite.config.js                  ← Vite, proxy, imagetools 설정
└── README.md                       ← 프로젝트 소개 문서
```

## 라우팅 구조

[src/App.jsx](./src/App.jsx)가 전체 라우트를 구성합니다.

| 경로 | 설명 | 접근 |
| --- | --- | --- |
| `/` | 홈. 로그인 여부와 분석 이력 유무에 따라 게스트/신규/재방문 화면 분기 | 공개 |
| `/login`, `/signup` | 인증 화면 | 공개 |
| `/oauth/redirect` | OAuth 로그인 콜백 처리 | 공개 |
| `/map` | 동네 인프라 지도와 AI 브리핑 | 공개 |
| `/terms` | 부동산 용어 사전 | 공개 |
| `/guide`, `/guide/:id` | 부동산 가이드 | 공개 |
| `/links` | 유용한 링크 모음 | 공개 |
| `/analysis`, `/analysis/:id` | 등기부등본 분석/상세 리포트 | 인증 필요 |
| `/contract`, `/contract/:contractId` | 계약서 분석/상세 리포트 | 인증 필요 |
| `/mypage` | 분석 이력 통합 관리 | 인증 필요 |

`/glossary`, `/board`, `/tips` 등 이전 경로는 현재 경로로 redirect 처리됩니다.

## 주요 기능

### 인증과 세션 관리

- [src/store/useAuthStore.js](./src/store/useAuthStore.js)에서 access token, 로그인 상태, 회원 정보, 인증 모달 상태를 관리합니다.
- 앱 최초 로드 시 [src/App.jsx](./src/App.jsx)에서 silent refresh를 시도합니다.
- OAuth 콜백 경로에서는 refresh와 콜백 처리가 충돌하지 않도록 별도 예외 처리를 둡니다.
- 로그아웃 시 React Query 캐시를 함께 비워 이전 계정의 분석 이력이 노출되지 않게 합니다.

### API 클라이언트

- [src/api/instance.js](./src/api/instance.js)가 Axios 공통 인스턴스를 제공합니다.
- 개발 환경에서는 `/api` proxy를 사용하고, 운영 환경에서는 `VITE_API_BASE_URL` 또는 `/api`를 사용합니다.
- 요청 인터셉터에서 Zustand의 access token을 `Authorization: Bearer` 헤더에 주입합니다.
- 응답 인터셉터는 401 응답을 받으면 refresh 요청을 한 번 수행하고, 동시에 실패한 요청은 queue에 모아 새 토큰으로 재시도합니다.
- refresh까지 실패하면 강제 로그아웃 후 `/login`으로 이동합니다.

### 등기부등본 분석

- [src/hooks/useAnalysis.js](./src/hooks/useAnalysis.js)가 업로드, 이력 조회, 상세 조회, PDF 업로드 mutation/query를 제공합니다.
- [src/api/analysisApi.js](./src/api/analysisApi.js)는 파일, 보증금, 주택 유형을 `FormData`로 전송합니다.
- 분석 실패 응답은 예외로만 처리하지 않고 실패 payload로 정규화해 사용자에게 실패 화면을 보여줄 수 있게 구성되어 있습니다.

### 임대차계약서 분석

- [src/hooks/useContract.js](./src/hooks/useContract.js)가 계약서 업로드, 이력/상세 조회, 삭제, 체크리스트 재생성, 체크 상태 변경, 알림 추적 설정을 담당합니다.
- 체크리스트 체크 상태와 알림 추적 설정은 React Query의 낙관적 업데이트를 사용해 즉각적인 UI 반응을 제공합니다.
- [src/api/contractApi.js](./src/api/contractApi.js)는 계약서 처리 진행 이벤트를 SSE stream으로 구독할 수 있도록 Fetch 기반 reader를 구현합니다.

### 마이페이지

- [src/components/mypage/useReportLibrary.js](./src/components/mypage/useReportLibrary.js)가 등기부 이력과 계약서 이력을 통합해 리포트 라이브러리 형태로 정리합니다.
- 서버 데이터가 없거나 아직 준비되지 않은 경우 mock 데이터로 fallback할 수 있습니다.
- 삭제 시 React Query 캐시를 먼저 갱신하고 서버 요청 결과에 따라 이력 목록을 다시 동기화합니다.

### 지도와 인프라 브리핑

- [src/pages/map/MapPage.jsx](./src/pages/map/MapPage.jsx)는 주소 검색, 현재 위치 조회, 카테고리 필터, 상세 카테고리 필터, 지도/목 데이터 fallback을 제공합니다.
- [src/components/map/kakaoLoader.js](./src/components/map/kakaoLoader.js)는 Kakao Maps SDK를 필요 시점에 한 번만 동적으로 로드합니다.
- [src/api/geminiApi.js](./src/api/geminiApi.js)는 Gemini 모델 discovery와 fallback 모델 목록을 사용해 인프라 브리핑을 생성합니다.

## 상태 관리 전략

- 인증/사용자 세션처럼 앱 전체에서 즉시 참조해야 하는 값은 Zustand에 둡니다.
- 서버에서 온 이력, 상세 리포트, 업로드 결과는 React Query로 관리합니다.
- React Query 기본 설정은 [src/queryClient.js](./src/queryClient.js)에 있으며 query `staleTime`은 5분, query retry는 1회, mutation retry는 비활성화되어 있습니다.
- 파일 업로드처럼 사용자가 명시적으로 다시 시도해야 하는 동작은 자동 retry를 끄는 방향으로 구성되어 있습니다.

## 성능 최적화 현황

현재 코드에 이미 적용된 최적화입니다.

- 라우트 단위 lazy loading: 홈 외 주요 페이지는 `React.lazy`와 `Suspense`로 지연 로드합니다.
- 재방문 홈 지연 로드: 분석 이력이 있는 로그인 사용자의 대시보드성 홈도 별도 청크로 분리합니다.
- React Query 캐시: 이력/상세 API 응답을 캐시해 반복 이동 시 네트워크 요청과 렌더 비용을 줄입니다.
- 낙관적 업데이트: 계약서 체크리스트와 알림 추적 토글은 서버 응답 전 UI를 먼저 갱신합니다.
- Kakao SDK 지연 로드: 지도 SDK는 지도 기능에서만 동적으로 삽입합니다.
- 이미지 최적화: `vite-imagetools`를 통해 프로필 이미지가 WebP 산출물로 변환됩니다.
- PDF 관련 라이브러리 분리: `jspdf`, `html2canvas`가 별도 청크로 분리되어 초기 진입 번들 부담을 줄입니다.

2026-07-07 기준 `npm run build` 결과 주요 산출물:

| 청크 | gzip 크기 |
| --- | ---: |
| 메인 `index` | 약 102.96 kB |
| `jspdf` | 약 131.09 kB |
| `html2canvas` | 약 46.78 kB |
| React 관련 청크 | 약 2.87 kB |
| MapPage | 약 16.91 kB |
| TermsPage | 약 14.74 kB |

## 추가 성능 개선 제안

1. PDF 기능 완전 지연 로드
   - 리포트 화면 진입 시점이 아니라 “PDF 저장/업로드” 버튼 클릭 시 `jspdf`와 `html2canvas`를 동적 import하면 초기 상세 페이지 로딩을 더 줄일 수 있습니다.

2. React Query prefetch
   - 마이페이지나 홈의 최근 이력 카드 hover/click 직전에 상세 리포트를 prefetch하면 상세 진입 체감 속도를 개선할 수 있습니다.

3. 큰 페이지 컴포넌트 분리
   - 홈, 지도, 용어 페이지는 코드량이 큰 편입니다. 섹션/패널 단위로 분리하면 유지보수성과 청크 분석이 쉬워집니다.

4. 외부 AI 호출 서버 경유
   - Gemini API 키를 클라이언트에 직접 노출하는 방식은 운영 환경에서 위험합니다. 백엔드 proxy 또는 별도 briefing endpoint를 두는 편이 안전합니다.

5. 테스트 환경 정비
   - `src/pages/terms/__tests__/useTerms.test.js`가 있지만 현재 `package.json`에는 `test` 스크립트, Vitest, Testing Library 의존성이 없습니다. 테스트를 CI에 올리려면 관련 의존성과 script 추가가 필요합니다.

6. 번들 시각화
   - `rollup-plugin-visualizer` 또는 Vite bundle analyzer를 추가하면 큰 청크의 원인을 지속적으로 추적할 수 있습니다.

## 코드 품질/유지보수 메모

- 현재 일부 소스 주석과 README 기존 내용은 인코딩이 깨진 상태였습니다. 사용자 화면에 노출되는 문자열도 일부 파일에서 깨져 보일 수 있으므로 UTF-8 기준으로 정리하는 작업이 필요합니다.
- `Footer` 파일명이 `footer.jsx`로 소문자이고 import도 해당 이름을 사용합니다. OS별 대소문자 처리 차이를 고려하면 컴포넌트 파일명 규칙을 통일하는 것이 좋습니다.
- `MapPage.jsx`에서 `useState`를 `useInfra`로 alias해서 사용합니다. 동작에는 문제 없지만 일반적인 React 코드 관례와 달라 새 기여자가 읽기 어렵습니다.
- API 응답 형태가 `{ data }`, `{ data: { content } }`, 배열 등으로 다양해 normalizer가 여러 곳에 존재합니다. 도메인별 response contract를 문서화하거나 공통 unwrap helper를 정리하면 안정성이 올라갑니다.

## 검증

```bash
npm run build
```

실행 결과: 성공

주의: 현재 테스트 스크립트는 등록되어 있지 않아 자동 테스트는 실행하지 않았습니다.

## 참고 문서

- [React](https://react.dev)
- [Vite](https://vite.dev)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand.docs.pmnd.rs)
- [Sass](https://sass-lang.com)
