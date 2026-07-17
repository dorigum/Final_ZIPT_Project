# 정보 공유 게시판 및 카카오맵 API 기능 구현 계획

사용자 요청에 따라 `C:\KOSTA_Projects\4_Final_Project\infra map 코드 수정\front_zipt` 프로젝트에 **정보 공유 게시판**과 **카카오맵 API 연동 기능**을 추가하기 위한 구현 계획입니다. 기존 코드의 손상을 최소화하고, 부득이한 수정 발생 시 검토를 거치는 방향으로 진행합니다.

## User Review Required

> [!IMPORTANT]
> - 기존에 작성된 `BoardListPage.jsx`는 고정 꿀팁 콘텐츠를 렌더링하고 있습니다. 기존의 기획 내용과 코드를 보존하기 위해, 리스트 화면 상단에 탭(예: "부동산 꿀팁" / "자유 게시판")을 두어 기존 콘텐츠와 새로 구현할 게시판 API가 공존하도록 수정할 것을 제안합니다.
> - 카카오맵 기능의 경우, 현재 로컬 검색 API를 이용한 인프라 탐색 기능은 구축되어 있으나 백엔드 연동(`getPropertyMarkers` 등)이 누락되어 있습니다. 저희의 주 작업 범위가 **백엔드 매물 API 연동 및 마킹 추가**가 맞는지 확인을 부탁드립니다.

## Open Questions

> [!WARNING]
> 1. **카카오맵 API**: 현재 로컬 환경에서 카카오맵을 정상 구동하려면 `VITE_KAKAO_MAP_KEY`를 설정할 `.env` 또는 `.env.local` 파일이 필요합니다. 개발 단계에서 사용할 수 있는 카카오맵 API 키가 있으신지, 혹은 Mock 데이터 중심으로 우선 검증을 진행해야 하는지 여쭙고 싶습니다.
> 2. **게시판 상세 기능 범위**: 정보 공유 게시판의 기본 CRUD 외에 이미지 업로드, 댓글(Comment) 작성/조회 기능도 함께 연동할 것인지 세부 범위 조율이 필요합니다.

---

## Proposed Changes

### [게시판 컴포넌트 (Board Component)]

기존에 0바이트로 생성만 되어 있는 컴포넌트들을 구체화하여 게시판의 기본 기능을 완성합니다.

#### [MODIFY] [BoardListPage.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/pages/board/BoardListPage.jsx)
- 기존 부동산 꿀팁(Mock) 영역을 유지하되, `apiClient.board.listPosts()`를 호출해 백엔드 데이터를 가져오는 '정보 공유' 목록 상태를 결합합니다.
- '글쓰기' 버튼을 제공하여 글 작성이 가능하도록 지원합니다.

#### [MODIFY] [BoardDetailPage.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/pages/board/BoardDetailPage.jsx)
- 빈 페이지에 게시글 단건 조회 API(`apiClient.board.getPost(id)`)를 연동하여 글 본문을 상세히 보여줍니다.
- 수정/삭제 버튼을 두어 권한이 있는 경우 해당 기능이 동작하게 연동합니다.

#### [MODIFY] [PostCard.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/components/board/PostCard.jsx)
- 정보 공유 목록에서 개별 게시글을 깔끔하게 표현할 카드 컴포넌트를 설계 및 구현합니다.

#### [MODIFY] [PostForm.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/components/board/PostForm.jsx)
- 글쓰기 및 글 수정 시 공용으로 사용할 입력 폼 컴포넌트(제목, 카테고리, 내용 입력 필드 등)를 구현합니다.

---

### [카카오맵 컴포넌트 (Map Component)]

#### [MODIFY] [MapPage.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/pages/map/MapPage.jsx)
- 백엔드 매물 API 연동 로직을 추가하고, 선택된 필터에 따라 인프라 POI와 매물 마커를 함께 표시할 수 있도록 컨트롤러 영역을 보강합니다.

#### [MODIFY] [InfraMap.jsx](file:///C:/KOSTA_Projects/4_Final_Project/infra%20map%20%EC%BD%94%EB%93%9C%20%EC%88%98%EC%A0%95/front_zipt/src/components/map/InfraMap.jsx)
- 카카오맵 API 로드가 완료되었을 때, 백엔드로부터 받아온 매물 좌표(`getPropertyMarkers`)를 이용해 지도 상에 다른 디자인의 마커(예: 매물 마커)를 렌더링하는 기능을 추가합니다.
- 각 매물 마커 클릭 시 간략한 툴팁 또는 오버레이 팝업을 표시합니다.

---

## Verification Plan

### Automated Tests
- `npm run build`를 통해 추가된 컴포넌트들이 React 19 및 Vite 빌드 환경 하에 타입 에러나 컴파일 에러 없이 빌드되는지 검증합니다.

### Manual Verification
- 카카오맵 키 입력 후 로컬 서버(`npm run dev`)를 실행하여 지도가 깨지지 않고 정상 로드되는지 확인합니다.
- 게시판 글 작성 -> 목록 조회 -> 상세 조회 -> 수정 및 삭제의 흐름이 정상적으로 동작하는지 화면 단에서 검증합니다.
