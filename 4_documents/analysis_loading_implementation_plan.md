## 2026.06.26

1. 서류 분석 중 로딩 애니메이션 화면 분석 및 이식 방안
   - 목업 프로젝트(`Mockup/front_zipt/frontend`) 내에 구현된 로딩 상태 컴포넌트들의 구조를 파악하고, 추후 실제 프로젝트(`front_zipt`)의 등기부등본 및 임대차계약서 분석 로딩 상태에 시각적 효과를 부여하기 위해 이식 방안을 설계하여 기록해 둡니다.

2. 목업 프로젝트의 로딩 컴포넌트 목록
   - [PageLoading (PageStates.jsx)](file:///C:/KOSTA_Projects/Mockup/front_zipt/frontend/src/shared/components/PageStates.jsx#L5-L13): "불러오는 중이에요..." 라는 텍스트와 함께 표준 회전 스피너를 노출하는 기본 로딩 화면입니다.
   - [Analyzing (AnalysisPage.jsx)](file:///C:/KOSTA_Projects/Mockup/front_zipt/frontend/src/pages/analysis/AnalysisPage.jsx#L98-L143): 서류 스캔 분석을 시뮬레이션하는 고품질 애니메이션 로딩 화면입니다. 96px 크기의 원형 진행률 링(`ProgressRing`) 애니메이션과 5가지 단계(서류 읽기 -> 개인정보 가리기 -> 위험 키워드 탐색 -> 부채 비율 계산 -> 리포트 작성)에 따라 순차적으로 체크 배지(`check`) 및 펄스 효과 아이콘으로 변경되는 인터랙티브 효과를 갖추고 있습니다.

3. 실제 프로젝트로의 단계별 이식 및 연동 방안
   - **1단계 (공통 컴포넌트 추출)**: 목업의 `Analyzing` 컴포넌트 구조를 가져와 실제 프로젝트의 공통 컴포넌트 폴더(`src/components/common/Analyzing.jsx`)로 분리 생성합니다. 등기부 분석과 임대차계약서 분석의 가이드 텍스트가 다르므로 `stages` 리스트 배열을 props로 외부에서 전달받도록 범용적으로 개정합니다.
   - **2단계 (스타일 이식)**: 목업의 `AnalysisPage.module.scss` 내부에 정의된 `.div12`~`.div17` 및 `.stateRow02`, `.stateRow03` 등 관련 스타일 코드와 `@keyframes zipt-pulse` 애니메이션 코드를 실제 프로젝트의 스타일 모듈에 이식합니다.
   - **3단계 (업로드 폼 래핑 및 조건부 렌더링)**: 실제 프로젝트의 등기부 분석 페이지(`AnalysisPage.jsx`) 및 계약서 분석 페이지 (`ContractPage.jsx`)의 최상위 상태에 분석 시작 여부(`isAnalyzing`)를 추가하고, API mutation이 펜딩 상태(`isPending`, `isUploading`)일 때 폼 화면 대신 이식한 `Analyzing` 로딩 화면이 전체 영역에 그려지도록 구현합니다.
