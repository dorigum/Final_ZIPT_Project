# Header, Footer, .gitignore, 프록시 설정 반영 계획

기존 작업 파일(`C:\KOSTA_Projects\temp\front_zipt1`)과 현재 프로젝트(`c:\KOSTA_Projects\4_ZIPT_Project\front_zipt`)를 비교하여, 요청하신 **Header, Footer, .gitignore, 프록시(Proxy) 설정** 및 이를 구성하기 위한 핵심 의존 파일(디자인 토큰, 인증 상태 스토어, 공통 컴포넌트)을 이관/반영하는 계획입니다.

## 변경 내용 요약

1. **프록시 설정 (`vite.config.js`)**
   - 현재 프로젝트에 존재하지 않는 `vite.config.js`를 신규 생성하여, `@vitejs/plugin-react` 및 `/api` 요청을 `http://localhost:8080`으로 포워딩하는 프록시 설정을 추가합니다.
2. **`.gitignore` 파일**
   - 현재 `node_modules/`, `.env`만 제외하는 최소 구성에서, IDE 설정(`.vscode`, `.idea`), 빌드 결과물(`dist/`), 로그 파일(`*.log`), OS 파일(`.DS_Store`), 임시 HTML 빌드본 등을 제외하도록 기존 `.gitignore` 내용으로 덮어씁니다.
3. **Zustand 인증 스토어 (`src/store/useAuthStore.js`)**
   - 현재 비어있는 파일을 기존의 Zustand 스토어 코드로 변경하여 Header 등에서 로그인 상태(`accessToken`, `member`) 관리 및 로그아웃 기능이 정상 작동하도록 지원합니다.
4. **디자인 토큰 및 글로벌 CSS (`src/styles`)**
   - Header/Footer 및 공통 UI 컴포넌트가 사용하는 디자인 변수(예: `--primary-soft`, `--surface-2`, `--ink-2`, `--navy` 등)를 적용하기 위해 `tokens.scss`를 생성하고 `global.scss` 상단에 `@use "./tokens" as *;`을 추가합니다.
5. **유틸리티 및 공통 컴포넌트 (`src/utils`, `src/components/common`)**
   - Header 및 Footer가 의존하는 유틸리티 함수 `toCssVariable.js`, 공통 아이콘 컴포넌트 `Icon.jsx`, 로고 컴포넌트 `Logo.jsx`, `Logo.module.scss`, `Header.module.scss` 및 이들을 관리하는 `index.jsx`를 생성합니다.
6. **Header & Footer 컴포넌트 반영**
   - `Header.jsx`와 `footer.jsx`를 기존 작업물(SCSS 모듈 적용, 아이콘 및 로고 활용, 동적 네비게이션 탭 매핑 포함) 버전으로 덮어씁니다.

---

## 상세 파일 변경 제안

### [Vite 설정]
#### [NEW] [vite.config.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/vite.config.js)
- 기존 프로젝트의 `vite.config.js` 내용을 복사하여 프록시 설정 적용.

### [Git 설정]
#### [MODIFY] [.gitignore](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/.gitignore)
- 빌드 결과물, IDE 설정, 로그, 임시 결과물 제외 규칙 추가.

### [상태 관리]
#### [MODIFY] [useAuthStore.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/store/useAuthStore.js)
- 기존 Zustand 인증 스토어 로직 복사.

### [스타일 및 유틸리티]
#### [NEW] [tokens.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/tokens.scss)
- 테마 색상, 폰트, 여백, 그림자 등 CSS 변수 및 리셋 스타일 정의.
#### [MODIFY] [global.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/global.scss)
- 최상단에 `@use "./tokens" as *;` 적용.
#### [NEW] [toCssVariable.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/utils/toCssVariable.js)
- 숫자를 픽셀 단위로 변환해주는 CSS 헬퍼 추가.

### [공통 컴포넌트]
#### [NEW] [Icon.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Icon.jsx)
- SVG 아이콘 모음 컴포넌트 추가.
#### [NEW] [Logo.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Logo.jsx)
- 로고 컴포넌트 추가 (Icon 의존).
#### [NEW] [Logo.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Logo.module.scss)
- 로고 전용 SCSS 모듈 스타일 추가.
#### [NEW] [Header.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.module.scss)
- 헤더 네비게이션 버튼 전용 SCSS 모듈 스타일 추가.
#### [NEW] [index.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/index.jsx)
- 공통 컴포넌트 통합 내보내기(Export) 파일 추가.

### [레이아웃 컴포넌트]
#### [MODIFY] [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx)
- 반응형 탭 메뉴 매핑, 아이콘/로고 결합 및 로그인 프로필 정보 표시가 적용된 기존 헤더 코드로 갱신.
#### [MODIFY] [footer.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/footer.jsx)
- 로고 및 하단 링크 메뉴, 법적 면책 조항 및 copyright가 포함된 기존 푸터 코드로 갱신.

---

## 검증 계획

### 수동 검증
1. 로컬 개발 서버 실행 (`npm run dev`)
2. 브라우저에서 상단 Header 및 하단 Footer의 레이아웃과 디자인 정상 노출 여부 확인.
3. 로그인/로그아웃 버튼 클릭 시 Zustand 스토어 상태 변경 및 UI 분기 확인.
4. 백엔드 API 요청 호출 시 `/api` 프록시 경로 매핑 정상 작동 테스트.
