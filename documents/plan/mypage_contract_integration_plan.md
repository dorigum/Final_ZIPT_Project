## 2026.06.26

1. 마이페이지 실제 임대차계약서 분석 데이터 연동 및 상세 라우팅 분기 계획
   - 마이페이지 보관함 내 '임대차계약서 분석' 탭에서 실제 백엔드에 보관된 계약서 분석 데이터를 조회하고, 클릭 시 실제 상세 페이지로 원활하게 연결되도록 개선하는 작업 계획입니다.

2. 세부 수정 범위 목록
   - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js): `normalizeContractHistory` 함수를 추가하여 `ContractHistoryResponse` DTO를 마이페이지 컴포넌트 `ReportRow` 규격에 맞춰 정규화합니다.
   - [useReportLibrary.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/mypage/useReportLibrary.js): `useContractHistory` 훅을 사용해 임대차계약서의 서버 이력을 불러오도록 상태 관리를 추가합니다.
   - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx): 상세 조회로 넘어갈 때 목업 ID(예: `l1`, `l2`)일 경우 목업 페이지(`/contract/result/:id`), 그 외의 실제 계약서 ID(숫자형)일 경우 실제 상세 페이지(`/contract/:contractId`)로 갈 수 있도록 라우팅 분기를 적용합니다.

3. 마이페이지 내 임대차계약서 목록의 Contract 관련 페이지 UI 일치화 계획
   - 마이페이지의 '임대차계약서 분석' 리스트 카드를 기존 등기부 카드 레이아웃 대신, 팀원이 개발한 `ContractHistoryPage.jsx`의 리스트 디자인(📄 아이콘, 파일명 최상단 노출, 소재지/날짜 배치, 처리상태 배지)에 맞추어 조건부 렌더링하도록 `ReportRow` 구조를 수정합니다.

4. 상세 보기(조회) 버튼 생성 및 연동 보완 계획
   - 임대차계약서 목록 행에 등기부와 동일한 직관적인 '조회' 버튼을 명시적으로 생성하고, `onGo` 함수 내에서 `param`의 null/undefined 체크를 보완하여 상세 결과 페이지와의 매끄러운 링킹이 항상 보장되도록 개선합니다.

5. 날짜 포맷 안전 파싱 및 콘솔 디버깅 주입 계획
   - `createdAt` 날짜가 ISO 문자열이나 LocalDateTime 배열 등 다양한 포맷으로 올 때 크래시 없이 'YYYY.MM.DD'로 변환되도록 안전 장치를 구축하고, API 응답 데이터를 콘솔 로그로 출력하여 개발 중 실제 데이터 연동 상태를 쉽게 추적할 수 있도록 지원합니다.

6. 새로고침 시 자동 로그아웃 방지 대기 계획
   - `PrivateRoute.jsx` 컴포넌트 내에 `isLoading` 상태가 `true`인 경우(즉, silentRefresh가 진행 중인 동안) 리다이렉트를 차단하고 로딩이 완료될 때까지 대기하도록 방어 코드를 구현하여 새로고침 시 원치 않는 자동 로그아웃이 차단되도록 방지합니다.

7. 새로고침 시 선택된 탭 고정 계획
   - 마이페이지 활성 탭(`tab`) 정보를 `sessionStorage`에 캐싱하여, 브라우저 새로고침이 일어나더라도 사용자가 보고 있던 탭('등기부등본 분석' 혹은 '임대차계약서 분석')이 리셋되지 않고 그대로 고정되어 복구되도록 구현합니다.

8. 실제 계약서 ID 참조 키 안전 연동 계획
   - 백엔드 DTO 및 리스트 API 응답 스펙 상 계약서 고유 식별자가 `contractId` 혹은 `id` 필드로 교차되어 올 수 있으므로, `normalizeContractHistory` 정규화 시 `item.contractId ?? item.id`를 매핑하여 실제 계약서 상세조회 화면(`ContractDetailPage.jsx`)과의 링킹 무결성을 확보합니다.

9. 렌더링 무한 루프(Maximum update depth exceeded) 해결 계획
   - `useReportLibrary.js`에서 정규화된 목록 배열(`normalizedDeeds`, `normalizedLeases`)을 매번 렌더링마다 새로운 레퍼런스로 재정의하여 `useEffect` 내에서 `setDeeds`/`setLeases`를 계속 유발하던 현상을 해결하기 위해, `useMemo` 메모이제이션을 도입해 렌더링 무한 루프를 해결합니다.

10. 원격 dev 브랜치 병합 충돌 시뮬레이션 계획
    - 원격 `origin/dev` 브랜치의 최신 커밋 내역을 로컬 작업 브랜치(`feature/mypage-login`)로 풀+머지했을 때 발생할 수 있는 충돌 위험성을 파악하기 위해, `git merge --no-commit --no-ff`를 사용해 시뮬레이션을 수행하고 이후 머지 시도를 되돌립니다.

11. 원격 dev 브랜치 로컬 작업 브랜치 병합 계획
    - 원격 최신 `origin/dev` 커밋을 로컬 작업 브랜치(`feature/mypage-login`)로 풀+머지하여, 충돌 없이 로컬 수정 내역들과 안전하게 자동 병합을 실행하고 최신 백엔드 및 타 팀원 개발 내역을 로컬에 완벽하게 반영합니다.

12. 임대차계약서 분석 메뉴 아이콘 변경 계획
    - 헤더 네비게이션 메뉴 중 '임대차계약서 분석'의 아이콘을 기능(계약서 및 필기 서명)의 의미와 어울리도록 기존 저울 아이콘(`scale`)에서 계약서 서명 아이콘(`file-signature`)으로 교체하여 직관성을 높이고 사용자 경험을 향상시킵니다.

13. 마이페이지-등기부등본 분석 리스트 UI 일치화 계획
    - 마이페이지의 '등기부등본 분석' 리스트 카드를 기존 구형 레이아웃 대신, 팀원이 개발한 `AnalysisHistoryPage.jsx`의 리스트 디자인(📋 아이콘, 파일명 최상단 노출, 파일크기/날짜 배치, 처리상태 배지)에 맞추어 `ReportRow` 구조를 계약서 리스트와 동일한 모던 리스트 스타일로 통합 렌더링되도록 수정합니다.

14. 원격 dev 브랜치 병합 및 등기부 상세조회 페이지 충돌 해결 계획
    - 원격 최신 `origin/dev` 브랜치의 수정 내역을 로컬 작업 브랜치(`feature/mypage-login`)로 병합할 때 발생하는 [AnalysisDetailPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/analysis/AnalysisDetailPage.jsx) 충돌을 해결하기 위해, 목업 Fallback 관련 코드를 제외하고 원격 최신 버전 코드를 그대로 덮어써 반영하여 병합을 완결합니다.

15. 마이페이지 등기부등본 분석 리스트 실제 API 기반 삭제 연동 계획
    - 마이페이지의 '등기부등본 분석' 리스트 아이템 우측의 휴지통 버튼을 클릭하거나 다중 선택 삭제를 수행할 때, 화면에서만 지워지는 것이 아닌 실제 백엔드 API인 `deleteAnalysis`를 연동하여 서버 데이터베이스에서도 물리적으로 삭제되도록 연동 설계를 반영합니다.

16. 마이페이지 등기부등본 분석 리스트 가공 주소 타이틀 및 분석 일시 포맷팅 변경 계획
    - 사용자의 요청에 따라 마이페이지 등기부등본 분석 이력 카드의 타이틀을 `[가공된 주소] 등기부등본 분석 내역` 형태로 가공하고, 서브텍스트를 파일명 및 소재지 정보 없이 오직 한국식 날짜/시간(`yyyy.mm.dd 오후 hh:mm`)으로만 표기하도록 변경하는 계획입니다.
    - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js): 주소 문자열에서 `동/읍/면/로/길` 등으로 끝나는 토큰 영역까지만 파싱하여 `[가공 주소] 등기부등본 분석 내역` 형태의 `title` 필드를 생성하는 `formatAddressTitle` 헬퍼 함수를 추가하고, `uploadedAt`/`createdAt`을 한국식 오전/오후 구분이 가미된 시간 포맷 문자열로 변환하는 `formatCreatedDateWithTime`로 교체합니다.
    - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx): 등기부인 경우 타이틀을 `item.title`로 바인딩하고, 서브텍스트(metaText)를 파일명이나 주소 중복 노출 없이 오직 정규화된 날짜와 시간(`item.analyzedAt`)만 렌더링되도록 `ReportRow` 컴포넌트를 분기 처리합니다.

17. 마이페이지 임대차계약서 분석 리스트 가공 주소 타이틀화 및 파일명 하단 이동 계획
    - 등기부등본 분석 리스트와 임대차계약서 분석 리스트의 타이틀 포맷을 주소 중심으로 일치시키고, 파일명은 하단 메타 텍스트(서브텍스트) 영역으로 이동시켜 직관적이고 일관된 UI를 유지하는 계획입니다.
    - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js): `formatAddressTitle`을 등기부/임대차계약서 공통으로 사용할 수 있도록 매개변수(`isDeed`)를 추가하고, `normalizeContractHistory` 정규화 시 임대차계약서 주소(`propertyAddress`) 기반으로 `[가공 주소] 임대차계약서 분석 내역` 포맷의 `title` 필드를 생성하도록 수정합니다. 날짜 포맷 역시 `formatCreatedDateWithTime`을 적용합니다.
    - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx): `ReportRow` 컴포넌트를 수정하여 등기부등본과 임대차계약서 모두 타이틀을 `item.title`로 지정하고, 하단 서브텍스트(`metaText`)에는 파일명(`item.fileName`)과 일시(`item.analyzedAt` 및 계약타입)가 노출되도록 통일합니다.

18. 임대차계약서 분석 실패 시 유형 표기 방지 계획
    - 임대차계약서 분석이 실패(`FAILED` 상태)인 경우, 날짜 옆에 `전세`와 같은 유형 정보가 불필요하게 렌더링되지 않도록 `risk`가 `danger`일 때 `type` 속성을 빈 문자열로 처리하여 사용성 및 UI를 개선하는 계획입니다.
    - [normalizers.js](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/normalizers.js): `normalizeContractHistory` 정규화 시 `risk === "danger"`인 경우에는 `type`을 빈 문자열(`""`)로 설정하도록 보완합니다.

19. 로그인 및 회원가입 페이지 SNS 버튼 로고 추가 계획
    - 로그인 및 회원가입 화면에 배치된 SNS 로그인 버튼의 각 기업 로고(Google, Kakao, Naver)를 SVG 아이콘을 이용해 텍스트 왼쪽에 삽입함으로써 직관성을 높이고 UI를 고급스럽게 다듬는 계획입니다.
    - [SnsLoginButtons.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SnsLoginButtons.jsx): 구글, 카카오, 네이버 로그인 버튼 내부에 각각의 SVG 로고 아이콘을 삽입하여 스타일링을 강화합니다.

20. 회원가입 페이지 내 SNS 로그인 버튼 텍스트 변경 계획
    - 회원가입 페이지에 사용되는 SNS 로그인 버튼의 우측 접미사(suffix) 텍스트가 어색하지 않도록 '계속하기' 대신 '시작하기'로 분기 표기하도록 변경하는 계획입니다.
    - [SnsLoginButtons.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SnsLoginButtons.jsx): `isSignup` prop을 받아 해당 prop이 true일 때 텍스트 접미사를 '시작하기', false일 때(기존 로그인 화면)는 '계속하기'로 분기 적용합니다.
    - [SignupForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/auth/SignupForm.jsx): 회원가입 폼 내부의 `<SnsLoginButtons />` 컴포넌트 호출 시 `isSignup` prop을 명시적으로 전달하도록 수정합니다.

21. 헤더 메뉴 명칭 변경 및 불필요 메뉴 제거 계획
    - 헤더 메뉴의 '등기부 분석'을 '등기부등본 분석'으로 명칭을 명확하게 수정하고, 불필요한 '보증보험 확인' 메뉴 버튼을 제거하여 정형화된 네비게이션을 구성하는 계획입니다.
    - [Header.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/common/Header.jsx): `NAV_ITEMS` 배열에서 `hug` 메뉴 객체를 제거하고 `upload` 메뉴의 레이블을 수정합니다.

22. 등기부 및 계약서 업로드 페이지 최근 분석 내역 연동 계획
    - 사용자가 새로운 분석을 진행하기 전, 과거에 분석했던 최근 내역(최대 3개)을 업로드 폼 하단에 직관적인 카드 형태로 제공하여 조회 접근성을 높이는 계획입니다.
    - [UploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/UploadForm.jsx): `useAnalysisHistory` 훅을 연동하고 정규화된 최신 3건의 내역을 `/analysis/:id` 이동 링크와 함께 렌더링합니다.
    - [ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/contract/ContractUploadForm.jsx): `useContractHistory` 훅을 연동하고 정규화된 최신 3건의 내역을 목업 여부에 따른 라우팅 분기 처리(`/contract/result/:id` 또는 `/contract/:contractId`)와 함께 렌더링합니다.
    - 공통으로 전체 보기 클릭 시 마이페이지 탭 상태 세팅(`sessionStorage.setItem("mypage_active_tab", "deed" | "lease")`) 후 `/mypage`로 이동되게끔 설계합니다.

23. 등기부 및 계약서 업로드 페이지 좌-우 2컬럼 레이아웃 개편 및 반응형 웹 디자인 적용 계획
    - 사용자가 화면을 스크롤하지 않고도 파일 업로드 폼과 최근 분석 내역을 한눈에 볼 수 있도록, 기존 상하 적층 레이아웃을 좌측(업로드 폼)과 우측(최근 분석 내역 및 주요 기능 카드)으로 나누는 2컬럼 레이아웃으로 전면 개편합니다.
    - [UploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/analysis/UploadForm.jsx): 화면 가로폭이 768px 초과일 경우 2컬럼(가로 배치)으로 렌더링하고, 768px 이하(모바일 환경)인 경우 기존 1컬럼(세로 적층) 구조로 자동 스택 전환되도록 `window.matchMedia` 기반 반응형 스타일링을 수립합니다.
    - [ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/components/contract/ContractUploadForm.jsx): 등기부와 동일하게 2컬럼 반응형 레이아웃 구조를 적용하고, 우측 영역에는 최근 분석 내역뿐만 아니라 계약서 전용 주요 3대 핵심 기능 소개 카드를 추가하여 레이아웃의 균형을 맞춥니다.
    - **세로 높이 대칭 일치화**: 좌측 업로드 폼 카드와 우측 분석 내역 카드가 내용물 양에 관계없이 가로 정렬 시 동일한 세로 높이를 가지도록, 부모 컨테이너에 `alignItems: 'stretch'`를 반영하고 좌측 카드 내부를 flex layout 구조로 재설계하며 드래그 앤 드롭 영역 및 업로드 버튼의 공간 마진을 유동적으로 제어합니다.
    - **제출 버튼 기호 제거**: 등기부등본 제출 버튼 내 텍스트의 불필요한 화살표 심볼을 제거하여 텍스트의 가시성과 간결함을 향상합니다.

24. 마이페이지 분석 목록 카드 내 개별 아이콘 호버 격리 계획
    - 사용자가 분석 결과 카드의 빈 영역에 마우스를 올렸을 때 삭제/조회 버튼 등 내부 버튼 색상이 한꺼번에 강제 변경되어 발생하는 시각적 혼선을 줄이기 위해, 호버 로직을 각각의 독립 버튼 영역으로 한정 및 격리합니다.
    - [MyPage.jsx](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.jsx): `ReportRow` 컴포넌트의 카드 호버 상태(`h`)에 결합되어 작동하던 삭제 버튼의 인라인 배경 및 아이콘 색상 바인딩 스타일을 전면 제거합니다.
    - [MyPage.module.scss](file:///c:/KOSTA_Projects/4_Final_Project/front_zipt/src/pages/mypage/MyPage.module.scss): `.stateButton01`(삭제 버튼) 클래스 내에 `:hover` 가상 선택자를 추가하여 마우스 포인터가 오직 해당 아이콘 버튼 영역에 올라갔을 때만 배경이 `danger-soft`로 변하고 색상이 `danger-600`으로 전환되도록 개선합니다.
