# 🏠 ZIPT (집+PT) - 전세사기 방지 플랫폼

> **전세사기로부터 임차인을 보호하는 통합 플랫폼**

---

## 📖 프로젝트 소개

**ZIPT**는 전세사기로부터 사용자(임차인)를 보호하는 혁신적인 플랫폼입니다.

등기부등본 분석, 계약서 검토, 지역별 위험도 평가 등 다양한 기능으로 안전한 전세 계약을 지원합니다.

---

## ⭐ 핵심 기능

### 🔍 전세사기 위험 판단
등기부등본의 선순위 담보권, 채권 정보, 실거래가 등을 분석하여 전세사기 위험도 평가

### 📄 임대차계약서 분석
- 계약서 자동 검토
- 최종 계약 전 체크리스트 제공
- 위험 조항 실시간 진단
- 층감소음 분석

### 🗺️ 위험 지도
지역별 전세사기 현황을 한눈에 파악

### 💬 커뮤니티
사용자의 실제 전세 경험과 안전 팁 공유

### 📚 용어사전
전세 계약에 필요한 핵심 용어 설명

---

## 🛠️ 기술 스택

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** Zustand
- **Styling:** SCSS
- **HTTP Client:** Axios

---

## 📁 디렉토리 구조

```
FRONT_ZIPT/
│
├── 📂 node_modules/               ← npm 패키지들
├── 📂 .vscode/                    ← VSCode 설정
│
├── 📁 src/
│   ├── 📂 api/
│   │   ├── instance.js            ← Axios 설정
│   │   ├── authApi.js             ← 로그인/회원가입 API
│   │   ├── analysisApi.js         ← 분석 API
│   │   └── contractApi.js         ← 계약서 API
│   │
│   ├── 📂 components/
│   │   ├── 📂 common/             ← 공통 컴포넌트
│   │   │   ├── Header.jsx          (네비게이션)
│   │   │   ├── Sidebar.jsx         (좌측 메뉴)
│   │   │   ├── Footer.jsx          (하단)
│   │   │   └── PrivateRoute.jsx    (페이지 보호)
│   │   │
│   │   ├── 📂 analysis/           ← 분석 컴포넌트
│   │   │   ├── UploadForm.jsx
│   │   │   └── AnalysisReport.jsx
│   │   │
│   │   ├── 📂 auth/               ← 인증 컴포넌트
│   │   │   ├── LoginForm.jsx
│   │   │   └── SignupForm.jsx
│   │   │
│   │   ├── 📂 contract/           ← 계약서 컴포넌트
│   │   ├── 📂 home/               ← 홈페이지 컴포넌트
│   │   ├── 📂 infra/              ← 기반시설 컴포넌트
│   │   ├── 📂 map/                ← 지도 컴포넌트
│   │   ├── 📂 terms/              ← 용어사전 컴포넌트
│   │   └── 📂 guide/              ← 부동산 계약 가이드 컴포넌트
│   │
│   ├── 📂 hooks/                  ← 커스텀 React Hooks
│   │   ├── useAnalysis.js         ← 분석 데이터 관리
│   │   └── useContract.js         ← 계약서 데이터 관리
│   │
│   ├── 📂 pages/
│   │   ├── 📂 analysis/           ← 분석 페이지
│   │   │   ├── AnalysisPage.jsx
│   │   │   └── AnalysisHistoryPage.jsx
│   │   │
│   │   ├── 📂 auth/               ← 인증 페이지
│   │   │   ├── LoginPage.jsx       (로그인)
│   │   │   └── SignupPage.jsx      (회원가입)
│   │   │
│   │   ├── 📂 contract/           ← 계약서 페이지
│   │   │   ├── ContractPage.jsx
│   │   │   └── ContractHistoryPage.jsx
│   │   │
│   │   ├── 📂 home/               ← 홈 페이지
│   │   │   └── HomePage.jsx        
│   │   │
│   │   ├── 📂 map/                ← 지도 페이지
│   │   │   └── MapPage.jsx
│   │   │
│   │   ├── 📂 terms/              ← 용어사전 페이지
│   │   │   └── TermsPage.jsx
│   │   │
│   │   ├── 📂 guide/              ← 부동산 계약 가이드 페이지
│   │   │   ├── GuidePage.jsx
│   │   │   └── GuideDetailPage.jsx
│   │   │
│   │   └── 📂 mypage/             ← 마이페이지
│   │       └── MyPage.jsx
│   │
│   ├── 📂 store/                  ← Zustand 전역 상태 관리
│   │   ├── useAuthStore.js        ← 로그인 상태
│   │   ├── useAnalysisStore.js    ← 분석 데이터
│   │   └── index.js
│   │
│   ├── 📂 styles/                 ← CSS/SCSS 파일
│   │   ├── global.scss             (전체 레이아웃 CSS)
│   │   ├── Sidebar.module.scss     (사이드바 CSS)
│   │   └── variables.scss          (색상/크기 변수)
│   │
│   ├── 📂 utils/                  ← 유틸리티 함수
│   │   ├── format.js              ← 데이터 포맷팅
│   │   └── jwt.js                 ← JWT 토큰 처리
│   │
│   ├── App.jsx                     (전체 레이아웃 + Routes)
│   ├── main.jsx                    (React 진입점)
│   └── index.html                 ← HTML 진입점
│
├── package.json                   ← 프로젝트 설정
├── package-lock.json              ← 의존성 버전 고정
├── vite.config.js                 ← Vite 빌드 설정
├── .gitignore                     ← Git 무시 파일
└── README.md                      ← 프로젝트 설명
```

---


### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-repo/FRONT_ZIPT.git
cd FRONT_ZIPT

git pull origin main

npm install

npm run dev
```

### 브라우저 확인
```
http://localhost:5173
```
---

## ⚡ 성능 및 안정성 최적화

### 📦 React.lazy & Code Splitting
- 초기 페이지 접속 시 불필요한 번들 다운로드 부하를 막기 위해 모든 라우트 페이지에 `React.lazy()` 동적 지연 임포트를 전면 배치했습니다.
- 메인 JS 번들 리소스의 용량을 **1.2MB ➔ 327kB (약 73.7% 절감)**로 경량화하여 모바일 및 데스크톱 브라우저 환경의 초기 로딩 성능(LCP)을 극대화했습니다.
- 지연 로더 구동 중 화면 레이아웃의 어색함을 완화하기 위해 로딩 스피너 애니메이션이 가미된 `<Suspense>` 예외 처리를 연동했습니다.

### 🛡️ 401 Unauthorized 하방 보안 가드
- 사용자 정보 조회(`getMyInfo`) 시 토큰 만료 또는 예기치 않은 세션 불일치로 `401` 에러 수신 시, Zustand 전역 인증 저장소의 `logoutStore()`를 강제 실행해 비정상 세션 상태를 즉시 클리어하고 비로그인 화면으로 안전하게 복구(Auto Reset)되도록 조치했습니다.

### 🤖 AI 인프라 브리핑 JSON Mode & Fallback
- Gemini API 연동 시 `responseMimeType: "application/json"` 모드를 강제 지정하여 정형화된 JSON 스키마 구조 출력을 유도하고 온도를 `0.2`로 낮춰 답변 안정성을 확보했습니다.
- 프론트엔드에서 수신한 JSON의 파싱 오류 시에도 `try-catch` 안전 장치로 감싸, 에러 발생 시 원본 텍스트를 그대로 노출하여 분석 브리핑 화면이 뻗지 않도록 예외 하방 안정선을 설계했습니다.

---

## 📊 개발 단계(참고용)

### Phase 1: 인증 시스템 
- [ ] Zustand 상태 관리 구현
- [ ] 로그인/회원가입 페이지
- [ ] PrivateRoute 페이지 보호
- [ ] API 연동

### Phase 2: 분석 기능 (각 컴포넌트별로 개발)
- [ ] 전세사기 위험 판단 기능
- [ ] 임대차계약서 분석, 판단 기능
- [ ] 분석 결과 리포트
- [ ] 분석 이력 관리(로그인 후 저장, 다시 보기)

### Phase 3: 추가 기능
- [ ] 백엔드랑 연동해서 TEST 
- [ ] 꿀팁 가이드, 인프라 
- [ ] 지도
- [ ] 마이페이지
      
---

## 📝 개발 문서

- [프론트엔드 작업 로그](docs/frontend-log.md)
- [프론트엔드 트러블슈팅](docs/troubleshooting.md)

---


## 🔗 참고 링크

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [SCSS](https://sass-lang.com)

---

## ❓ install 실패시 아래 사항참고 

**Q: npm install이 실패합니다**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Q: 포트 5173이 이미 사용 중입니다**
```bash
npm run dev -- --port 3000
```

**Q: SCSS 변경사항이 반영되지 않습니다**
```
개발 서버 재시작 (Ctrl+C 후 npm run dev)
```

---

**마지막 업데이트:** 2026-07-02  | Antigravity
**현재 버전:** 1.2
