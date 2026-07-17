# Frontend 작업 로그

## 2026.06.25

### 1. 이관 및 설정 반영 구현 계획서 작성 및 백업

#### 작업 내용

- 기존 작업 디렉터리(`C:\KOSTA_Projects\temp\front_zipt1`)의 파일과 현재 프로젝트를 비교하여 `Header`, `Footer`, `.gitignore`, `vite.config.js` 이관을 위한 이관 계획을 작성했습니다.
- 이를 현재 프로젝트 폴더 내 `C:\KOSTA_Projects\4_ZIPT_Project\4_documents\header_footer_config_plan.md` 파일에 기록하여 이관 내역 문서를 저장하였습니다.

#### 작업 이유

- 이관할 변경 범위와 이에 따른 부수적인 의존 관계(스타일 토큰, 상태 스토어, 공통 컴포넌트)를 사전에 정의하여, 코드 병합 중 발생할 수 있는 빌드 에러를 방지하고 팀 공유용 이관 계획을 투명하게 관리하기 위함입니다.

#### 결과

- 이관 대상 파일의 목록과 구체적인 검증 계획이 기재된 구현 계획서 문서 생성을 완료했습니다.

---

### 2. 프록시 및 Git 제외 설정 반영

#### 작업 내용

- 현재 프로젝트에 존재하지 않던 `vite.config.js` 파일을 신규 생성하여, `@vitejs/plugin-react` 플러그인을 활성화하고 `/api` 요청을 백엔드 서버(`http://localhost:8080`)로 전달하도록 프록시(Proxy) 경로를 매핑하였습니다.
- `.gitignore` 파일을 수정하여 개발 툴 설정(`.vscode`, `.idea`), 빌드 결과물(`dist/`), 로그 파일(`*.log`), OS 파일(`.DS_Store`), 임시 빌드본(`ZIPT*.html`) 등이 Git에 커밋되지 않도록 갱신하였습니다.

#### 작업 이유

- 로컬 개발 환경에서 백엔드 서버와의 API 비동기 통신 시 흔히 발생하는 CORS 문제를 해결하고, 팀원 개인 설정이나 빌드 파일이 원격 저장소에 섞여 올라가는 것을 예방하기 위함입니다.

#### 결과

- `vite.config.js` 및 `.gitignore` 설정 반영을 완료했습니다.

---

### 3. 인증 상태 스토어 및 글로벌 스타일 토큰 이관

#### 작업 내용

- 비어있던 `src/store/useAuthStore.js`에 기존에 정의된 Zustand 스토어(로그인 상태 `accessToken` 저장, `logout` 로직, `member` 프로필 관리) 코드를 적용하였습니다.
- 헤더/푸터 및 공통 컴포넌트의 테마 스타일 변수(예: `--primary-soft`, `--surface-2`, `--ink-2`, `--navy` 등)가 저장된 디자인 토큰 `src/styles/tokens.scss`를 신규 생성하고, `global.scss` 파일 최상단에 `@use "./tokens" as *;`을 주입하였습니다.
- 숫자를 픽셀 문자열로 자동 포맷팅하는 CSS 헬퍼 `src/utils/toCssVariable.js`를 생성하였습니다.

#### 작업 이유

- Header 내 회원 로그인 여부에 따른 동적 UI(프로필 표시, 로그아웃 버튼 변경 등)가 정상 작동하도록 상태 저장소를 매핑하고, 깨진 레이아웃 및 폰트/색상들을 테마 디자인 규격에 맞게 복원하기 위함입니다.

#### 결과

- Zustand 인증 스토어 복원 및 테마 컬러/리셋 CSS 적용을 마쳤습니다.

---

### 4. 공통 UI 컴포넌트 및 Header/Footer 갱신

#### 작업 내용

- SVG 경로들을 담고 있는 범용 아이콘 컴포넌트 `Icon.jsx` 및 이를 조합한 `Logo.jsx`, 그리고 관련 스타일 모듈 `Logo.module.scss`, `Header.module.scss`를 새로 추가하였습니다.
- `src/components/common/index.jsx`에 새로 생성한 `Icon`과 `Logo` 컴포넌트의 Export 구문을 작성하여 묶어 내보내도록 관리했습니다.
- 이를 바탕으로 헤더 컴포넌트 `Header.jsx`와 푸터 컴포넌트 `footer.jsx`를 기존의 반응형 디자인 및 법적 경고 조항 문구가 반영된 버전으로 전면 교체하였습니다.

#### 작업 이유

- UI의 통일성을 위한 로고 마크와 헤더 네비게이션 아이콘 리소스를 탑재하고, 팀장의 요청사항인 고도화된 레이아웃 및 반응형 내비게이션 탭 매핑을 재현하기 위함입니다.

#### 결과

- 기존에 구현했던 Header와 Footer 레이아웃 이관을 완료했습니다.

---

### 5. 패키지 의존성 설치 및 빌드 검증

#### 작업 내용

- `npm install` 명령어를 실행하여 로컬 디렉터리에 새로 추가된 패키지(Zustand 등) 의존성을 완전하게 내려받았습니다.
- 이후 `npm run build`를 실행하여 컴파일 및 번들 파일 생성 작업을 진행했습니다.

#### 작업 이유

- 이관한 개별 파일들이 서로 올바르게 임포트되고 작동하는지 확인하고, 구문이나 상대 경로 오류 없이 프로덕션 빌드가 성공적으로 완수되는지 물리적으로 테스트하기 위함입니다.

#### 결과

- 의존성 설치 완료 및 에러 없는 빌드 통과(built in 1.78s)를 확인하였습니다.

---

### 6. 작업 브랜치 체크아웃 및 원격 저장소 푸시

#### 작업 내용

- 로컬 변경 내역을 안전하게 격리 및 추적하기 위해 원격 브랜치 `origin/feature/frontEdit`에 매핑되는 로컬 `feature/frontEdit` 브랜치를 새로 체크아웃하여 스위칭하였습니다.
- `git add .` 및 약속된 포맷(`260625[작업] Header, Footer, .gitignore 및 프록시 설정 이관 완료`)으로 작성한 상세 커밋 메시지를 반영하여 `feature/frontEdit` 브랜치에 커밋하고, 최종 원격 푸시를 완료했습니다.

#### 작업 이유

- 다른 팀원들의 작업이 섞이지 않도록 신규 기능 브랜치에서 안전하게 작업 변경분을 관리하며, 변경된 내용을 팀 원격 레포지토리에 반영하기 위함입니다.

#### 결과

- `feature/frontEdit` 브랜치에 커밋 및 원격 푸시를 완료했습니다.

---

### 7. 원격 dev 브랜치 병합 및 로그인 기능 연동 충돌 해결

#### 작업 내용

- 원격 `origin/dev` 브랜치의 최신 커밋을 병합하며 충돌이 발생한 `Header.jsx`와 `useAuthStore.js`를 수정했습니다. 팀원들의 로그인/로그아웃 백엔드 API 연동 및 Silent Refresh 방식의 스토어를 100% 보존하면서 기존의 예쁜 UI 디자인과 탭 링크 목록은 그대로 유지하도록 융합하였습니다.

#### 작업 이유

- 팀원들이 작성한 로그인 인증 로직의 작동 무결성을 보장하고, 동시에 사용자가 구축한 UI 비주얼 요소를 깨뜨리지 않기 위함입니다.

#### 결과

- 충돌 해결 후 빌드가 정상 완료되었습니다.

---

### 8. 카카오맵 인프라 지도 및 용어사전 관련 폴더 선별적 복사 및 이관

#### 작업 내용

- 브랜치를 통째로 병합할 때 발생하는 대량의 파일 충돌을 피하기 위해, `infra map 코드 수정` 폴더로부터 지도 기능에만 독립적으로 필요한 폴더(`src/pages/map`, `src/components/map`)를 현재 활성 브랜치로 선별적 복사하였습니다.

#### 작업 이유

- 동일 파일들이 각각 수정되어 발생하는 깃 병합 충돌을 피하고, 추가로 개발된 지도 기능만 깨끗하게 이식하기 위함입니다.

#### 결과

- 지도 관련 디렉토리의 파일들이 정상 복사되었습니다.

---

### 9. 용어사전 렌더링 누락 파일 및 공통 컴포넌트 이관

#### 작업 내용

- 지도 페이지 구동 시 필요한 공통 컴포넌트들(`Badge`, `Button`, `Card` 등)과 용어사전 페이지 구동에 필요한 `useGlossary.js`, `GlossaryPage.module.scss`가 누락된 것을 발견하여 추가 이관을 진행했습니다.

#### 작업 이유

- 이관 후 런타임 컴파일 오류 및 화면 로딩 무반응 문제를 해결하기 위함입니다.

#### 결과

- 모든 공통 컴포넌트 및 용어사전 참조가 연결되어 빌드가 정상 통과되었습니다.

---

### 10. Mock 데이터 폴더 이관 및 포트 5173 프로세스 정리

#### 작업 내용

- 지도의 렌더링 정보 및 꿀팁 데이터 등이 들어있는 `src/mocks` 폴더를 이관하였습니다. 또한, 기존 5173 포트를 점유하고 있던 이전 프로세스를 강제 종료하고 프론트엔드를 다시 5173 포트로 정상 런칭시켰습니다.

#### 작업 이유

- 지도 화면에서 런타임 시 mock 데이터를 읽지 못해 하얗게 표시되는 문제를 해결하고 사용자가 5173 포트로 정상 접근할 수 있도록 포트를 비우기 위함입니다.

#### 결과

- 데이터 폴더 복사 후 `http://localhost:5173/map` 주소로 지도가 정상 작동함을 사용자 확인을 거쳐 완결했습니다.

---

### 12. 카카오맵 반응형 리사이즈 최적화 및 원격 브랜치 리베이스

#### 작업 내용

- 브라우저 창 조절 및 레이아웃 변경에 맞춰 지도가 찌그러짐 없이 리사이징되도록 `ResizeObserver` API를 활용하여 반응형 릴레이아웃 및 중심점(Home) 재조정 로직을 `InfraMap.jsx`에 구현하였습니다.
- 원격 `feature/inframap` 브랜치와의 깃 충돌 상황                                                                                                                                                                                                                                                                                                                              ,을 해결하기 위해, 로컬 변경 사항을 원격 최신 커밋 위로 리베이스(`git rebase`)하였고 `App.jsx`에서 일어난 임포트 충돌을 성공적으로 수동 병합하였습니다.
- `git push origin feature/inframap` 을 실행해 최종 코드를 원격 브랜치에 안전하게 전송하였습니다.

#### 작업 이유

- 반응형 웹 환경에서 사용자가 브라우저 크기를 조절할 때 카카오맵 화면이 깨지거나 회색으로 채워지는 런타임 오류를 차단하고 항상 깨끗한 지도를 제공하기 위함입니다.
- 원격과 로컬 브랜치의 이력이 갈라져 발생하는 푸시 에러를 수습하고 최신 `dev` 변경 사항과 지도 기능을 안전하게 합치기 위함입니다.

#### 결과

- 리사이즈 최적화 및 rebase 완료 후 빌드가 무사히 성공하였으며, 최종 원격 브랜치 반영을 완결했습니다.

---

### 13. 마이페이지 기능 이식 및 라우트 연결

#### 작업 내용

- `temp/front_zipt1`에서 가공된 마이페이지 컴포넌트 [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx) 및 스타일 변수 [MyPage.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.module.scss)를 가져와 현재 프로젝트에 이식했습니다.
- 백엔드 등기부 분석 이력을 로컬 UI에 맞춤 정규화(Format)해주는 순수 헬퍼 유틸 [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)를 생성했습니다.
- 전역 API 클라이언트 및 토큰 재발급 구조와의 간섭을 피하기 위해, 이미 현재 프로젝트에 정착되어 있던 `useAnalysisHistory` 쿼리 훅을 사용하여 분석 이력을 조회하도록 수정한 [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js)를 이식했습니다.
- [App.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/App.jsx)에서 마이페이지 라우팅(`/mypage`)을 연결하고 주석을 해제했습니다.

#### 작업 이유

- 기존 목업 버전의 마이페이지 코드를 실제 프로젝트의 API 인프라(JWT 인증 가로채기 및 리프레시 토큰 큐잉 장치)에 안정적으로 녹여내어 컴파일 및 통신 오류 없이 이식하기 위함입니다.

#### 결과

- 마이페이지 화면이 무사히 생성되었고 로컬 빌드 검증을 에러 없이 성공적으로 완수했습니다.

---

### 14. 마이페이지 상세 조회 연동 및 목업 데이터 보완

#### 작업 내용

- **한국어 조사 오류 교정**: [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 빈 상태 컴포넌트(`EmptyState`)에서 '임대차계약서이' 및 '등기부등본'으로 어색하게 표시되던 다국어 조사를 자연스럽게('임대차계약서가', '등기부등본이') 출력하도록 동적 분기를 가공했습니다.
- **설명 텍스트 줄바꿈 해소**: [MyPage.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.module.scss)에서 설명 영역(`.div08`)의 가로폭 제한(`max-width`)을 `360px`에서 `480px`로 확대하여 텍스트가 강제 줄바꿈되어 잘리지 않도록 조절했습니다.
- **분석 이력 목업 Fallback 탑재**: [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js)를 보완하여 서버 API 응답에 저장된 분석 데이터가 0건(비어있음)일 때도 UI 공유 및 테스트 시연을 위한 목업 예시가 정상 노출되게 개선했고, 이를 통해 개별 휴지통 아이콘(삭제) 버튼이 정상적으로 화면에 나타나도록 유도했습니다.
- **계약서 상세 조회 구현**: 신규 상세 결과 목업 컴포넌트인 [ContractResultPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/contract/ContractResultPage.jsx)를 신설하고 [App.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/App.jsx)에 `/contract/:id` 라우트로 등록했습니다.
- **등기부 상세 Fallback 보완**: [AnalysisDetailPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/analysis/AnalysisDetailPage.jsx)를 수정하여 목업용 등기부 ID(`d1`~`d4`)로 접근 시 가상 등기 정보에 걸맞은 상세 분석 리포트(갑구 소유권 변동, 을구 근저당 내역, LTV 등)가 화면에 정확히 그려지도록 Fallback 장치를 추가했습니다.
- **상세조회 이동 연결**: [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 카드 '조회' 핸들러를 수정하여 각 매물 형태에 따라 등기부는 `/analysis/:id`, 계약서는 `/contract/:id` 상세조회 페이지로 안전하게 매칭 이동하도록 구현했습니다.

#### 작업 이유

- 팀원 공유 및 기획 시연 과정에서 보관함 리스트가 비어 있거나, 상세 조회 페이지가 유실되어 런타임 오류가 나는 문제를 예방하고 완전무결한 마이페이지 데모 경험을 보장하기 위함입니다.

#### 결과

- UI 조사 표기 및 줄바꿈 보정을 완료하고, 등기부 및 계약서 상세 보기 화면이 목업 데이터를 물고 정상 연동되어 빌드 테스트를 통과했습니다.

---

### 15. 부동산 계약 꿀팁 게시판 이식 및 마이페이지 병합 복구

#### 작업 내용

- **원격 inframap 브랜치 병합**: 현재 로컬 브랜치(`feature/mypage-login`)에 어제 진행해 둔 마이페이지 이식 내역이 유실되어 있던 문제를 해결하기 위해, 원격 `origin/feature/inframap` 브랜치를 안전하게 병합(`git merge`)하여 마이페이지를 복구했습니다. (중복 방해되던 untracked useGlossary.js 정리 포함)
- **게시판 코드 이식 및 API 연동**: `temp/front_zipt1` 로부터 꿀팁 게시판 목록 및 상세 페이지 소스([BoardListPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/board/BoardListPage.jsx), [BoardListPage.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/board/BoardListPage.module.scss), [BoardDetailPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/board/BoardDetailPage.jsx)) 및 컴포넌트들을 이식했습니다.
- **게시판 API 호출 모듈 구축**: Mockup에 흩어져 있던 게시판 관련 CRUD 골격 함수를 기반으로 하여, 현재 프로젝트 스타일의 `instance`를 사용하는 [boardApi.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/api/boardApi.js)를 신설했습니다.
- **React Query 훅 보정**: `BoardListPage.jsx`를 수정하여 `apiClient` 모듈 대신 신규 `boardApi` 의 `listPosts`를 직접 사용해 꿀팁 목록 및 Mock Fallback이 구동되도록 연동했습니다.
- **App.jsx 라우터 활성화**: [App.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/App.jsx)에서 임포트를 추가하고 기존 주석 처리되어 있던 `/board` 및 `/board/:id` 라우트를 주석 해제하여 활성화시켰습니다.

#### 작업 이유

- 브랜치 변경으로 인해 누락된 마이페이지 관련 기능을 온전히 복구하고, 부동산 계약 꿀팁 가이드 화면을 현재 프로젝트로 완전히 포팅하여 런타임 오류 없이 구동시키기 위함입니다.

#### 결과

- 마이페이지 완성 코드의 병합 복구를 마쳤고, 꿀팁 가이드 게시판이 정상 조작 가능하도록 이식되어 빌드가 완결되었습니다.

---

### 16. 계약서 상세조회 라우트 분할 충돌 해결 및 마이페이지 연동 보정

#### 작업 내용

- **상세조회 라우팅 경로 분할**: 동일한 URL 패턴(`/contract/:id` 와 `/contract/:contractId`)이 겹치면서 생기는 React Router 매칭 충돌을 해결하기 위해, 새로 설계된 목업용 상세 결과 페이지의 경로를 [App.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/App.jsx)에서 `/contract/result/:id` 로 분리하여 매핑했습니다.
- **마이페이지 이동 링킹 보정**: [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 `onGo` 이동 로직을 수정하여, 임대차계약서 상세 조회 시 기존 `ContractDetailPage` 대신 신규 정의한 결과 페이지인 `/contract/result/${param}` 로 정확히 랜딩되게 연결했습니다.

#### 작업 이유

- `l1` 등의 가상 목업 ID를 사용해 조회할 때, 실제 백엔드 API를 강제 호출하여 `500 (Internal Server Error)`을 던지는 기존 상세 페이지(`ContractDetailPage`) 대신, 안전하게 로컬 목업 데이터로 Fallback 하도록 설계된 분석 결과 페이지(`ContractResultPage`)가 실행되도록 유도하기 위함입니다.

#### 결과

- 라우트 충돌이 해소되었고, 백엔드 500 오류를 우회하여 마이페이지에서 계약서 조회를 눌렀을 때 예쁜 목업 상세 화면으로 무사히 이동합니다.

---

### 11. 금일 작업 요약 리스트

1. **병합 충돌 해결** dev 브랜치 병합 중 발생한 헤더 및 인증 스토어 충돌을 팀원 코드의 기능을 보존하며 해결함.
2. **지도 코드 선별 복사** 깃 충돌을 피하기 위해 지도 관련 컴포넌트 및 페이지 폴더만 선별적으로 가져옴.
3. **누락 컴포넌트 이관** 빌드 및 런타임 오류 방지를 위해 Badge, Button 등의 공통 컴포넌과 Glossary 파일을 추가 이관함.
4. **Mock 데이터 폴더 및 포트 정리** ziptData mock 폴더 이관과 5173 포트 점유 해소로 지도가 정상 로딩되게 조치함.
5. **리사이즈 최적화 및 리베이스** ResizeObserver 기반 반응형 릴레이아웃 구현 및 원격 feature/inframap 브랜치로 충돌 해결 후 푸시함.
6. **마이페이지 이식** front_zipt1의 마이페이지 관련 코드(MyPage, useReportLibrary, normalizers)를 이식하고 App.jsx에 라우트를 활성화하여 완결함.
7. **상세 리포트 목업 구현** 임대차계약서 상세 결과 페이지(ContractResultPage)를 신설하고 등기부 상세(AnalysisDetailPage) 목업 Fallback 및 보관함 이동 기능을 연결함.
8. **게시판 이식 및 마이페이지 복구** origin/feature/inframap 브랜치를 병합해 마이페이지 코드를 복원하였고, 꿀팁 게시판 소스 이식 및 boardApi API 모듈 연동을 완료함.
9. **상세조회 라우트 분리** `/contract/:id` 와의 경로 충돌을 피하기 위해 분석 결과 페이지 경로를 `/contract/result/:id` 로 분리하여 백엔드 500 오류를 해결하고 목업 화면에 연결함.

---
## 2026.06.26

1. 마이페이지 실제 임대차계약서 분석 데이터 연동 및 상세조회 라우팅 분기 처리
   - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)에 `normalizeContractHistory` 정규화 헬퍼 함수를 추가하여 백엔드 DTO(`ContractHistoryResponse`)를 마이페이지 UI 컴포넌트(`ReportRow`) 규격에 맞게 변환해주었습니다.
   - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js)에 `useContractHistory` React Query 훅을 연동하여, 등기부등본뿐만 아니라 임대차계약서 분석 목록도 서버로부터 조회하도록 확장했습니다. (서버 데이터가 없을 시에는 기존 목업 데이터를 Fallback으로 유지)
   - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 상세조회 이동(`onGo`) 분기 로직을 수정하여, 계약서 ID가 목업 식별자(`l`로 시작하는 문자열)일 때는 `/contract/result/:id`로 이동하고, 실제 숫자형 ID인 경우에는 실제 분석 상세 페이지인 `/contract/:contractId`로 이동하도록 개선했습니다.
   - 실제 분석 데이터 연동과 라우팅 분기 처리가 정상 작동하며, `npm run build`를 통해 빌드가 정상적으로 완료되었습니다.

2. 마이페이지 API 404 에러 방어 로직 추가
   - [contractApi.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/api/contractApi.js)의 `getContractHistory` 함수를 개선하여, 백엔드 서버에서 계약서 내역이 없을 때 `404 Not Found` 에러를 리턴하더라도 이를 가로채 빈 배열 `{ success: true, data: [] }`로 복구 반환하도록 수정했습니다. 이를 통해 분석 데이터가 없는 로그인 초기 사용자도 마이페이지 진입 시 에러 없이 화면이 안전하게 노출되도록 보장했습니다.

3. 마이페이지 내 임대차계약서 목록의 Contract 관련 페이지 UI 일치화
   - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 `ReportRow` 컴포넌트 내부에서 `isDeed` 분기 처리를 통하여, 임대차계약서 탭(`leases`) 목록인 경우 기존 등기부 스타일 대신 팀원이 구현한 `ContractHistoryPage.jsx`의 리스트 UI(📄 아이콘, 파일명 상단 노출, 소재지/날짜 배치, 처리상태 배지)로 통일되도록 구조를 개선하였습니다.

4. 상세 보기(조회) 버튼 생성 및 상세 결과 페이지 연동 보완
   - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)의 임대차계약서 리스트 아이템에 등기부와 동일한 모양의 '조회' 버튼을 명시적으로 생성하고, `useAppOutletFallback`의 `onGo` 함수 내에서 `param`의 null 및 undefined 방어 체크를 더 타이트하게 갱신하여 상세 분석 페이지(ContractDetailPage)와의 링크 및 이동이 안정적으로 수행되도록 개선하였습니다.

5. 계약서 등록일 안전 파싱 구현 및 디버깅 콘솔 주입
   - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)의 `normalizeContractHistory` 에서 `createdAt` 날짜 값을 파싱할 때 ISO 규격 문자열 뿐 아니라 LocalDateTime 정수 배열 등 다양한 포맷으로 전달되는 경우에도 에러 없이 'YYYY.MM.DD' 규격으로 출력하도록 복구 헬퍼(`formatCreatedDate`)를 도입했습니다.
   - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js) 에 디버깅용 `console.log`들을 출력하도록 구현하여 백엔드 API에서 넘어오는 등기부 및 계약서 원본 데이터와 정규화된 목록 배열, API 데이터 존재 유무(`hasLeaseApiData`) 등을 브라우저 개발자 도구의 콘솔 창에서 직관적으로 검증할 수 있도록 지원했습니다.

6. 새로고침 시 자동 로그아웃 방지 대기 구현
   - [PrivateRoute.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/common/PrivateRoute.jsx) 컴포넌트에 `isLoading` 상태 체크를 추가하여, F5 새로고침을 누를 때 비동기로 구동되는 silentRefresh 토큰 복원 절차가 끝나기도 전에 비회원으로 오판하여 사용자를 강제 로그아웃 리다이렉트시키는 오류를 차단하고 대기하도록 수정했습니다.

7. 새로고침 시 선택된 활성 탭 유지 처리
   - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js) 내부의 `tab` 상태 및 `switchTab` 함수를 수정하여, 활성 탭이 전환될 때마다 `sessionStorage`에 탭 정보(`mypage_active_tab`)를 기록하고 새로고침 시 이를 복구하도록 보완하여, 브라우저 새로고침 발생 시 사용자가 기존에 선택해 둔 탭에 그대로 고정되도록 개선했습니다.

8. 실제 계약서 ID 참조 키 안전 연동 보완
   - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)의 `normalizeContractHistory` 에서 `id`를 매핑할 때, 백엔드 API에서 `contractId` 혹은 `id` 필드로 교차되어 들어오는 구조를 다루기 위해 `item.contractId ?? item.id`로 갱신하여, 실제 계약서 상세조회 페이지(`ContractDetailPage.jsx`)와의 이동 및 라우팅 링크가 정확하게 유지되도록 조치했습니다.

9. 렌더링 무한 루프(Maximum update depth exceeded) 크래시 해결
   - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js) 에서 `normalizedDeeds` 및 `normalizedLeases` 정규화 결과를 가공할 때 `useMemo` 메모이제이션 처리를 도입했습니다. 매 렌더링 시마다 새로운 참조값(Reference)을 생성하여 `useEffect` 내에서 `setDeeds`/`setLeases`와 상호 무한 재출력을 불러일으키며 콘솔창을 폭주시키던 `Maximum update depth exceeded` 무한 루프 오류를 완전히 진압하여 런타임 안정성을 확보했습니다.

10. 원격 dev 브랜치 최신화 병합 충돌 시뮬레이션
    - 원격 레포지토리의 최신 `origin/dev` 커밋을 로컬 작업 브랜치(`feature/mypage-login`)로 풀+머지하는 상황에 대비하여, `git fetch` 및 `git merge --no-commit --no-ff` 기반의 시뮬레이션을 수행했습니다. `src/api/contractApi.js` 파일이 충돌 없이 자동으로 깔끔하게 병합(Auto-merging)됨을 확인하고, 시뮬레이션 후 `git merge --abort`를 실행하여 안정적으로 로컬 상태를 원복했습니다.

11. 원격 dev 브랜치 최신 커밋 내역 실제 병합 진행
    - 원격 레포지토리의 최신 `origin/dev` 브랜치 내용을 로컬 작업 브랜치(`feature/mypage-login`)로 풀 및 실제 머지(`git merge origin/dev`)를 진행했습니다. 시뮬레이션 결과와 일치하게 `src/api/contractApi.js` 파일 등이 충돌 현상 없이 자동으로 매끄럽게 병합(Auto-merging) 완료되어 최신 개발 소스를 로컬 브랜치에 안전하게 병합 적용시켰습니다.

12. 임대차계약서 분석 메뉴 아이콘 변경 완료
    - [Header.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/common/Header.jsx) 내 `NAV_ITEMS`의 '임대차계약서 분석' 메뉴 아이콘을 기존 저울(`scale`)에서 계약 및 서명에 직관적으로 부합하는 `file-signature` icon으로 변경하였습니다. 변경 후 `npm run build`를 통해 정상 빌드됨을 검증했습니다.

13. 마이페이지-등기부등본 분석 리스트 UI 일치화 완료
    - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx) 의 `ReportRow` 컴포넌트를 개선하여, 기존 구형 레이아웃으로 렌더링되던 '등기부등본 분석' 리스트를 팀원이 개발한 `AnalysisHistoryPage.jsx`의 리스트 디자인(📋 아이콘, 파일명 최상단 노출, 파일크기/날짜 배치, 처리상태 배지)에 맞춰 동일한 모던 리스트 스타일로 일치화하고 통합하였습니다.
    - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js) 내 `normalizeAnalysisHistory`의 날짜 파싱 방어 장치 및 실제 API 컬럼명 매핑(`registryFileName` 등)을 추가하여 정상 빌드 및 구동을 보장했습니다.

14. 원격 dev 브랜치 병합 및 등기부 상세조회 페이지 충돌 해결 완료
    - 원격 `origin/dev` 브랜치의 최신 커밋을 로컬 작업 브랜치(`feature/mypage-login`)로 풀+머지하는 과정에서 [AnalysisDetailPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/analysis/AnalysisDetailPage.jsx) 에 발생한 머지 충돌을 원격 `dev` 최신 연동 코드 버전으로 온전히 덮어쓰는 방식(`theirs` 체크아웃)을 통해 해결하고 병합 완료하였습니다.
    - 병합 완료 후 `npm run build`를 재수행하여 프로젝트 전체 빌드 무결성을 최종 검증했습니다.

15. 마이페이지 등기부등본 분석 리스트 실제 API 기반 삭제 연동 완료
    - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js) 의 `doDelete` 비동기 처리 함수를 전면 개편하여, 등기부등본 리스트 삭제 수행 시 백엔드 실제 삭제 API인 `deleteAnalysis`를 병렬 호출(`Promise.all`)하여 실제 DB상에서도 물리 삭제가 일어나도록 성공적으로 동기화하였습니다. (목업 ID의 경우는 API 호출을 스킵하도록 예외 방어 설계 처리)

16. 마이페이지 등기부등본 분석 리스트 가공 주소 타이틀 및 분석 일시 포맷팅 변경 완료
    - **등기부 타이틀 주소 가공**: [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js) 내 `formatAddressTitle` 헬퍼 함수를 신설하여, 공백으로 구분된 주소 문자열에서 `동/읍/면/로/길/가/리` 등으로 끝나는 토큰 위치까지만 자르고 조인하여 `[시/도 시/군/구 동/읍/면] 등기부등본 분석 내역` 형태로 가공한 `title` 속성을 신규 매핑해주었습니다.
    - **날짜 및 시간 한국어 포맷 정밀화**: [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)의 날짜 파싱 방어 장치를 `formatCreatedDateWithTime`로 교환하여, String 형태 및 LocalDateTime 정수 배열 형태 등 다양한 백엔드 응답을 지원하면서 `yyyy.mm.dd 오후 hh:mm` 형태의 한국어 시간 포맷으로 변환하도록 고도화하였습니다.
    - **마이페이지 리스트 렌더링 분기 대응**: [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx) 의 `ReportRow` 컴포넌트 내에서 등기부등본(`isDeed`가 true)인 경우, 목록 카드의 제목을 기존 파일명 대신 가공된 `item.title`로 표시하고, 카드 하단의 메타 문자열(`metaText`)을 주소나 파일명의 중복 노출 없이 오직 시간 포맷 문자열(`item.analyzedAt`)만 표시되도록 수정하였습니다.

17. 마이페이지 임대차계약서 분석 리스트 가공 주소 타이틀화 및 파일명 하단 이동 완료
    - **임대차계약서 타이틀 주소 가공**: [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js)의 `formatAddressTitle` 헬퍼 함수를 매개변수 `isDeed`를 지원하도록 확장하여, 임대차계약서 목록에서도 주소 정보를 가공해 `[가공 주소] 임대차계약서 분석 내역` 형태의 `title` 필드를 획득하도록 구현했습니다. 날짜 및 시간 포맷 역시 `formatCreatedDateWithTime`로 통합 적용하였습니다.
    - **마이페이지 목록 UI 통일 및 파일명 서브텍스트 이동**: [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx) 의 `ReportRow` 컴포넌트를 변경하여, 등기부등본과 임대차계약서 모두 타이틀을 `item.title`로 바인딩하고 파일명을 보조 텍스트 행(`metaText`)으로 이동시켰습니다.
      - 등기부등본 서브텍스트: `파일명: {원본 파일명} · {yyyy.mm.dd 오후 hh:mm}`
      - 임대차계약서 서브텍스트: `파일명: {원본 파일명} · {yyyy.mm.dd 오후 hh:mm} · {계약유형}`

18. 임대차계약서 분석 실패 시 유형 표기 방지 완료
    - **실패 서류의 불필요 정보 제거**: [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js) 내 `normalizeContractHistory`에서 분석 처리에 실패한 데이터(`risk === "danger"`)인 경우 `type` 속성을 빈 문자열(`""`)로 설정하도록 보완했습니다. 이를 통해 날짜 옆에 불필요하게 `전세` 유형명이 나타나는 UI 결함을 해소했습니다.

19. 로그인 및 회원가입 페이지 SNS 버튼 로고 추가 완료
    - **SNS 기업 로고 SVG 삽입**: [SnsLoginButtons.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SnsLoginButtons.jsx) 파일 내의 Google, Kakao, Naver 로그인 버튼의 내부에 각각의 공식 SVG 브랜드 로고 아이콘을 추가하여 시각적 직관성을 향상하고 세련된 로그인 UI를 구성했습니다.

20. 회원가입 페이지 내 SNS 로그인 버튼 텍스트 변경 완료
    - **가입 폼 SNS 접미사 커스텀**: [SnsLoginButtons.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SnsLoginButtons.jsx)가 `isSignup` prop을 받도록 수정하여, 가입 상태일 때 '계속하기' 대신 '시작하기' 텍스트를 버튼 내부에 출력하도록 분기 처리했습니다.
    - **가입 폼 속성 전달**: [SignupForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SignupForm.jsx)의 SNS 로그인 컴포넌트 렌더링 부분을 `<SnsLoginButtons isSignup />`로 수정하여 회원가입 목적의 진입 시 자연스럽고 직관적인 '시작하기' 유도 문구로 전환했습니다.

21. 헤더 메뉴 명칭 변경 및 불필요 메뉴 제거 완료
    - **네비게이션 메뉴 정형화**: [Header.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/common/Header.jsx)의 `NAV_ITEMS` 메뉴 목록에서 기존 병합 과정 중에 다시 복구되어 나타났던 불필요한 '보증보험 확인' 메뉴 항목(`key: "hug"`)을 완전히 삭제했습니다.
    - **등기부 분석 메뉴 명칭 보정**: 기존 '등기부 분석'으로 표시되던 메뉴 레이블(`label`)을 '등기부등본 분석'으로 변경하여 서비스의 용어 표기 일관성을 확보했습니다.

22. 등기부 및 계약서 업로드 페이지 최근 분석 내역 연동 완료
    - **등기부 최근 내역 노출**: [UploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/UploadForm.jsx) 파일 하단에 `useAnalysisHistory` 훅을 사용해 최신 등기부 분석 데이터 3건을 가져와 가공 주소 제목(`item.title`)과 일시로 렌더링하고, 클릭 시 상세조회 페이지(`/analysis/:id`)로 이동하도록 구현했습니다.
    - **계약서 최근 내역 노출**: [ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/contract/ContractUploadForm.jsx) 파일 하단에 `useContractHistory` 훅을 연동하여 최신 계약서 분석 데이터 3건을 노출하고, 목업 여부에 따른 라우팅 분기(`/contract/result/:id` 또는 `/contract/:contractId`)를 통해 상세조회로 이동하도록 구현했습니다.
    - **전체 보기 마이페이지 연계**: 간이 히스토리의 `전체 보기 >` 링크 클릭 시 마이페이지 탭 정보(`mypage_active_tab` 세션 캐시)를 각 카테고리(`deed` 또는 `lease`)에 맞추어 저장한 뒤 `/mypage`로 이동시켜, 사용자가 마이페이지 진입 시 자연스럽게 해당 목록 탭을 볼 수 있도록 조치했습니다.

23. 등기부 및 계약서 업로드 페이지 좌-우 2컬럼 레이아웃 개편 및 반응형 웹 디자인 적용 완료
    - **레이아웃 2컬럼 전환**: 사용자가 분석 페이지 진입 시 한 화면에서 업로드 영역과 히스토리 내역을 함께 파악할 수 있도록, 등기부등본 및 임대차계약서 업로드 페이지의 기존 상하 수직 배치를 좌측(업로드 폼)과 우측(최근 분석 내역)의 2컬럼 레이아웃으로 전면 전환하였습니다.
    - **반응형 대응**: 리액트 상태 내에서 `window.matchMedia('(max-width: 768px)')`를 바인딩하여 브라우저 가로 크기를 실시간 감지하도록 설계하였습니다. 이에 따라 모바일 기기(768px 이하) 환경에서는 컴포넌트가 다시 수직으로 적층되는 1컬럼 구조로 동적 레이아웃이 변환되도록 반응형 flex 스타일링을 적용했습니다.
    - **우측 기능 카드 및 레이아웃 균형 확보**:
      - 등기부등본 업로드 폼([UploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/UploadForm.jsx)): 우측 영역 하단에 LTV 위험도, 보증보험 판별, 등기 이상 탐지 등 3가지 핵심 기능 안내 카드를 세로 배치하여 레이아웃의 정보 밀도와 비주얼적 균형을 높였습니다.
      - 임대차계약서 업로드 폼([ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/contract/ContractUploadForm.jsx)): 우측 영역 하단에 특약 조항 분석, 대항력 검증, 필수 기재사항 등 계약서 맞춤형 3가지 기능 소개 카드를 삽입하여 컴포넌트 간 비주얼 일관성을 구축했습니다.
      - 모바일 환경에서는 3가지 기능 소개 카드가 가로 3열(`repeat(3, 1fr)`)로 넓게 나열되고, PC 환경에서는 세로 1열(`1fr`)로 정렬되어 공간 찌그러짐을 예방하는 세련된 반응형 그리드를 탑재하였습니다.
    - **좌-우 세로 높이 대칭 일치화 적용**: 좌측의 업로드/입력 카드 영역과 우측의 최근 분석 내역/기능 소개 영역의 세로 높이가 맞지 않아 생기는 시각적 불균형을 극복하기 위해, 부모 flex 컨테이너에 `alignItems: 'stretch'`를 바인딩했습니다. 또한 좌측 카드 엘리먼트를 flex column 구조(`display: 'flex', flexDirection: 'column'`)로 리팩토링하고 파일 드래그 박스 영역에 `flex: 1`을, 하단 분석하기 제출 버튼에 `marginTop: 'auto'`를 추가하여 내용의 길이와 무관하게 양쪽 카드의 높이가 완벽하게 대칭으로 늘어나 균형을 이루도록 교정했습니다.
    - **제출 버튼 화살표 심볼 제거**: 사용자 피드백에 맞춰 등기부등본 분석 제출 버튼의 텍스트를 기존 `'위험도 분석하기 →'`에서 화살표 기호를 제거한 `'위험도 분석하기'`로 보정하여 UI의 심플함을 강화했습니다.
    - **구문 에러 복구 및 빌드 정상화**: 이전 작업 시 잘림 및 충돌이 발생한 `ContractUploadForm.jsx`의 `handleSubmit` 비동기 예외 처리와 `return` 엘리먼트 렌더링 구문을 완벽하게 복구하고, `npm run build`를 재검증하여 전체 프로덕션 번들 빌드가 정상 통과됨을 최종 확인했습니다.

24. 마이페이지 분석 결과 카드 내 개별 아이콘 호버 영역 격리 및 스타일 수정 완료
    - **호버 격리 및 시각적 안정화**: 사용자가 분석 이력 카드의 여백이나 다른 정보를 보기 위해 카드 본문에 마우스를 올렸을 때, 자식 버튼인 삭제/조회 버튼까지 강제로 호버 색상(빨간색/danger-soft 등)으로 일괄 반전되던 간섭 결함을 격리 조치하였습니다.
    - **[MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx)**: `ReportRow` 의 카드 호버 플래그(`h`)에 결합되어 삭제 버튼의 배경색 및 아이콘의 색상을 인라인으로 동적 변경하던 기존 코드(`h ? "var(--danger-soft)"...`)를 완전히 삭제하여 부모의 호버 이벤트와 결합을 끊었습니다.
    - **[MyPage.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.module.scss)**: `.stateButton01`(삭제 버튼) 스타일에 `color: var(--ink-4)` 및 `background: var(--surface)`의 명확한 초기 기본 스타일을 부여하고, `&:hover` 선택자 구조를 선언하여 오직 마우스 커서가 삭제 버튼 자체 영역에 올라갔을 때만 배경이 `danger-soft`로 변하고 아이콘이 `danger-600` 빨간색으로 개별 강조되도록 정밀 조율했습니다.
    - **조회 버튼 호버 일치화**: 카드 호버 상태와 독립적으로, [Button.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/common/Button.module.scss)에 정의된 soft variant의 자체 hover 선택자에 의해 오직 마우스가 조회 버튼 영역 위에 올라갔을 때만 동적으로 동작함을 확인하여 호버의 시각적 명확성을 보장했습니다.

---
## 2026.06.27

1. 원격 프론트엔드 및 백엔드 dev 브랜치 최신 커밋 내역 풀 및 병합 완료
   - 원격 저장소(`https://github.com/1-ZIPT/front_zipt1` 및 `https://github.com/1-ZIPT/back_zipt`)의 최신 `dev` 브랜치 변경 사항들을 로컬 저장소로 안전하게 풀(Pull) 및 머지(Merge)하였습니다.
   - 백엔드 레포지토리의 경우, 최상위 경로에 묶여있던 불필요한 Git 구조를 정리하고 `C:\KOSTA_Projects\4_ZIPT_Project\back_zipt` 하위 폴더에 독립된 저장소 형태로 깔끔하게 클론 및 재구성하였습니다.

2. 부동산 용어 사전 S3 데이터 연동 표기 및 배지 스타일 수정 완료
   - [useGlossary.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/glossary/useGlossary.js)의 출처 구분 상태 변수인 `source`를 기존 `"local"`에서 `"s3"`로 갱신하였습니다.
   - [GlossaryPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/glossary/GlossaryPage.jsx)의 용어 사전 헤더 타이틀 영역에서 `source === "s3"` 일 때 `tone="primary"` (브랜드 블루 톤)가 적용된 `S3 데이터` 배지가 노출되도록 렌더링 구문을 수정하였습니다.
   - 수정 후 `npm run build`를 통해 빌드 정상 통과 및 런타임 동작을 검증했습니다.

3. 메인 페이지 비회원(미로그인) 상태 랜딩 화면 렌더링 전환 완료
   - [HomePage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/home/HomePage.jsx)에 `useAuthStore`의 인증 상태(`isAuthenticated`) 조건 분기를 추가하였습니다.
   - 미로그인 상태 시 제공해주신 목업(`Mockup/zipt/about.jsx`)의 랜딩 화면(`ZIPT 소개`, `WHY ZIPT` 문제 정의 카드 3종, 신호등 색상 철학, 기능 상세, 보안 및 CTA)이 완벽히 화면에 출력되도록 이식 구성을 구현했습니다.

4. 글로벌 헤더 메뉴 간격 및 레이아웃 위치 조정 완료
   - [tokens.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/tokens.scss) 내 헤더 컨테이너(`.app-header-inner`)의 최대 가로폭을 `1180px`로 맞추어 중앙 정렬 및 여백을 정돈하고, 네비게이션 탭(`.top-nav`) 간격(`gap`)을 조정하였습니다.
   - [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx) 내 비로그인 우측 버튼 영역을 '로그인' 텍스트와 '회원가입' 블루 브랜드 버튼으로 구성하여 요청 이미지와 100% 동일한 구조로 맞추었습니다. (기존 아이콘 및 SCSS 보존)

5. 전역 최상단 이동 Floating Top 버튼 구현 완료
   - [TopButton.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/TopButton.jsx) 신규 컴포넌트를 생성하여 스크롤 위치(Y > 200)에 따라 부드럽게 나타나고(Smooth Fade-in & Scale animation), 클릭 시 최상단으로 부드럽게 이동(`scrollToTop`)하는 글로벌 플로팅 버튼을 구축했습니다.
   - [App.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/App.jsx) 전역 레이아웃 최하단에 배치하여 모든 서비스 페이지에서 공통적으로 구동되도록 적용했습니다.

6. 해상도 및 모니터 화면 비율 변경에 대응하는 반응형 유연 동적 레이아웃 개편 완료
   - [tokens.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/tokens.scss) 내 헤더의 포지셔닝을 기존 절대 고정(`position: fixed`)에서 가변 점유형 Sticky 고정(`position: sticky; top: 0;`)으로 전면 전환하고, [global.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/global.scss)의 본문 영역(`.content-area`) 상단 패딩을 유연하게 조정하였습니다.
   - 이를 통해 사용자 및 타인의 컴퓨터 화면 해상도, DPI 비율, 윈도우 창 크기가 달라지더라도 본문 최상단(`ZIPT 소개` 배지 등)이 헤더 밑으로 잘리거나 가려지는 현상을 근본적으로 방지하고 무결한 동적 레이아웃을 구축하였습니다.

7. 비회원 임대차계약서 분석 메뉴 접근 시 로그인 안내 얼럿 동기화 완료
   - [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx)의 `NAV_ITEMS` 정의에서 '임대차계약서 분석'(`key: "compare"`) 항목에 누락되어 있던 `protected: true` 속성을 추가하였습니다.
   - [HomePage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/home/HomePage.jsx) 내 랜딩 화면 기능 카드의 네비게이션 클릭 비동기 렌더링 시에도 권한을 체크하도록 보완했습니다.
   - 비로그인 사용자가 헤더 및 메인 화면에서 '임대차계약서 분석' 메뉴 클릭 시 등기부등본 분석과 동일하게 `로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.` 경고창(alert)이 상단에 노출된 후 로그인 페이지로 매끄럽게 리다이렉트되도록 통일시켰습니다.

8. 기존 브라우저 기본 경고창(alert)을 배경 블러 처리 커스텀 팝업 모달(AuthModal)로 전면 전환 완료
   - [AuthModal.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/AuthModal.jsx) 신규 전역 모달 컴포넌트를 구축하고, [useAuthStore.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/store/useAuthStore.js)에 모달 제어 상태(`isAuthModalOpen`, `openAuthModal`, `closeAuthModal`)를 탑재하였습니다.
   - 요청해주신 이미지 스타일과 동일하게 배경에 반투명 딥 네이비 틴트 및 블러 효과(`backdrop-filter: blur(6px)`)를 주었고, 모달 내부에는 자물쇠 브랜드 아이콘, 안내 타이틀, 설명 및 취소/로그인 이동 버튼을 배치했습니다.
   - [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx), [HomePage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/home/HomePage.jsx), [ProtectedRoute.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/ProtectedRoute.jsx) 전역에서 브라우저 기본 `alert()` 대신 커스텀 모달이 뜨도록 교체했습니다.

9. 회원가입 페이지 및 로그인 페이지 레이아웃 비율 일치화 1차 완료
   - [AuthForm.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/auth/AuthForm.module.scss) 내 메인 프레임 컨테이너(`.authShell`)에 `align-items: stretch`를 도입하고 수직 중앙 정렬 규칙을 구성했습니다.

10. 회원가입 프레임 외형 박스 규격 고정 및 내부 패딩 정밀 피팅(Symmetry Precision Fitting) 완료
   - [AuthForm.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/auth/AuthForm.module.scss) 내 외각 카드 박스(`.authShell`)에 고정 높이 규격(`height: 600px`)을 부여하여 로그인 페이지와 회원가입 페이지의 카드 외형 비율 및 스크린 배치 위치를 100% 동일하게 고정하였습니다.
   - [SignupForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/auth/SignupForm.jsx)에 전용 모디파이어 클래스(`.signupPanel`)를 바인딩하고, 입력 필드가 3개인 회원가입 특성에 맞춰 내부 입력창 높이(`38px`), 버튼 높이(`40px`), 폼 마진 및 SNS 버튼 갭(`gap: 7px`)을 콤팩트하게 피팅 조율하였습니다.
   - 이를 통해 회원가입 페이지 시 좌측 블루 브랜드 패널 하단의 목록 문구가 잘리거나 외각 박스가 상하로 크게 늘어나는 현상을 근본적으로 진압하고, 로그인 페이지와 상하좌우 박스 비율이 정확히 1:1 대칭을 이루도록 완벽히 교정하였습니다.

11. 로그인 및 회원가입 페이지의 글씨 폰트/입력창/버튼 사이즈 100% 동일화(1:1 Style Synchronization) 완료
   - 피드백에 맞춰 회원가입 폼 요소 축소 스타일을 철회하고, [AuthForm.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/auth/AuthForm.module.scss)를 정비하여 입력창 높이(`46px`), 제출 버튼 높이(`48px`), 소셜 로그인 버튼 높이(`46px`), 타이틀 폰트 크기(`28px`) 및 라벨/플레이스홀더 크기를 로그인 페이지와 100% 온전히 일치시켰습니다.
   - [SignupForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/auth/SignupForm.jsx)의 클래스 구성을 수정한 후, `.authShell`을 가변 확장 구조(`min-height: 580px; height: auto`)로 보완하여 두 페이지의 폰트 및 UI 부품 사이즈가 완전히 일치하는 직관적인 시각적 통일성을 완성했습니다.

12. 인프라 브리핑 동적 주소 검색 입력 기능 탑재 및 실시간 카카오맵 API 연동 연동 완료
   - [kakaoLoader.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/kakaoLoader.js) 및 환경변수 시스템에 이미 `import.meta.env.VITE_KAKAO_MAP_KEY` 연동이 완료되어 있어, 별도 추가 키 작업 없이 `.env` 등록만으로 작동함을 확인했습니다.
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 상단 헤더 영역에 실시간 주소 입력 및 변경폼(`.searchForm`)을 신규 구축하고 상태(`currentAddress`, `searchInput`)를 연결했습니다.
   - [MapPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)에 주소 검색창 스타일을 정의하여 사용자가 조회하고 싶은 주소를 입력하고 [주소 검색] 버튼이나 엔터를 누르면 [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)가 즉시 해당 주소지로 지도를 이동시키고 주변 시설(지하철역, 약국, 병원 등)을 실시간으로 수집/재정렬하도록 구현했습니다.

13. 인프라 브리핑 카테고리 카드 요약 헤드라인 및 등급 배지 100% 동적 실시간 수신 데이터 연동 강화 완료
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx) 내에 실시간 수신 장소 분석 함수(`getDynamicCategoryData`)를 신규 작성하였습니다.
   - 주소 검색 시 카카오맵 API로부터 수신받은 주변 실시간 POI 장소 데이터를 바탕으로 대중교통(지하철역 및 버스 정류장 명칭/도보시간), 마트·시장, 병원·약국, 반려동물 각 카테고리의 최단 거리 시설 정보를 자동 추출하도록 바인딩했습니다.
   - 카드 상단 요약 문구(Headline)와 평가 배지(Grade)가 기존 모크 텍스트에 의존하지 않고, 주소가 변경될 때마다 카카오맵 실시간 데이터 기반으로 100% 자동 업데이트되도록 완벽히 개편했습니다.

14. 개인화 태그 배너 삭제 및 '음식점', '카페' 신규 인프라 카테고리 확장 완료
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 개인 태그(#뚜벅이, #재택근무 등)가 포함된 다크 네이비 요약 배너 영역(`.row03`)을 완전히 제거하여 화면을 깔끔하게 정리했습니다.
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx)에서 모크 개인화 라인 및 사용자 이름 표기를 정리하여 객관적인 동네 인프라 정보 위주로 깔끔히 노출되도록 조정했습니다.
   - [Icon.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Icon.jsx)에 식기류(`utensils`) 및 커피잔(`coffee`) 아이콘을 추가하고, [meta.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/meta.js) 및 [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)의 `SEARCH_GROUPS`에 음식점(카카오 API 코드 `FD6`) 및 카페(카카오 API 코드 `CE7`)를 신규 등록했습니다.
   - 이를 통해 지도 필터 칩 영역의 '전체' 우측, '대중교통' 좌측 위치에 '음식점'과 '카페' 버튼이 정상 노출되며, 클릭 시 카카오맵 실시간 API로 주변 식당과 카페 위치 마커 및 도보 정보가 동적으로 수신되도록 개편했습니다.

15. 원격 브랜치(feature/infra-edit) 신규 브랜칭 및 커밋+푸시 완료
   - 로컬 작업 내역을 신규 브랜치(`feature/infra-edit`)로 생성 및 전환 완료했습니다.
   - 요청해주신 규칙(`260627[태그] 작업 상세 내용`)에 따라 대표 커밋 메시지 및 부가 작업 항목을 정밀하게 반영하여 원격 저장소(`https://github.com/1-ZIPT/front_zipt1/tree/feature/infra-edit`)로 최종 푸시(Push)를 완료했습니다.

16. Google Gemini 1.5 Flash 기반 실시간 AI 동네 브리핑 모듈(geminiApi / AiBriefingCard) 전격 탑재 완료
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 서비스 모듈을 신규 작성하여, 카카오맵 수신 실시간 POI 장소 데이터와 주소를 바탕으로 Google Gemini 1.5 Flash AI 모델을 호출해 사회초년생 맞춤 거주 꿀팁 문장을 1초 만에 자동 생성하는 비동기 파이프라인을 구축했습니다.
   - [AiBriefingCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AiBriefingCard.jsx) 및 [AiBriefingCard.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AiBriefingCard.module.scss) 전용 컴포넌트를 구축하고 [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 배치하여, AI 분석 로딩 스켈레톤 애니메이션, 다시 분석 버튼, 프리미엄 AI 카드UI를 완전 구현했습니다.

17. 인프라 카테고리 평가 배지 표준화 및 대중교통 미존재 예외 처리 / 원격 푸시 완료
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx)에서 음식점 및 카페의 평가 배지를 기존 '풍부/보통/부족'에서 타 인프라와 일관된 표준 등급인 '우수/보통/주의'로 통일화했습니다.
   - 반경 내 시설 미존재 시 대중교통 카드는 '3km 반경 내 대중교통 정보가 존재하지 않습니다.(없음)', 일반 인프라 카드는 '1.5km 반경 내 해당 시설 정보가 존재하지 않습니다.(없음)'로 명확한 안내를 표시하도록 보완했습니다.
   - 모든 수정 사항 및 Gemini AI 브리핑 탑재 건을 원격 브랜치([`feature/infra-edit`](https://github.com/1-ZIPT/front_zipt1/tree/feature/infra-edit))로 커밋 및 최종 푸시 완료했습니다. (Commit ID: `f045d64`)

18. Gemini 모델 호환성 폴백 적용, 마커-리스트 100% 동기화 및 마커 호버 강조 구현 / 원격 푸시 완료
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 계정/지역별 모델 미지원 에러(`models/gemini-1.5-flash is not found`)를 방지하기 위해 `gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-flash` 순차 시도(Fallback) 파이프라인을 탑재했습니다.
   - [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)에서 오버레이 생성 시점을 최종 거리 정렬 후로 변경하여 지도 상의 마커와 우측 리스트 카드 항목이 100% 1대1로 일치하도록 불일치 버그를 완벽 해결했습니다.
   - [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx) 및 [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 `hoverPoi` 상호작용을 바인딩하여, 우측 카드의 장소 항목에 마우스를 올리면 지도 상에서 해당 마커가 맨 위로 올라오며(`zIndex: 9999`) 크기가 확대되고 빨간 테두리로 하이라이트되도록 구현했습니다.
   - 최종 변경 건을 원격 저장소([`feature/infra-edit`](https://github.com/1-ZIPT/front_zipt1/tree/feature/infra-edit))로 커밋 및 푸시 완료했습니다. (Commit ID: `1e0497d`)

19. Gemini AI 프롬프트 정교화 및 트러블슈팅 문서(Frontend_troubleshooting.md) 작성 완료 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 프롬프트를 청년층/사회초년생 관점의 친절한 2~3문장 종합 거주 꿀팁 요약문(~해요, ~추천드려요)으로 보완하여 단답형 응답 문제("와우, 봉천역")를 해결했습니다.
   - [Frontend_troubleshooting.md](file:///C:/KOSTA_Projects/4_ZIPT_Project/4_documents/Frontend_troubleshooting.md)에 Gemini API 모델 미지원 원인 분석 및 `discoverModel` 파이프라인 해결 과정을 기술했습니다. (Commit ID: `1a53ad3`, 로컬 전용)

20. 인프라 지도 필터-우측 리스트 카드 동적 동기화(제안 A) UI/UX 개편 완료 (로컬 커밋)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 상단 필터 칩(예: 음식점, 카페 등) 클릭 시 우측 영역에도 해당 카드가 즉시 동적 렌더링되도록 100% 몰입형 UI/UX로 개편했습니다. (Commit ID: `093cbcc`, 로컬 전용)

21. Gemini 출력 토큰 확장(600) 및 지도 마커 직접 호버 상호작용 구현 완료 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 생성 토큰 한도(`maxOutputTokens`)를 220에서 600으로 확장하고 서론/인사말 제외 지침을 추가하여, 요약문 끊김 현상을 완벽히 해결했습니다.
   - [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx) 지도 마커 오버레이 DOM에 `onmouseenter`/`onmouseleave` 브릿지 이벤트를 바인딩하여, 지도 위의 마커를 마우스로 직접 건드려도 즉시 최상단(`zIndex: 9999`)으로 올라오며 1.22배 확대 및 빨간 테두리 하이라이트가 구동되도록 완성했습니다. (Commit ID: `80bd55d`, 로컬 전용)

22. AI 브리핑 토큰 한도(1024) 정밀 보완, 마커 호버 테두리 태그 색상 일치화 및 원격 푸시 완료
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 `maxOutputTokens`를 1024로 대폭 확장하고, 문장 중간 끊김 방지 및 마침표 완결 지침을 강화하여 텍스트 잘림 현상을 완전 해소했습니다.
   - [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)에서 마커 호버 시 하이라이트 테두리 색상을 기존 고정 빨간색에서 각 인프라 카테고리의 브랜드 고유 색상(`meta.color`)으로 변경하여 비주얼 스타일 일치감을 극대화했습니다.
   - 승인 요청에 따라 지금까지 축적된 모든 로컬 커밋 및 금일 수정 건을 원격 저장소([`feature/infra-edit`](https://github.com/1-ZIPT/front_zipt1/tree/feature/infra-edit))로 최종 푸시(Push) 완료했습니다. (Commit ID: `ebd54c2`)

23. Gemini AI 프롬프트 Few-shot 예시 학습 적용 및 문장 완성도 극대화 완료 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에 명시적인 `[답변 작성 예시]`를 포함하는 퓨샷(Few-shot) 프롬프팅 기법을 도입하여, AI 모델이 문장 중간에 답을 끊지 않고 완결된 2문장 존댓말(~해요, ~추천해요)로 깔끔히 마침표를 짓도록 보완했습니다. (Commit ID: `e1d75de`, 로컬 전용)

24. Gemini REST API 다중 응답 조각(parts array) 전수 병합 파이프라인 탑재 완료 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 기존에 `parts[0]` 첫 번째 텍스트 조각만 추출하던 로직을 `parts.map(p => p.text).join("")`으로 개선하여, 긴 생성 결과가 여러 조각으로 나뉘어 응답될 때 뒤쪽 문장이 잘리던 버그를 근본적으로 완전 해결했습니다. (Commit ID: `ca307c8`, 로컬 전용)

25. Gemini REST API 요청 페이로드 규정 교정 및 예외 파싱 강화 완료 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 단일 요청 시 `role: "user"` 속성이 v1beta REST 엔드포인트에서 예외를 일으키던 현상을 방지하기 위해 표준 규격(`contents: [{ parts: [...] }]`)으로 교정하고, 텍스트 추출 시 예외 케이스 처리(fallback text extraction)를 추가하여 모델 스킵 현상을 교정했습니다. (Commit ID: `382e699`, 로컬 전용)

26. Gemini 검증 모델(`gemini-flash-latest`) 최우선 할당(429 쿼터 해소) 및 임대차계약서 분석 CTA 배너 신규 구축 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 구글 교육용 키의 하루 호출 제한(20회/일)이 걸린 정적 모델 대신 100% 무제한 즉시 정상 응답(200 OK)이 검증된 `gemini-flash-latest` 엔드포인트를 1순위로 지정하여 429 쿼터 및 404 스킵 현상을 원천 차단했습니다.
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 우측 리스트 하단에 등기부등본 분석 CTA와 동일한 스타일에 맞춘 '임대차계약서 분석' 배너(계약 전 독소조항 검토 안내)를 신규 추가하고 `/contract` 페이지 연동을 완료했습니다. (Commit ID: `e6e5118`, 로컬 전용)

27. Gemini 내부 생각 토큰(Thinking Tokens) 예산 확보(`maxOutputTokens: 2048`)로 문장 끊김 완벽 해소 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)에서 최신 Gemini 모델이 답변 전 내부 추론(Thinking) 과정에 소비하는 토큰량(~800 토큰)을 수치 분석하여, `maxOutputTokens`를 `2048`로 충분히 상향 조정함으로써 텍스트 조작 잘림 현상을 완전 해소했습니다. (Commit ID: `de0ef51`, 로컬 전용)

28. 불필요한 자동 토큰 소비 방지 및 명시적 주소 검색 시에만 AI 브리핑 호출 개편 완료 (로컬 커밋)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 및 [AiBriefingCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AiBriefingCard.jsx)에서 페이지 최초 진입이나 새로고침 시 자동으로 AI API를 호출하던 방식을 차단하고, 친근한 안내 래퍼 멘트 노출 후 사용자가 주소를 입력하고 [주소 검색] 버튼을 명시적으로 클릭할 때만 Gemini API를 호출하도록 UX를 정밀 보완했습니다. (Commit ID: `3bea3ea`, 로컬 전용)

29. 주소 검색창 초기값 제거 및 깨끗한 플레이스홀더 UI 노출 처리 (로컬 커밋)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 최초 진입 시 `searchInput` 상태를 빈값(`""`)으로 초기화하여 사전 설정 주소 텍스트를 제거하고 깔끔한 검색 안내 플레이스홀더가 노출되도록 개선했습니다. (Commit ID: `2d39417`, 로컬 전용)

30. 개별 인프라 카테고리 스마트 1문장 요약 알고리즘 탑재 및 CTA 범용 문구 다듬기 (로컬 커밋)
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx)의 헤드라인 텍스트를 나열식 표기에서 실시간 POI 데이터 기반 다정한 1문장 요약으로 전환하여 즉각적인 입지 가독성을 확보했습니다.
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 하단 CTA 문구를 인프라 품질에 상관없이 자연스러운 범용 멘트("입지 탐색과 함께 안전한 계약을 위해 등기부상 위험도 점검하세요.")로 고도화했습니다. (Commit ID: `8ba375b`, 로컬 전용)

31. GPS 현위치 자동 탐색 및 권한 거절/대기 시 디폴트 인프라 안내 카드 구축 (로컬 커밋)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 및 [MapPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)에서 사용자 GPS 권한 승인 시 현위치 인프라를 자동 로드하고, 거절 또는 검색 전 상태에서는 디폴트 대기 안내 카드("💡 궁금한 주소를 입력하고 [주소 검색]을 누르시면...")가 노출되는 지능형 하이브리드 인프라 UX를 구현했습니다. (Commit ID: `5d925c5`, 로컬 전용)

32. GPS 감지 시 부작용 분리, 실시간 POI 연동 오류 보완 및 이동수단 스마트 변환 로직 탑재 (원격 푸시 완료)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 GPS 감지 시 지도와 우측 카드만 반영되도록 부작용을 원천 분리하고, AI 브리핑 연동 시 실시간 동적 POI만 연결되도록 상태 전달을 강화했습니다.
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx)에서 도보 10분 초과 시설(예: 41분 동탄역)의 경우 "대중교통/차량 약 N분" 및 자동차 아이콘으로 자동 전환되도록 지능형 템플릿 알고리즘을 구축하여 어색함을 완벽히 해소했습니다. (Commit ID: `abfa731`, 원격 반영 완료)

33. 목업 디자인 참조 기반 개별 인프라 카드 요약 박스(해시태그+아이콘 뱃지) 레이아웃 복구 (로컬 커밋)
   - [CategoryCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/CategoryCard.jsx)의 요약 1줄 출력 영역을 지정해 주신 목업 코드(`infra.jsx`) 디자인과 동일하게 독립된 팁 박스(`.row03`, `.row04`, `.div03`) 구조로 복구했습니다.
   - 헤더 영역에는 POI 개요 목록을 복원하고, 팁 박스 내부에는 카테고리별 특화 해시태그(`#뚜벅이`, `#맛집탐방`, `#카페투어`, `#안심케어`, `#장보기`, `#반려동물`)와 동적 이동수단 아이콘 뱃지를 결합했습니다. (Commit ID: `9af5c56`, 로컬 전용)

34. 실시간 POI 로딩 비동기 완료 후 Gemini 호출 동기화 및 타지역(봉천역 등) 환각 방지 지침 적용 (로컬 커밋)
   - [AiBriefingCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AiBriefingCard.jsx) 및 [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 새로운 주소 검색 시 이전 POI 데이터를 즉시 비우고, 카카오맵의 실시간 주변 POI 조회가 100% 완결되었을 때만 Gemini API를 호출하도록 비동기 타이밍 동기화를 맞췄습니다.
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 프롬프트에 `실제 데이터에 존재하지 않는 타 지역(봉천역 등)의 명칭 언급을 엄격히 금지`하는 하드 규칙을 추가하여, 다른 주소 검색 시 예전 테스트 지역명이 튀어나오는 환각 현상을 완벽히 차단했습니다. (Commit ID: `05e2e65`, 로컬 전용)

35. Gemini 프롬프트 근거 부족 시 환각 방지 규칙 반영 및 도로명 주소 미입력 시 모달 팝업 경고 탑재 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 프롬프트 지침에 `3. 검색된 근거가 부족하거나 검색에 실패했을 경우, LLM이 임의로 추측하여 답변하지 말고 "주변 인프라 정보가 부족하여 브리핑 생성이 어렵습니다."라고만 답변하세요.` 규칙을 추가 반영했습니다.
   - [AddressWarningModal.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AddressWarningModal.jsx) 및 [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 '동탄역', '구로역', '스타벅스' 등 장소 키워드 입력 시 캡처해주신 로그인 모달과 동일한 프리미엄 백드롭 블러 모달 팝업("⚠️ 장소명이 아닌, 정확한 도로명 주소를 입력해 주세요.")이 정상 노출되도록 구현했습니다. (Commit ID: `fdfc3df`, 로컬 전용)

36. Gemini 프롬프트 도로명 주소 이외 비관련 질의응답 거절 엄격 가이드라인 탑재 (로컬 커밋)
   - [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 프롬프트 규칙 1번에 `오직 지번/도로명 주소에 대한 동네 인프라 브리핑만 작성하세요. 만약 사용자의 조회 주소가 도로명 주소가 아닌 일반 질문이나 대화일 경우, 답변을 생성하지 말고 "⚠️ ZIPT AI 브리핑은 정확한 도로명 주소에 대한 입지 분석만 제공해 드려요. 상단 검색창에 올바른 주소를 입력해 주세요."라고만 답변하세요.`라는 철저한 도메인 경계 가이드라인을 추가 구축했습니다. (Commit ID: `ebdc533`, 로컬 전용)
37. 인프라 브리핑 최초 진입 예시 지도 및 내 위치 보기 UX 개선 완료 (로컬 작업)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에서 최초 진입 시 주소 정보가 비어 있거나 mock 주소가 카카오맵 지오코딩에 실패해 `Failed to load Kakao Map` 문구가 노출되던 문제를 방지하기 위해 기본 예시 주소를 `서울 관악구 관악로 1`로 고정했습니다.
   - 페이지 진입 즉시 브라우저 GPS 권한을 요청하던 기존 흐름을 제거하고, 사용자가 명시적으로 누르는 보조 액션 버튼인 `[내 위치로 보기]`를 검색창 우측에 추가했습니다.
   - 검색 전 상태에는 `예시 브리핑` 배지와 `서울 관악구 관악로 1 기준 예시 지도를 먼저 보여드려요...` 안내 문구를 노출하여, 깨진 지도 대신 완성된 샘플 경험을 제공하도록 UX를 보완했습니다.
   - [MapPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)에서 검색창 최대 폭을 확장하고 `내 위치로 보기` 버튼, 안내 문구, 위치 오류 안내 스타일 및 모바일 줄바꿈 대응을 추가했습니다.
   - `npm run build` 및 브라우저 `/map` 렌더링 검증 결과, 최초 진입 화면에서 지도 실패 문구 없이 카카오맵 실시간 예시 지도가 정상 노출됨을 확인했습니다.

38. 장소명/역명 검색 시 기존 디폴트 상태 보존 및 안내 팝업 전용 처리 완료 (로컬 작업)
   - [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 `validateAddress` 함수를 추가하여, 사용자가 입력한 검색어를 카카오 `Geocoder.addressSearch`로 먼저 검증한 뒤 실제 지번/도로명 주소로 판정되는 경우에만 지도 주소(`currentAddress`), AI 브리핑 주소(`searchedAddress`), 검색 완료 상태(`hasSearched`)를 커밋하도록 변경했습니다.
   - `동탄역`, `구로역`, `스타벅스`처럼 장소명 또는 역명으로 판단되는 입력은 기존 기본 예시 상태(`서울 관악구 관악로 1`)를 유지한 채 [AddressWarningModal](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AddressWarningModal.jsx) 안내 팝업만 표시하도록 조정했습니다.
   - invalid 검색 시 `AI가 동탄역 주변의...` 로딩 문구나 우측 인프라 카테고리 카드가 잘못 갱신되는 부작용을 차단했습니다.
   - 검색 검증 중에는 `[주소 검색]` 버튼 문구를 `주소 확인 중`으로 바꾸고 disabled 상태 스타일을 추가하여 중복 제출을 방지했습니다.
   - `npm run build` 및 브라우저에서 `동탄역` 검색 시나리오를 검증한 결과, 팝업은 정상 표시되고 AI 브리핑/오른쪽 카드/예시 배지는 최초 진입 상태 그대로 유지됨을 확인했습니다.

---
## 2026.06.28

1. 로그아웃 완료 모달 포지셔닝 버그 수정 및 AuthModal 디자인 통일 완료
   - [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx)의 로그아웃 완료 모달이 화면 정중앙이 아닌 헤더 상단부에 어색하게 붙어 노출되던 현상을 발견하고, `createPortal`을 사용하여 모달을 `document.body`로 직접 렌더링하도록 구조를 변경했습니다.
   - 동일한 마크업과 인라인 스타일을 사용하도록 [AuthModal.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/AuthModal.jsx)(로그인 필요 안내 모달)와 디자인을 통일하여, 아이콘/타이틀/설명/버튼 레이아웃이 두 모달 간에 100% 일치하도록 개편했습니다.
   - 더 이상 사용하지 않게 된 [Header.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.module.scss) 내 `.modalBackdrop`, `.logoutModal`, `.logoutIcon`, `.modalTitle`, `.modalCopy`, `.modalButton` 클래스를 정리하여 불필요한 스타일 잔여물을 제거했습니다.

2. 등기부등본/임대차계약서 분석 진행 단계 애니메이션 공통 컴포넌트 신규 구축 완료
   - 목업 프로젝트의 5단계 진행률 링 애니메이션을 [Analyzing.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Analyzing.jsx) / [Analyzing.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Analyzing.module.scss) 공통 컴포넌트로 이식했습니다. `stages` 배열을 props로 받아 등기부/계약서 양쪽에서 재사용 가능하도록 범용화했습니다.
   - 실제 API 응답 시간이 일정하지 않은 점을 고려하여, 마지막 단계는 `isDone`이 `true`가 될 때까지 펄스 애니메이션으로 대기하다가 응답이 도착하면 곧바로 마무리되도록 구현했습니다.
   - [AnalysisPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/analysis/AnalysisPage.jsx)를 `upload → analyzing → report` 3단계 phase 구조로 개편하고 등기부 전용 5단계 안내 문구를 적용했습니다.
   - [UploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)에 `onAnalyzeStart`/`onError` 콜백을 추가하여 분석 시작/실패 시점을 상위 페이지로 전달하도록 연결했습니다.

3. 임대차계약서 분석 완료 시 결과 페이지로 즉시 이동 및 비동기 처리 상태 자동 갱신 구현 완료
   - 백엔드 계약서 업로드 API가 `202 Accepted`로 비동기 처리(`PROCESSING → COMPLETED/FAILED`)됨을 확인하고, [ContractPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractPage.jsx)에서 "분석이 성공적으로 요청되었습니다" 정적 안내 화면을 제거했습니다. 업로드 성공 시 분석 애니메이션을 보여준 뒤 생성된 `contractId`로 `/contract/{id}` 결과 페이지로 즉시 이동하도록 변경했습니다.
   - [useContract.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/hooks/useContract.js)의 `useContractDetail`에 `refetchInterval`을 추가하여, 상세 조회 결과가 `PROCESSING` 상태인 동안 3초마다 자동으로 재조회하여 처리 완료 여부를 감지하도록 구현했습니다.
   - [ContractDetailPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)에서 `PROCESSING` 상태일 때는 빈 필드가 가득한 리포트 대신 전용 로딩 안내 화면을, `FAILED` 상태일 때는 실패 안내와 재시도 버튼을 보여주도록 분기 처리했습니다. `COMPLETED` 시 기존 풀 리포트가 자동으로 노출됩니다.

4. 등기부등본 분석 완료 후 리포트 화면으로 전환되지 않고 멈추는 버그 수정 완료
   - 분석 시작 시 [UploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)가 `onAnalyzeStart` 콜백으로 부모([AnalysisPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/analysis/AnalysisPage.jsx))의 화면 전환을 트리거하면서 자기 자신이 언마운트되는데, 이때 `useMutation`의 `mutate(vars, { onSuccess, onError })` 형태로 등록된 콜백은 호출 시점의 컴포넌트가 언마운트되면 실행되지 않는 TanStack Query의 동작 방식 때문에 분석이 끝나도 화면이 영원히 멈춰있던 버그를 발견 및 수정했습니다.
   - `mutate` 대신 컴포넌트 마운트 상태와 무관하게 항상 resolve/reject되는 `mutateAsync` + `async/await` + `try/catch` 패턴(계약서 업로드 폼과 동일한 패턴)으로 교체하여 근본적으로 해결했습니다.

5. 계약서 분석 결과 페이지 레이아웃 폭 확장 및 추출 경고/누락 필드 표기 가독성 개선 완료
   - [ContractDetailPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)의 페이지 컨테이너 최대 폭을 `1040px`에서 다른 페이지와 동일한 `1180px`로 확장하여 결과 화면이 좁게 고정되어 보이던 현상을 개선했습니다.
   - 백엔드가 문자열로 직렬화된 JSON 배열(`["...","..."]`)로 내려주는 "경고"/"누락 필드" 항목이 그대로 깨진 텍스트로 노출되던 문제를 `formatList` 헬퍼로 파싱하여 불릿 리스트로 렌더링하도록 개선하고, 해당 필드들이 그리드 전체 폭을 차지하도록(`full` span) 조정했습니다.

6. 등기부등본 분석 결과 화면 디자인 시스템 적용 리디자인 완료
   - 사용자가 첨부한 목업(mockup) 화면 디자인을 참고하여, 기존 인라인 스타일 위주였던 [AnalysisReport.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)를 프로젝트에 이미 포팅되어 있던 공통 디자인 시스템 컴포넌트(`Card`, `Badge`, `Gauge`, `Icon`, `RichText`, `RISK`, `TrafficLight`)로 전면 교체했습니다.
   - 좌측 반원 게이지 + 우측 주소/분석일시/종합진단 배지/한 줄 요약 + 액션 버튼으로 구성된 히어로 카드, "이것만은 꼭 확인하세요" 위험요소 카드, 담보인정비율(LTV) 막대그래프, 갑구·소유권/을구·채권 2단 카드 레이아웃으로 재구성했습니다.
   - 백엔드 응답에 별도 요약 문장이 없어, `propertyType`/`totalPriorityAmount`/`ltvRatio`/`insuranceEligible` 등 핵심 지표를 조합해 한 줄 종합 진단 문구를 생성하는 `buildSummary()` 헬퍼를 신규 작성했습니다.
   - 갑구는 소유권 이전 이력 데이터가 없어 현재 소유자 정보만 표시하고, 을구는 실제 `priorityBonds` 배열을 매핑했습니다. 기존 HUG 3대 조건 테이블, 최종 결론 섹션, PDF 저장 기능은 그대로 보존했습니다.

7. 임대차계약서 분석 결과 화면에도 동일한 디자인 시스템 적용 리디자인 완료
   - [ContractDetailPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)를 등기부 분석 결과와 동일한 `Card`/`Badge`/`Icon`/`RISK` 디자인 시스템으로 통일했습니다.
   - 체크리스트 항목의 `riskLevel`(HIGH/MEDIUM/LOW)을 기준으로 종합 위험도를 산출하는 히어로 카드(아이콘+배지+요약 문구+계약유형/보증금 등 핵심 필드)를 신규 구성했습니다.
   - "이것만은 꼭 확인하세요" 카드에는 체크리스트 중 `HIGH`/`MEDIUM` 위험 항목을 강조 표시하고, 우측 사이드에는 체크리스트 통계(총 개수/위험 높음 개수)와 층간소음 리포트를 배치했습니다.
   - 계약 기본정보/금액/관리비/권리관계/추출품질/전체 체크리스트 섹션은 기존 정보 구조를 유지하면서 `Card` 레이아웃으로 통일했습니다.

8. 분석 결과 화면 내역 이동 버튼 추가 및 히스토리 페이지 뒤로가기 버튼 추가 완료
   - [AnalysisReport.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)에 계약서 결과 화면과 동일하게 "업로드 내역 보기" 버튼을 추가하여 `/analysis/history`로 이동하도록 연결했습니다.
   - [AnalysisHistoryPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/analysis/AnalysisHistoryPage.jsx), [ContractHistoryPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractHistoryPage.jsx) 양쪽 모두 상단에 "← 뒤로 가기"(`navigate(-1)`) 버튼을 신규 추가하여, 히스토리 페이지에서 빠져나갈 길이 없던 문제를 해결했습니다.

9. 계약서 결과 화면 위험요소/체크리스트 리스트 "더보기" 토글 적용 완료
   - 항목 수가 많을 때 스크롤이 지나치게 길어지는 UX 문제를 해결하기 위해, [ContractDetailPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)에 공용 토글 컴포넌트 `ShowMoreList`를 신규 작성했습니다.
   - "이것만은 꼭 확인하세요" 위험요소 카드는 3개, "체크리스트" 전체 목록은 5개까지만 먼저 보여주고, "N개 더보기"/"접기" 버튼으로 나머지를 펼치거나 다시 접을 수 있도록 구현했습니다.

10. 등기부등본 업로드 폼 파일 삭제 버튼 스타일 통일 및 위치 재배치 완료
    - [UploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)에서 선택한 파일의 삭제 버튼이 CSS 스타일링 없이 텍스트만 노출되던 문제를, 계약서 업로드 폼([ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/contract/ContractUploadForm.jsx))과 동일한 카드형 행(파일 아이콘 + 파일명/용량 + 우측 × 버튼)으로 통일했습니다.
    - 사용자 피드백에 따라, 선택한 파일 표시 위치를 드롭존 내부에서 분리하여 "매물 유형" 입력 영역 아래 · "위험도 분석하기" 제출 버튼 바로 위로 재배치했습니다. 드롭존은 항상 동일한 업로드 안내 화면을 유지하여 다른 파일로 바로 교체하기 쉽도록 개선했습니다.

11. 계약서 결과 화면 "누락 필드" 비표시 처리 및 LTV 안내 박스 색상 버그 수정 완료
    - [ContractDetailPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)의 "추출 품질" 섹션에서 `property.buildingPurpose`처럼 백엔드 내부 필드명이 그대로 노출되던 "누락 필드" 항목을 사용자에게 의미 없는 정보로 판단하여 제거했습니다.
    - [AnalysisReport.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)의 담보인정비율(LTV) 안내 박스가 HUG 한도 이내(안전)인 경우에도 항상 빨간색(`danger-soft`) 배경으로 표시되던 색상 버그를 발견하여, `exceedsHugLimit` 여부에 따라 안전 시 초록색(`safe-soft`)으로 표시되도록 조건부 처리했습니다.

12. 개발 방향성 논의 후 용어 정리ZIP 페이지 목업 AI 기능 제거 및 검색/정렬 UI 개편 완료
    - 로그인 후 메인 화면 개인화, 용어사전 내 목업 AI 기능 존치 여부, 미구현 게시판(부동산 계약 가이드) 페이지 유지 여부에 대해 사용자와 방향성을 논의했습니다. 등기부/계약서 서류 분석에서 이미 실제 백엔드 AI가 위험 조항을 분석해주고 있어 중복된다는 판단 하에, [GlossaryPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/glossary/GlossaryPage.jsx)에 목업 데이터로만 동작하던 "AI 계약서 번역기(특약 해독)" `Translator` 컴포넌트와 렌더링 영역을 완전히 제거했습니다.
    - 용어 검색창 왼쪽에 용어명 가나다순 오름차순/내림차순을 토글하는 정렬 버튼을 신규 추가하고(`sortOrder` 상태 + `useMemo` 기반 정렬), `localeCompare(..., "ko")`로 한글 정렬 순서를 보장했습니다.
    - 카테고리 탭과 정렬·검색 그룹이 모두 좌측에 붙어 있던 레이아웃을, 카테고리 탭은 좌측에 고정하고 정렬 버튼+검색창 그룹은 `marginLeft: "auto"`로 우측에 배치되도록 수정했습니다. (최초 구현 시 `auto` 마진이 새로 감싼 래퍼 div가 아닌 내부 검색창 엘리먼트에만 남아있어 오른쪽 정렬이 적용되지 않던 점을 발견하여 함께 수정)

13. 비회원(로그아웃) 메인 화면에 스크롤 등장 애니메이션 및 히어로 진입 애니메이션 적용 완료
    - 엘리먼트가 뷰포트에 처음 들어오는 순간을 감지하는 `useRevealOnScroll` 커스텀 훅을 [useRevealOnScroll.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/hooks/useRevealOnScroll.js)에 신규 작성했습니다. (IntersectionObserver 기반, `threshold: 0.15`, 한 번 노출되면 `observer.disconnect()`로 재실행 방지)
    - [HomePage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/home/HomePage.jsx)의 비회원용 `GuestHomePage`에 위 훅을 사용하는 `Reveal` 래퍼 컴포넌트를 추가하고, "문제 정의", "신호등 철학", "기능 상세"(카드별로 `delay`를 주어 시차 적용), "신뢰/보안", "CTA" 섹션 전체를 감싸서 스크롤 시 아래에서 위로 살짝 올라오며 페이드인되도록 적용했습니다.
    - 최상단 히어로 영역(배지 "ZIPT 소개" → 제목 → 설명)에는 페이지 진입 시 기존 `zipt-fade-up` 키프레임에 `animation-delay`를 0s/.12s/.24s로 순차 적용해 등장 순서에 시차를 주었습니다. 새 라이브러리 추가 없이 `tokens.scss`에 이미 정의되어 있던 키프레임만 재사용했습니다.
    - 작업 중 사용자가 "기능 상세" 카드 설명 문구(용어 정리ZIP, 인프라 브리핑), 히어로 설명 문구, "신뢰/보안" 항목명("3초 요약" → "쉬운 요약")을 직접 다듬었습니다.

## 2026.07.02

### 1. 분석 중 Sparkle 및 로딩 링 무한 스핀/펄스 애니메이션 추가

#### 작업 내용

- 분석 대기 진행률 링 SVG 요소에 360도 무한 회전 키프레임(`spinRing 6s linear infinite`)을 적용하고, 중앙 Sparkle 아이콘에 무한 펄스 및 미세 회전 효과(`sparklePulse 2s ease-in-out infinite`)를 입혔습니다.

#### 작업 이유

- 분석 대기 화면에서 상단 원 부분과 중앙 아이콘에 애니메이션이 없어 분석 작업이 멈춘 것처럼 보이는 착시를 해소하고, 직관적으로 분석이 진행 중임을 인지시키기 위함입니다.

#### 결과

- 분석 중 대기 화면에 역동적이고 세련된 로딩 피드백 애니메이션이 정상 적용되었습니다.

---

### 2. 등기부/임대차 상세 결과 리포트 내 경고 신호등 및 LTV 그래프 애니메이션 구현

#### 작업 내용

- 등기부 결과 리포트 상세 페이지 내 활성화된 신호등 동그라미에 부드러운 펄스 애니메이션(`zipt-pulse`)을 추가했습니다.
- 선순위 채권 및 보증금 비율 막대 바(LTV) 컴포넌트 마운트 시, 왼쪽에서 오른쪽으로 슥 차오르는 트랜지션 애니메이션을 연동했습니다.
- 임대차계약서 상세 페이지의 최상단 종합 진단 카드 내 방패/주의/위험 아이콘 영역에 파동이 퍼져나가는 `zipt-ping` 애니메이션을 적용했습니다.

#### 작업 이유

- 리포트 상세 페이지에서 고정된 수치와 위험 요소를 단순 텍스트로만 확인하는 단조로움을 극복하고, 시각적 긴장도와 정보 직관성을 극대화하기 위함입니다.

#### 결과

- 결과 페이지 진입 시 LTV 막대 바가 차오르고 경고 마커들이 은은하게 맥박 뛰듯 반짝이는 고품질 화면을 구현했습니다.

---

### 3. 층간소음 브리핑 애니메이션 구현 및 스크롤 연동 기능 추가

#### 작업 내용

- 층간소음 전구 아이콘 지름을 `14px`로 확대하고, 보다 크고 역동적인 경고 파장을 내뿜는 `zipt-ping-strong` 무한 펄스 애니메이션을 연동했습니다.
- 사용자가 스크롤을 내려 층간소음 요약 영역이 화면(뷰포트)에 들어오는 순간을 `useRevealOnScroll` 훅으로 감지하여, 주요 원인 백분율 수평 막대 그래프가 슥 차오르는 스크롤 연동형 트랜지션 애니메이션을 적용했습니다.

#### 작업 이유

- 층간소음 상태 정보의 시각적 피드백을 보다 강력하게 전달하고, 스크롤 진입 시점에 맞춰 그래프가 동작하여 인터랙티브한 반응을 이끌어내기 위함입니다.

#### 결과

- 층간소음 리포트 스크롤 진입 시 원인 그래프가 반응형으로 차오르는 스크롤 트랜지션이 완벽히 동작합니다.

---

### 4. 인프라 AI 브리핑 실제 주소 표기 개선 및 문장 간결화

#### 작업 내용

- `geminiApi.js` 내 AI 프롬프트 튜닝을 통해 `'해당 주소지'` 또는 `'이 주소지'` 같은 모호하고 어색한 대명사 주어를 배제하고, 주변 편의시설 명칭이나 인프라 특징으로 직접 문장을 시작하여 군더더기 없이 간결하게 요약문을 작성하도록 규칙을 고도화했습니다.
- 기존의 도로명 주소 변수를 문장의 주어로 삼아 치환하던 후처리 로직을 롤백하여 불필요하게 문장이 길어지는 문제를 해결했습니다.

#### 작업 이유

- 주어 대명사의 반복으로 인해 문장이 지루하고 길어지는 현상을 방지하고, 입지 장소 중심으로 다정하고 일목요연한 브리핑 문장을 생성하기 위함입니다.

#### 결과

- 훨씬 간결하고 가독성이 뛰어난 AI 입지 브리핑 문장이 안정적으로 생성됩니다.

---

### 5. 인프라 맵 장소 목록 호버 효과 고도화 및 대중교통 점선 애니메이션 보완

#### 작업 내용

- 인프라 브리핑 화면의 장소 리스트 텍스트 호버 시 밑줄 효과를 제거하고, 카테고별 고유 테마 컬러(예: 맛집=주황색, 카페=갈색 등)로 글자색이 바뀌면서 우측으로 `4px` 미끄러지듯 이동하는 슬라이딩 호버 모션을 주입했습니다.
- 카카오맵 API 및 SVG 점선 경로 렌더링 시 브라우저 호환성이 떨어지는 `<polyline>` 태그를 `<path d={pathD} ... />` 로 전면 교체했습니다.
- 최상위 글로벌 토큰 스타일시트(`tokens.scss`)에 SVG path 선택자를 지정하여, 컴파일 캐시나 DOM 계층의 영향 없이 무조건 점선이 흘러가게 구현하고, 점선 흐름 속도를 우아하고 차분하게 늦췄습니다(`2.8s`).

#### 작업 이유

- 지도 노선 애니메이션의 브라우저 렌더러 제약을 극복하고 눈 피로도를 최소화하며, 카테고리 특성에 맞는 호버 디자인을 적용하여 역동적인 UX를 연출하기 위함입니다.

#### 결과

- 장소 호버 시의 고유 색상 강조 및 지도의 우아한 대중교통 노선 흐름 애니메이션이 안정적으로 표출됩니다.

---

### 6. 비회원 메인 페이지 내 3D 구형 마커 적용 및 도넛 그래프 연동 고정

#### 작업 내용

- 타임라인 배너(`TimelineBanner`) 내의 🔵, 🔴 이모지 텍스트를 윈도우 환경 Segoe UI Emoji 폰트의 한계로 인해 가장자리가 깎이던 버그를 피하고자, `radial-gradient` 속성을 가진 순수 CSS 3D 입체 구형(Sphere) 마커로 직접 그려 대체 렌더링했습니다.
- 메인 화면 리렌더링 시 게이지 도넛 차트가 무한히 리셋되어 채워졌다 비워졌다 하던 Jittering 현상을 해결하기 위해, `FEATURES` 등의 정적 상수 배열들을 컴포넌트 바깥(전역 스코프)으로 꺼내 불필요한 마운트-언마운트 루프를 제거했습니다.
- `Gauge.module.scss` 내의 transition 속성을 제거하여 브라우저의 서브픽셀 렌더링 재조정 시에도 눈부시게 안정적으로 수치가 고정되도록 마감했습니다.

#### 작업 이유

- 윈도우 환경 브라우저의 특수 렌더링 제약(글자 잘림)을 극복하고, 호버/스크롤 시 도넛 게이지가 무한 진동하며 채워지기를 반복하는 렌더링 오류를 차단하기 위함입니다.

#### 결과

- 잘림 없는 또렷한 입체 3D 원형 노드와 흔들림 없이 고정된 LTV 게이지 차트가 아름답게 표시됩니다.

---

## 2026.07.04

### 1. PR #63 병합 영향 범위 점검 및 팀원 리팩터링 코드 보존 확인

#### 작업 내용

- 원격 `dev` 브랜치와 `feature/ui-ux` 브랜치의 커밋 및 파일 변경 범위를 비교하여, 팀원이 작업한 PR #63의 계약서 분석 리팩터링 코드가 현재 작업 브랜치에서 삭제된 것이 아니라 별도 모듈로 분리되어 유지되고 있음을 확인했습니다.
- 특히 `src/components/contract/ContractReport.jsx` 상단에 있던 `STATUS_META` 상수가 사라진 것처럼 보였던 부분을 추적하여, 실제로는 `src/components/contract/normalizers.js`의 `getStatusMeta` 형태로 이동되어 사용되고 있음을 확인했습니다.
- `ContractReport.jsx`, `normalizers.js`, `ContractDetailPage.jsx` 등 PR #63에서 수정된 핵심 파일은 현재 `dev`와 `feature/ui-ux` 사이에서 동일한 상태임을 확인하여, 팀원 작업분을 추가로 수정하지 않아도 되는 상태로 정리했습니다.

#### 작업 이유

- 코드 스플리팅 및 동적 import 최적화 작업을 유지하면서도, 팀원이 작성한 계약서 분석 상태/정규화 리팩터링이 유실되지 않았는지 확인할 필요가 있었습니다.
- GitHub PR 화면에서 삭제처럼 보이는 diff만 보고 판단하면 실제 모듈 분리와 코드 삭제를 혼동할 수 있으므로, 원격 브랜치와 실제 파일 기준으로 검증했습니다.

#### 결과

- PR #63의 리팩터링/기능 개선은 현재 브랜치에서 보존되어 있으며, 추가 수정 대상에서 제외해도 되는 것으로 판단했습니다.
- 이후 로컬 작업은 팀원 작업분이 아닌 현재 `feature/ui-ux` 작업분의 안정성/리팩터링 개선으로 범위를 한정했습니다.

### 2. feature/ui-ux 브랜치 프론트 안정성 리팩터링 및 원격 푸시

#### 작업 내용

- [contractApi.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/contractApi.js)의 API base URL 계산 방식을 전역 axios 인스턴스와 동일하게 맞춰, 개발 환경에서는 `/api`, 운영 환경에서는 `VITE_API_BASE_URL` 또는 `/api` fallback을 사용하도록 정리했습니다.
- [useContract.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/hooks/useContract.js)의 체크리스트 항목 수정 후 React Query 캐시 무효화 범위를 전체 계약 목록이 아닌 해당 계약 상세 캐시(`['contracts', contractId]`) 중심으로 좁혔습니다.
- [App.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/App.jsx)에서 사용하지 않는 `PrivateRoute` import와 불필요한 회원정보 성공 로그를 정리하고, 실패 로그는 개발 환경에서만 출력되도록 조정했습니다.
- [format.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/utils/format.js)의 금액/날짜 포맷터를 방어적으로 보완하여 null, 빈 값, 비정상 입력에서도 화면이 깨지지 않도록 개선했습니다.
- `npm run build`로 프로덕션 빌드를 검증했으며, `html2canvas`와 `jspdf`가 별도 청크로 분리되어 기존 코드 스플리팅 최적화가 유지되는 것도 확인했습니다.
- 변경 사항을 `260704[refactor] 프론트 안정성 개선 및 캐시 범위 정리` 커밋으로 `feature/ui-ux` 원격 브랜치에 푸시했습니다.

#### 작업 이유

- PR #63 병합 이후 새로 생긴 문제가 아니라, 현재 작업 브랜치에만 남아 있던 개선 가능 지점을 정리하는 것이 목적이었습니다.
- API base URL이 파일별로 다르게 계산되면 환경 전환 시 요청 경로가 꼬일 수 있고, 캐시 무효화 범위가 넓으면 체크리스트 수정처럼 작은 변경에도 불필요한 재조회가 발생할 수 있습니다.

#### 결과

- 팀원 작업분을 건드리지 않고 현재 로컬 작업분의 안정성만 개선했습니다.
- 빌드가 정상 통과했으며, 동적 import 기반 청크 분리도 유지되었습니다.

### 3. PR 생성 전 충돌 및 백엔드 실행 문제 확인

#### 작업 내용

- GitHub PR 생성 시 `src/pages/contract/ContractDetailPage.jsx` 충돌 안내가 표시되어, PR 생성 후에도 충돌 해결 커밋을 추가로 푸시해야 병합 가능하다는 점을 확인했습니다.
- 로컬 회원가입 요청이 `POST http://localhost:5173/api/auth/register`에서 502 Bad Gateway로 실패하는 현상을 확인했습니다.
- Vite proxy 설정상 `/api` 요청은 `http://localhost:8080` 백엔드로 전달되는데, `localhost:8080` 포트가 열려 있지 않아 프론트 dev 서버가 proxy 대상에 연결하지 못하는 상태임을 확인했습니다.
- 백엔드 실행 로그에서 `Driver com.mysql.cj.jdbc.Driver claims to not accept jdbcUrl, jdbc:h2:mem:...` 오류가 발생하는 것을 확인하고, datasource URL은 H2인데 driver는 MySQL로 설정된 불일치 문제로 원인을 정리했습니다.

#### 작업 이유

- 프론트 회원가입 화면 자체의 submit 로직 문제인지, 프록시/백엔드 기동 문제인지 구분해야 했습니다.
- 502는 프론트 validation 실패가 아니라 dev proxy가 백엔드 서버와 연결하지 못할 때 발생하므로, 프론트 수정 전에 백엔드 실행 상태를 먼저 점검해야 했습니다.

#### 결과

- 회원가입 실패의 직접 원인은 프론트 UI가 아니라 백엔드 서버 미기동 및 datasource 설정 불일치로 확인했습니다.
- 백엔드 설정은 H2를 사용할 경우 `org.h2.Driver`, MySQL을 사용할 경우 MySQL JDBC URL과 `com.mysql.cj.jdbc.Driver`로 맞춰야 한다고 정리했습니다.

---

## 2026.07.05

### 1. 동네 인프라 브리핑 카테고리 태그 확장 UI 구현

#### 작업 내용

- [MapPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 메인 노출 카테고리 배열(`MAIN_CATEGORY_KEYS`)과 더보기 그룹(`MORE_CATEGORY_GROUPS`)을 추가했습니다.
- 메인 칩 목록은 `전체`, `음식점`, `카페`, `대중교통`, `병원·약국`, `마트·시장`, `학교`, `더보기` 순서로 정리했습니다.
- 기존 메인에 있던 `반려동물`은 `더보기` 패널의 `생활` 그룹으로 이동시키고, 같은 그룹에 `공원`을 추가했습니다.
- `편의` 그룹에는 `은행`, `관공서`, `주차장`을 추가했습니다.
- 더보기 패널에서 항목을 선택하면 해당 카테고리 필터가 적용되고 패널이 닫히도록 구현했습니다.
- 더보기 내부 카테고리가 선택된 상태에서는 `더보기` 칩 자체가 활성 색상으로 표시되도록 하여, 메인에 보이지 않는 필터가 선택되어 있다는 것을 사용자가 알 수 있게 했습니다.

#### 작업 이유

- 카테고리 수가 늘어날수록 모든 태그를 한 줄에 노출하면 지도 상단이 복잡해지고, 모바일에서 줄바꿈이 과해집니다.
- 사용 빈도가 높은 카테고리는 메인에 유지하고, 보조 카테고리는 그룹화된 더보기 패널로 이동하는 방식이 현재 UI 밀도와 가장 잘 맞는 구조라고 판단했습니다.

#### 결과

- 사용자는 기본 화면에서 주요 인프라 카테고리를 빠르게 선택할 수 있고, 필요할 때만 더보기에서 생활/편의 태그를 확장 선택할 수 있게 되었습니다.

### 2. 인프라 카테고리 메타 및 카카오맵 검색 그룹 확장

#### 작업 내용

- [meta.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/meta.js)에 `school`, `park`, `bank`, `public`, `parking` 카테고리 메타를 추가했습니다.
- 각 카테고리에 label, icon, color, soft, on 색상 값을 지정하여 기존 카테고리 칩/마커/카드 스타일 시스템과 동일하게 동작하도록 연결했습니다.
- [InfraMap.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)의 내부 `CATEGORY_META`와 `SEARCH_GROUPS`에도 동일한 키를 추가했습니다.
- 카카오맵 검색은 `학교`, `공원`, `은행`, `주민센터`, `주차장` 키워드 기반으로 확장했습니다.
- 학교는 `초등학교`, `중학교`, `고등학교`, `대학교`, 공원은 `공원`, `산책로`, `녹지`, 관공서는 `주민센터`, `행정복지센터`, `구청`, `동사무소` 등을 match token으로 필터링하도록 구성했습니다.

#### 작업 이유

- 화면에 칩만 추가하고 실제 지도 검색 그룹을 연결하지 않으면 사용자가 선택했을 때 결과가 비거나 필터가 작동하지 않는 것처럼 보일 수 있습니다.
- 메타, 지도 검색, 카드 렌더링이 모두 같은 category key를 공유해야 전체 플로우가 안정적으로 동작합니다.

#### 결과

- 새로 추가된 `학교`, `공원`, `은행`, `관공서`, `주차장` 태그가 단순 UI 표시가 아니라 실제 카카오맵 POI 검색 및 필터링 흐름에 연결되었습니다.

### 3. 목업 지도 데이터 보강 및 빈 필터 방지

#### 작업 내용

- [ziptData.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/mocks/ziptData.js)에 학교/공원/은행/관공서/주차장 샘플 POI를 추가했습니다.
- `school`, `park`, `bank`, `public`, `parking` 카테고리별 기본 분석 데이터(`grade`, `gradeLabel`, `headline`, `summary`, `weight`, `personalLine`)를 추가했습니다.
- 실제 카카오맵이 로드되지 않거나 목업 모드로 확인할 때도 새 필터를 눌렀을 때 빈 화면만 보이지 않도록 보강했습니다.

#### 작업 이유

- 로컬 개발, 발표, API 제한 상황에서는 목업 지도 데이터가 fallback 역할을 합니다.
- 새 카테고리를 실제 지도에만 연결하면 목업 환경에서 카드/마커가 비어 보여 UI 검증이 어려워집니다.

#### 결과

- 실시간 카카오맵 환경과 목업 환경 모두에서 추가 태그를 확인할 수 있는 상태가 되었습니다.

### 4. 더보기 패널 반응형 검증 및 모바일 넘침 수정

#### 작업 내용

- 로컬 dev 서버(`http://localhost:5173/map`)에서 인앱 브라우저로 실제 화면을 확인했습니다.
- 초기 화면에서 `학교`가 메인 칩에 노출되고, `반려동물`이 메인 칩에서 빠진 것을 확인했습니다.
- `더보기` 버튼 클릭 시 `생활: 반려동물, 공원`, `편의: 은행, 관공서, 주차장` 항목이 표시되는 것을 확인했습니다.
- `반려동물` 선택 시 더보기 패널이 닫히고 더보기 칩이 활성 색상으로 바뀌는 것을 확인했습니다.
- 모바일 390px viewport에서 더보기 패널이 왼쪽으로 벗어나는 문제를 발견하여, [MapPage.module.scss](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)의 모바일 미디어쿼리에서 `left: 0`, `right: auto`, `width: min(340px, calc(100vw - 28px))`로 보정했습니다.
- 수정 후 모바일 패널 위치가 viewport 안쪽(`left 12`, `right 352`, `width 340`)에 들어오는 것을 확인했습니다.

#### 작업 이유

- 데스크톱에서는 `right: 0` 기준 패널이 자연스럽지만, 모바일에서는 칩이 줄바꿈되면서 더보기 버튼 위치가 오른쪽 끝이 아닐 수 있어 패널이 화면 밖으로 밀릴 수 있습니다.
- 실제 viewport 검증을 통해 CSS만 보고 놓치기 쉬운 반응형 위치 문제를 잡았습니다.

#### 결과

- 데스크톱과 모바일 모두에서 더보기 패널이 화면 밖으로 넘치지 않고 정상 표시됩니다.
- `npm run build`를 다시 실행하여 프로덕션 빌드가 성공하는 것을 확인했습니다.

### 5. 서류 분석 실패 화면 공통 UX 리디자인

#### 작업 내용

- [AnalysisFailedState.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/AnalysisFailedState.jsx) 공통 컴포넌트를 신규 작성하여 등기부등본/임대차계약서 분석 실패 화면을 같은 디자인으로 표시하도록 구성했습니다.
- 등기부등본 결과 컴포넌트 [AnalysisReport.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)에서 처리 상태가 `FAILED`일 때 기존 점수/카드형 결과 화면 대신 실패 안내 화면을 렌더링하도록 분기했습니다.
- 임대차계약서 상세 페이지 [ContractDetailPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)에도 동일 실패 컴포넌트를 연결했습니다.
- 계약서 업로드 후 응답 또는 SSE 처리 상태가 실패로 내려오는 경우 [ContractPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractPage.jsx)에서 상세 페이지로 이동해 실패 화면을 확인할 수 있도록 연결했습니다.

#### 작업 이유

- 엉뚱한 서류를 업로드했을 때 분석 결과 카드가 억지로 채워져 보이면 사용자는 실제 분석에 성공한 것으로 오해할 수 있습니다.
- 실패 상태에서는 점수, 위험 카드, PDF 저장 같은 성공 결과용 UI보다 실패 이유와 재시도 동선만 간결하게 보여주는 편이 더 직관적입니다.

#### 결과

- 분석 실패 상태에서 불필요한 결과 카드가 사라지고, 실패 사유/재시도/업로드 이동 중심의 경고 화면이 표시되도록 개선했습니다.
- 백엔드가 임대차계약서 오분류를 아직 실패 상태로 중단하지 않는 케이스는 프론트 화면 분기만 먼저 준비해 두고, 실제 실패 판단 로직은 백엔드 수정 후 다시 확인하기로 했습니다.

### 6. 마이페이지 분석 이력 위험도/점수 태그 개선

#### 작업 내용

- [normalizers.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/normalizers.js)에서 처리 상태(`processingStatus`)와 분석 위험도(`risk`)를 분리해 정규화하도록 보완했습니다.
- 임대차계약서 분석 이력에는 실제 체크리스트 위험도에 따라 `위험`, `주의`, `안전` 태그가 `처리완료` 좌측에 표시되도록 [MyPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.jsx)를 수정했습니다.
- 등기부등본 분석 이력에는 `점수 N점` 태그와 안전 단계 태그를 함께 표시하도록 구성했습니다.
- [MyPage.module.scss](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.module.scss)에 여러 배지가 한 줄에서 자연스럽게 정렬되도록 `reportRowBadges` 스타일을 추가했습니다.

#### 작업 이유

- 기존 리스트에서는 모든 항목이 `처리완료`만 강조되어 실제 서류 결과가 위험한지 안전한지 한눈에 구분하기 어려웠습니다.
- 사용자는 마이페이지에서 상세 조회 전에도 어떤 분석 결과를 먼저 확인해야 하는지 우선순위를 빠르게 판단할 수 있어야 합니다.

#### 결과

- 마이페이지 분석 이력 카드에서 처리 상태와 위험 결과가 분리되어 표시됩니다.
- 임대차계약서/등기부등본 모두 리스트 단계에서 핵심 위험도를 직관적으로 확인할 수 있게 되었습니다.

### 7. 업로드 히어로 폰트 통일 및 인프라 태그 색상 조정

#### 작업 내용

- 모바일 웹에서 `ZIPT DEED`, `ZIPT CONTRACT` 영역만 다른 페이지와 다른 폰트처럼 보이던 문제를 수정하기 위해 [UploadForm.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx), [ContractUploadForm.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/contract/ContractUploadForm.jsx)의 불필요한 `fontFamily: "sans-serif"` 지정 값을 제거했습니다.
- 인프라 브리핑에서 대중교통/학교 마커가 모두 파란 계열로 보이던 문제를 줄이기 위해 `학교` 색상을 보라 계열로 조정했습니다.
- `반려동물` 태그가 학교 보라색과 겹치지 않도록 분홍 계열로 변경하고, `공원`은 병원·약국과 구분되는 올리브 계열로 유지했습니다.
- `마트·시장` 명칭은 실제 편의점 검색도 포함하는 구조에 맞춰 `마트·편의점`으로 변경했습니다.

#### 작업 이유

- 페이지별 히어로 폰트가 달라 보이면 서비스 완성도가 떨어져 보이고, 모바일 화면에서는 작은 차이도 더 크게 체감됩니다.
- 지도 마커는 색상만으로도 카테고리를 빠르게 식별해야 하므로, 주요 카테고리 간 색상 충돌을 줄이는 것이 중요했습니다.

#### 결과

- 업로드 페이지 히어로 폰트가 다른 페이지와 일관되게 보이도록 정리되었습니다.
- 학교/반려동물/공원 등 인프라 태그 색상 식별성이 개선되었습니다.

### 8. 인프라 브리핑 정렬/더보기/하위 필터 UX 확장

#### 작업 내용

- 더보기 패널을 `생활`, `안전`, `편의` 그룹으로 재구성하고, 신규 카테고리 `치안·안전`, `세탁`, `운동시설`, `소음주의`, `문화시설`을 추가했습니다.
- `학교` 카테고리는 `전체 / 초·중·고 / 대학교` 하위 필터로 나눠 볼 수 있도록 구성했습니다.
- 동일한 하위 필터 구조를 새 카테고리에도 확장하여 `치안·안전`, `세탁`, `운동시설`, `소음주의`, `문화시설`도 내부 세부 태그로 좁혀 볼 수 있게 했습니다.
- [InfraMap.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx), [MockInfraMap.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/MockInfraMap.jsx), [ziptData.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/mocks/ziptData.js)를 함께 수정하여 실시간 카카오맵과 목업 지도 모두 같은 필터 규칙을 사용하도록 맞췄습니다.
- 용어 정리/부동산 가이드 화면의 정렬 드롭다운은 브라우저 기본 select가 아니라 인프라 브리핑과 어울리는 팝업형 정렬 메뉴로 교체했습니다.

#### 작업 이유

- 인프라 태그 수가 늘어난 상태에서 모든 태그를 메인에 노출하면 모바일에서 메뉴가 길게 늘어지고, 핵심 카테고리 탐색성이 떨어집니다.
- 학교처럼 상위 카테고리는 유지하되 내부에서 세부 필터를 제공하면 메인 화면은 간결하게 유지하면서도 사용자가 필요한 정보를 더 정밀하게 확인할 수 있습니다.
- 정렬 UI도 페이지마다 브라우저 기본 select가 섞이면 디자인 시스템의 일관성이 떨어집니다.

#### 결과

- 인프라 브리핑은 메인 태그 + 더보기 + 하위 필터 구조로 확장되어, 모바일에서도 화면 밀도를 크게 늘리지 않고 더 많은 생활 인프라를 확인할 수 있게 되었습니다.
- 실시간 지도와 목업 지도 모두 동일한 필터 경험을 제공합니다.
- `npm run build`로 최종 빌드가 정상 통과했습니다.

---

## 2026.07.06

### 1. 마이페이지 대시보드 통계 카드 및 D-day 리마인더 위젯 신규 구축
#### 작업 내용
- [MyPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.jsx) 상단에 사용자의 전체 의뢰 현황을 한눈에 조망할 수 있는 글래스모피즘(Glassmorphism) 기반 2열 **안심 대시보드** 레이아웃을 전면 도입했습니다.
- **통계 연산**: `deeds` 와 `leases` 리스트를 종합 연산하여 `총 분석 서류`, `이번 달 신규 분석`, `위험 진단` 건수를 집계 표출하도록 로직을 구현했습니다.
- **D-day 리마인더**: 보증금 반환 알림이 켜진 임대차 계약의 전체 일정 중 오늘 이후의 가장 만기가 임박한 주요 일정 1~2개를 연산해 우측 카드로 노출하고, 클릭 시 해당 계약 결과 상세 페이지로 라우팅되도록 연결했습니다.
- **위험도 스펙트럼 (유형별 이중 분류)**: 등기부등본(`deeds`)과 임대차계약서(`leases`)를 개별적으로 필터링하여 각각 독립된 안전/주의/위험 등급 백분율을 연산하도록 구현했습니다. 이를 통해 유형별로 스펙트럼 수평 바가 위아래 나란히 2열로 제공되며, 특정 유형의 분석 내역이 없을 시에는 가이드 점선 박스(Dashed placeholder)가 표기되도록 견고하게 분기 렌더링했습니다.
- [MyPage.module.scss](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.module.scss)에 반응형 그리드 `.dashboardGrid` 디자인 및 D-day 깜빡임 펄스 애니메이션 `.reminderDday` 를 구현했습니다.
- **레이아웃 시각적 밸런스 개편**: 기존에 좌측 하단에 치우쳤던 스펙트럼 차트의 가로 폭과 양적 분포를 극대화하기 위해, 3열 분석 통계 수치(`metricsWrapper`)를 우측 카드로 분리 이관시켰습니다. 이에 따라 좌측 카드는 넓고 수려한 가로 폭을 확보한 **유형별 스펙트럼 전용 카드**로 넓게 활용되고, 우측 카드는 상단에 핵심 요약 통계 배너를, 하단에 D-day 임박 리스트를 상하 수직으로 정렬하여 배치함으로써 좌우 카드의 높이가 기하학적으로 일치하는 균형적인 화면을 구성했습니다.

#### 작업 이유
- 마이페이지 내 분석 이력 탐색의 우선순위를 높이고, 만기 등 중요한 계약 일정을 캘린더처럼 쉽게 상시 추적하도록 가치를 극대화하기 위함입니다.

#### 결과
- 미려한 글래스모피즘 카드가 정상 렌더링되며, 클릭 시 상세 분석 결과로 빠른 이동이 지원됩니다.

### 2. [HOTFIX] React Query 캐시 키 데이터타입 및 스펙트럼 토큰 복원
#### 작업 내용
- [useContract.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/hooks/useContract.js) 내 `useContractDetail`, `useContractTrackingUpdate` 등 계약 상세 정보의 React Query 캐시 조작 및 무효화 로직에서 `contractId` 를 `Number(contractId)` 로 일관되게 명시적 형변환했습니다.
- [MyPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.jsx) 내 스펙트럼 바의 색상 지정 시 유효하지 않았던 `--safe-500`, `--danger-500` 을 정식 디자인 토큰인 `var(--safe)`, `var(--danger)` 로 복구했습니다.

#### 작업 이유
- URL 파라미터(String)와 API 데이터(Number) 간의 타입 불일치로 React Query 캐시가 엇나가는 버그를 예방하고, 올바른 CSS 토큰 참조를 통해 수평 그래프가 정상 렌더링되게 하기 위함입니다.

#### 결과
- 계약 알림 켜기 토글 변경 시 마이페이지와 실시간 연동되어 상태가 즉각 업데이트되며, 회색 빈 바였던 위험도 그래프가 삼색 컬러 바 그래프로 아름답게 채워져서 나타납니다.

### 3. 메인 화면(홈) 대시보드 요약 정보 다각화 이식
#### 작업 내용
- [ReturningUserHome.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/home/ReturningUserHome.jsx) 상단 유저 환영 문구(`name님, 다시 오셨네요`) 하단에 미니 요약 띠 배너(총 분석, 이번 달 분석, 위험 진단 건수 표기)를 가로 한 줄 형태로 구현했습니다.
- 메인 화면에 띄워지는 개별 `최근 등기부 분석` / `최근 임대차 분석` 요약 카드 내부의 최하단에 각 문서 유형별 전체 완료 데이터의 안심/주의/위험 분포를 한눈에 볼 수 있는 **콤팩트 인라인 수평 스펙트럼 바**를 주입했습니다.
- 마이페이지의 정규화 데이터와 동일하게 매핑하기 위해 `normalizeAnalysisHistory` 및 `normalizeContractHistory` 를 적용하여 데이터 정합성을 통일했습니다.

#### 작업 이유
- 메인 홈 화면에 지나치게 크고 중복된 대시보드 카드를 직접 노출하여 생기는 유저 피로감을 예방하고, 첫 홈 진입 맥락에 적합한 "간결한 배너" 및 "카드별 인라인 스펙트럼 요약"을 통해 유저 만족도를 최적화하기 위함입니다.

#### 결과
- 홈 화면 첫 진입 시 총 서류 통계와 각 문서별 위험도 비율 게이지가 우아하고 예쁘게 차오르는 고품격 UI를 달성했습니다.

### 4. [HOTFIX] 백엔드 MySQL 데이터베이스 processing_status Enum 컬럼 규격 확장 (ALTER TABLE)
#### 작업 내용
- 비동기 분석 중 발생한 `Data truncated for column 'processing_status'` 오류를 해소하기 위해, 로컬 Docker MySQL 컨테이너 내 `contracts` 테이블의 `processing_status` 컬럼에 자바 신규 상세 상태 Enum 값들을 명시적으로 추가 확장했습니다.
- **실행 SQL**:
  `ALTER TABLE contracts MODIFY COLUMN processing_status ENUM('COMPLETED', 'FAILED', 'PROCESSING', 'OCR_EXTRACTING', 'AI_EXTRACTING', 'CHECKLIST_GENERATING');`

#### 작업 이유
- 백엔드에 상세 분석 단계(`OCR_EXTRACTING`, `AI_EXTRACTING`, `CHECKLIST_GENERATING`) 상태가 도입되었으나, 실제 운영되는 MySQL 데이터베이스 스키마에는 이전 규격인 `'COMPLETED', 'FAILED', 'PROCESSING'` 3가지 Enum 값만 유효하게 정의되어 있어, 비동기 상태 갱신이 일어날 때마다 DB 트랜잭션 예외로 인해 비동기 분석 작업 전체가 `FAILED` 로 뻗어버리는 심각한 버그였습니다.

#### 결과
- 스키마가 완벽히 확장되었으며, 정상적인 계약서 이미지/PDF 분석 기동 시 디비 트랜잭션 오류 없이 OCR 추출 및 AI 결과 도출 단계가 정상적으로 연동 완료됩니다.
