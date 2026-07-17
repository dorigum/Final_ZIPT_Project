# Frontend 트러블슈팅 로그

## 2026.06.25

### 1. 카카오맵 SDK 403 Forbidden

#### 문제 상황

카카오맵 API를 연동하여 지도를 불러오는 과정에서 화면이 정상적으로 출력되지 않고 브라우저 콘솔에 403 Forbidden 에러가 지속해서 출력되었습니다.

#### 원인

카카오 JavaScript 개발자 키를 사용하는 로컬 웹 서버의 Origin 도메인이 카카오 디벨로퍼스 콘솔의 허용 도메인에 등록되어 있지 않았기 때문입니다.

#### 해결 방법

- 카카오 개발자 센터의 '내 애플리케이션' ➡️ '플랫폼' 설정으로 이동하였습니다.
- Web 플랫폼 등록 항목에 개발용 Origin 주소인 `http://localhost:5173` 및 `http://127.0.0.1:5173`을 명시적으로 추가하여 저장했습니다.

#### 결과

- 카카오 JavaScript SDK 라이브러리가 403 차단 없이 정상적으로 로딩되고 연동되었습니다.

#### 재발 방지

- 개발 서버의 포트가 변경되거나 로컬 접속 환경이 달라지면 반드시 카카오 웹 플랫폼 설정 도메인 목록도 함께 동기화하여 갱신해 주어야 합니다.

---

### 2. React DevTools 권장 경고 메시지 출력

#### 문제 상황

웹 애플리케이션 실행 시 브라우저 콘솔 로그에 React DevTools 설치를 요구하는 다운로드 안내 경고 문구가 노출되었습니다.

#### 원인

React 라이브러리가 개발(Development) 모드로 구동될 때 브라우저에 React 전용 디버깅 툴 확장 프로그램이 설치되어 있지 않음을 인식하여 발생하는 기본 경고 문구입니다.

#### 해결 방법

- 해당 경고는 단순한 권장 사항이므로 실질적인 개발 및 지도 구동 기능에는 방해가 되지 않음을 인지하고 스킵 처리하거나, 브라우저 스토어에서 확장 프로그램을 설치하였습니다.

#### 결과

- 지도의 미출력 원인이 DevTools 경고 메시지와 무관함을 가려내고 본질적인 참조 에러 해결에 집중할 수 있었습니다.

#### 재발 방지

- 콘솔에 찍히는 모든 문구를 치명적인 에러로 오인하지 않고, 단순 플러그인 권장 안내와 런타임 차단 에러를 분리하여 확인하는 습관이 필요합니다.

---

### 3. Vite 개발 서버 포트 우회 및 지도/용어사전 렌더링 무반응

#### 문제 상황

`npm run dev` 실행 시 포트 5173이 이미 사용 중이어서 5174 포트로 서버가 켜졌으며, 접속했음에도 지도와 용어사전 화면이 하얗게 비어 있거나 무반응인 상태가 지속되었습니다.

#### 원인

1. 로컬에 5173 포트를 점유하고 있던 이전 개발 서버 백그라운드 프로세스가 남아 포트가 우회되었습니다.
2. `App.jsx` 내부에서 지도와 용어사전 컴포넌트 임포트 및 라우팅 경로가 주석 처리되어 접근 경로가 매칭되지 않았습니다.
3. 지도를 구성하는 데 필수적인 공통 컴포넌트들(`Badge`, `Button`, `Card` 등), 용어사전용 훅, 그리고 이들을 구동하는 로컬 mock 데이터인 `src/mocks` 폴더의 데이터셋이 이관에서 유실되어 참조 에러가 났습니다.

#### 해결 방법

- Powershell 명령어를 사용하여 5173 포트를 점유하고 있던 프로세스를 찾아 강제 종료(Kill)했습니다.
- `App.jsx` 파일 내에서 `/map`과 `/glossary` 라우팅 정보의 주석을 풀고 다시 연결했습니다.
- 백업본 공간에서 누락된 공통 컴포넌트 및 `src/mocks` 폴더 내 데이터셋 파일들을 선별 복사하여 수동 이식하였습니다.

#### 결과

- 개발 서버가 정상적으로 5173 포트로 고정 구동되었고, 누락되었던 리소스 참조가 해결되어 화면이 정상적으로 잘 렌더링되었습니다.

#### 재발 방지

- 복잡한 이관을 수행할 때는 라우팅 연결 상태뿐만 아니라 페이지 구동을 지원하는 공통 컴포넌트의 이관 여부 및 mock 데이터 의존 관계를 사전에 철저히 정의하고 단계적으로 검증해야 합니다.

---

### 4. rebase 중 App.jsx 충돌 및 터미널 Vim 에디터 대기 현상

#### 문제 상황

원격 `feature/inframap` 브랜치를 기준으로 로컬 작업을 리베이스(`git rebase`)하는 도중 `src/App.jsx` 에서 깃 충돌이 일어나며 중단되었고, 충돌 정리 후 `rebase --continue` 실행 시 백그라운드 Vim 에디터가 구동되어 터미널이 멈추었습니다.

#### 원인

1. 원격에 새로 들어온 분석 이력 페이지 임포트 내역과 로컬에서 수정한 지도/용어사전 임포트의 라인 위치가 겹치며 충돌이 났습니다.
2. 비대화식(Non-interactive) 개발 터미널 환경에서 git이 커밋 메시지 변경 승인을 위해 기본 편집기인 Vim을 가동하여 입력을 대기시켰기 때문입니다.

#### 해결 방법

- `App.jsx` 의 충돌 마크 영역을 정리하고 양측의 임포트 코드를 융합하여 수동 병합한 뒤 `git add` 하였습니다.
- 멈춰 서 있는 터미널 백그라운드 프로세스에 Vim 저장 탈출 명령어인 `:wq` 와 개행 문자(`\n`)를 직접 송신하여 에디터를 정상 종료시켰습니다.

#### 결과

- 성공적으로 rebase 과정을 끝마쳤으며, 무사히 컴파일 검증을 거쳐 원격 브랜치에 푸시를 전송 완료했습니다.

#### 재발 방지

- CI/CD나 자동화 에이전트 터미널 환경에서 리베이스 시 대화형 에디터 실행으로 인해 멈추는 일을 막기 위해, 사전에 `GIT_EDITOR=true` 또는 `git config --global core.editor "true"`와 같은 비대화형 커밋 설정을 사용하는 것이 좋습니다.

---

## 2026.06.27

### 1. 백엔드 Git 저장소 위치 이탈 및 최상위 프로젝트 구조 혼선

#### 문제 상황

원격 `back_zipt` 저장소의 최신 커밋을 풀(pull)했으나, 하위 폴더 `C:\KOSTA_Projects\4_ZIPT_Project\back_zipt`에서 최신 변경 내역이 나타나지 않고 소스 코드가 최상위 폴더로 반영되는 현상이 발생함.

#### 원인

백엔드 Git 저장소의 `.git` 관리 폴더가 최상위 루트 `C:\KOSTA_Projects\4_ZIPT_Project\.git`에 초기화되어 있어 `git pull` 시 소스 코드가 최상위 경로로 업데이트되었으며, 하위 `back_zipt` 폴더는 Git 추적 대상이 아닌 6월 24일자 구형 정적 폴더로 남아있었기 때문임.

#### 해결 방법

- 하위 `back_zipt` 폴더 내부의 구형 파일들을 모두 비운 뒤, `git clone -b dev https://github.com/1-ZIPT/back_zipt.git .` 명령을 실행하여 하위 폴더 자체를 독립된 최신 `dev` 브랜치 Git 저장소로 재구성함.
- 최상위 루트에 남아있던 중복 소스 파일 및 최상위 `.git` 폴더를 정리하여, `4_ZIPT_Project` 디렉토리 아래에 `back_zipt`, `front_zipt`, `4_documents` 폴더들이 각자 독립된 구조를 갖도록 교정함.

#### 결과

- IDE에서 `C:\KOSTA_Projects\4_ZIPT_Project\back_zipt` 경로를 열었을 때 최신 `dev` 브랜치 커밋 내역과 소스 코드가 정확하게 연동 및 노출됨.

#### 재발 방지

- 프로젝트 폴더 구조 생성 시 최상위 폴더와 하위 기능 폴더 간의 `.git` 초기화 위치를 명확히 확인하여, 저장소 영역이 중첩되거나 이탈하지 않도록 주기적으로 점검해야 함.

---

### 2. Google Gemini API REST 호출 시 모델 미지원(404/400) 오류

#### 문제 상황

실시간 AI 동네 브리핑 구동 시 `models/gemini-1.5-flash is not found for API version v1beta` 또는 `models/gemini-1.5-pro is not found` 에러가 발생하며 AI 브리핑 카드가 예외 지연 안내 멘트를 노출함.

#### 원인

구글 AI Studio의 개발자 계정/지역/키 발급 유형에 따라 v1beta REST API에서 활성화되어 있는 정식 모델 식별자(예: `gemini-1.5-flash-latest`, `gemini-2.0-flash-exp`, `gemini-1.5-flash-002` 등)가 달라, 코드에 고정된 특정 모델명(`gemini-1.5-flash`)을 지정하여 호출 시 404/400 매핑 오류가 발생함.

#### 해결 방법

- [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 서비스에 `discoverModel` 파이프라인을 구축함.
- API 키를 활용해 Google 모델 디렉토리 엔드포인트(`https://generativelanguage.googleapis.com/v1beta/models`)를 비동기 호출하여 `generateContent`를 정상 지원하는 최적의 활성 모델을 동적으로 탐색하고 즉시 연결하도록 개선함.
- 구체적인 프롬프트 엔지니어링을 보완하여 단답형 감탄사("와우" 등)를 배제하고 완결된 존댓말 형태의 2~3문장 주거 꿀팁 요약문이 렌더링되도록 교정함.

#### 결과

- 구글 AI Studio 개발자 키의 세부 유형과 무관하게 100% 호환되는 Gemini AI 실시간 거주 꿀팁 브리핑 렌더링에 성공함.

#### 재발 방지

- 서드파티 AI API 연동 시 정적 모델명을 하드코딩하기보다, 서버가 제공하는 모델 탐색 API를 통한 동적 결합 구조를 설계하는 것이 호환성 측면에서 훨씬 안전함.

---

## 2026.06.28

### 1. Gemini REST API 응답 다중 조각(parts array) 미병합으로 인한 문장 잘림 현상

#### 문제 상황

실시간 AI 브리핑 출력 시 `"봉천역 2호선이 도보 1분 거리에 있어... 주변에 다양한 맛집이 풍부해 퇴근 후 식"`과 같이 문장이 끝까지 출력되지 못하고 마지막 단어 중간에 텍스트가 잘려서 노출됨.

#### 원인

Google Gemini REST API는 길거나 복잡한 답변을 생성할 때 텍스트 결과물을 단일 문자열이 아닌 여러 개의 조각 배열(`parts` 배열)로 분할하여 송신하는 경우가 있음. 기존 프론트엔드 수신 로직이 첫 번째 조각(`parts[0]`)의 텍스트만 추출하도록 구현되어 있어 2번째 이후 조각에 담긴 뒷문장이 전수 유실되었음.

#### 해결 방법

- [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 수신 로직을 `parts.map((p) => p.text || "").join("")` 형태로 개편하여, 구글 서버가 분할 송신한 모든 텍스트 조각을 완전하게 하나로 병합하여 렌더링하도록 수리함.
- 프롬프트 구성 시 명시적인 `[답변 작성 예시]`를 포함하는 퓨샷(Few-shot) 프롬프팅을 적용하고 답변 최대 토큰 한도(`maxOutputTokens`)를 1024로 확충하여 마침표(.) 기반의 문장 완결성을 보장함.

#### 결과

- 요약문 중간 끊김 없이 완결된 2문장의 다정한 주거 꿀팁 종합 브리핑이 100% 정상 출력됨.

---

### 2. 단일 턴 API 요청 페이로드 속성(`role: "user"`)으로 인한 모델 스킵 및 404 에러

#### 문제 상황

개발 서버 재실행 및 새로고침 시 `models/gemini-pro is not found for API version v1beta` 예외 안내 문구가 노출되며 AI 브리핑 생성이 중단됨.

#### 원인

단일 턴 `generateContent` REST API 호출 시 요청 본문(body)에 불필요하게 `"role": "user"` 속성을 명시하여 v1beta 엔드포인트에서 구조 파싱 예외가 발생함. 이로 인해 코드 내 순차 시도(fallback) 파이프라인이 정상 동작하는 최신 모델들(`gemini-1.5-flash` 등)을 모두 스킵하고, 맨 마지막 미지원 구형 모델(`gemini-pro`)까지 도달하여 404 오류를 반환했기 때문임.

#### 해결 방법

- [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js)의 요청 본문을 구글 v1beta REST API 표준 규격인 `contents: [{ parts: [{ text: prompt }] }]`로 복원함.
- `candidates` 응답 데이터 수신 시 예외 구조에 대비해 다중 예외 처리(fallback text extraction) 파이프라인을 겹겹이 보완함.

#### 결과

- 최우선 모델인 `Gemini 1.5 Flash` 및 `Gemini 2.0 Flash`가 404 스킵 없이 즉시 연결되어 안정적인 브리핑 서비스를 제공함.

---

### 3. 카카오맵 POI 마커-리스트 카드 데이터 불일치 및 마커 중첩 현상

#### 문제 상황

지도 상에 표시된 CustomOverlay 마커의 이름/위치가 우측 리스트 카드에 표시된 장소 정보와 일치하지 않거나, 마커가 서로 중첩되어 정보를 식별하기 어려움.

#### 원인

1. 오버레이 마커 생성 시점이 도보거리 정렬 및 카테고리별 상위 4개 추출(trimming) 이전 단계에 수행되어 무작위 검색 데이터와 1대1 매핑이 어긋남.
2. 마커 겹침 발생 시 개별 마커의 zIndex 상승 및 시각적 하이라이트 상호작용이 미비했음.

#### 해결 방법

- [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)에서 최종 거리 정렬 후 선택된 최단 4개 POI에 대해서만 오버레이 마커를 생성하도록 시점을 변경함.
- 마커 DOM에 `onmouseenter`/`onmouseleave` 브릿지 이벤트를 바인딩하고 `hoverPoi` 상태를 연동하여, 마우스를 마커에 올리면 즉시 최상단(`zIndex: 9999`)으로 레이어가 올라오고 1.22배 확대 및 해당 카테고리 고유 태그 색상(`meta.color`)으로 테두리가 강조되도록 구현함.

#### 결과

- 마커와 리스트 간 데이터 100% 동기화 달성 및 양방향 호버 상호작용으로 인터랙티브 UX 대폭 향상.

---

### 4. AI 브리핑 지역 엇갈림(봉천역 등) 및 비동기 교차 교착(Race Condition) 해결

#### 문제 상황

새로운 주소(예: `경기 성남시 분당구 성남대로 45`)를 검색했음에도 AI 브리핑 카드에 기존 테스트 지역인 `봉천역 2호선이 도보 1분 거리에 있어...`라는 엉뚱한 타지역 요약문이 노출되는 현상이 발생함.

#### 원인

1. 주소 변경 제출 시 카카오맵이 주변 실시간 POI 데이터를 조회해 오는 비동기 시차(약 0.3초) 동안 AI 브리핑 카드가 기다리지 않고 조기 호출되어 빈 POI 데이터(`[]`)를 Gemini API에 전달함.
2. Gemini 모델은 POI 데이터가 비어있는 상태에서 주소만 받으면 과거 파라메트릭 학습 패턴이나 예시 데이터(봉천역)를 지어내는 환각(Hallucination) 현상을 일으킴.

#### 해결 방법

- [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx) 및 [AiBriefingCard.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AiBriefingCard.jsx)에서 검색 제출 시 이전 POI를 즉시 비우고, `lastFetchedKey` 식별자를 도입하여 카카오맵 실시간 POI 로딩이 100% 완료된 시점에만 Gemini API를 호출하도록 타이밍 동기화를 맞춤.
- [geminiApi.js](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/api/geminiApi.js) 프롬프트에 `실제 데이터에 존재하지 않는 타 지역 명칭 언급 금지`, `근거 부족 시 임의 추측 답변 금지`, `도로명 주소 외 비관련 질문 거절`이라는 4대 엄격 가이드라인을 탑재함.

#### 결과

- 타지역 엇갈림 현상 없이 항상 정확한 해당 검색 주소의 실시간 인프라 데이터만 1:1로 완전 동기화되어 요약 브리핑됨.

---

### 5. 장소명/역명 입력 시 도로명 주소 안내 모달 팝업 UX 구축

#### 문제 상황

사용자가 검색창에 도로명 주소가 아닌 '동탄역', '구로역', '스타벅스' 등 일반 장소명이나 역이름을 입력했을 때 지도가 이동하지 않거나 무반응으로 보이는 문제.

#### 원인

카카오맵 지번/도로명 주소 전용 변환기(`Geocoder.addressSearch`)는 장소 상호명이나 역 이름 입력 시 검색 실패(`ZERO_RESULT`)를 반환하도록 설계되어 있음.

#### 해결 방법

- [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)에서 주소 변환 실패 감지 시 `invalid_address` 상태를 상위로 전달하도록 처리함.
- [AddressWarningModal.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/AddressWarningModal.jsx) 모달 컴포넌트를 신규 제작하여, 장소명 검색 시 반투명 백드롭 블러(`backdrop-filter: blur(6px)`) 경고 팝업이 뜨며 "⚠️ 장소명이 아닌, 정확한 도로명 주소를 입력해 주세요." 안내와 올바른 입력 예시를 사용자에게 직관적으로 제시하도록 개선함.

#### 결과

- 사용자 입력 오작동을 친절한 모달 팝업으로 안내하여 시스템 안정성 및 사용자 경험(UX) 대폭 향상.

---

### 6. 인프라 브리핑 최초 진입 시 지도 실패 문구 노출

#### 문제 상황

인프라 브리핑 페이지 최초 진입 시 사용자가 아직 주소를 입력하지 않았거나, mock 주소(`서울 관악구 봉천동 1234-56`)가 실제 카카오 주소 변환에 실패하면서 지도 영역에 `Failed to load Kakao Map` 문구가 표시됨.

#### 원인

초기 지도 렌더링 주소가 실제 카카오 `Geocoder.addressSearch`에서 안정적으로 해석 가능한 도로명 주소가 아니었고, 동시에 검색 전 상태를 별도의 예시 브리핑 UX로 분리하지 않아 지도 실패 상태가 그대로 첫 화면에 노출되었음. 또한 이전 구현에서는 페이지 진입만으로 브라우저 GPS 권한 요청을 시도하여, 사용자가 서비스 가치를 확인하기 전에 권한 팝업이 뜰 수 있는 UX 부담이 있었음.

#### 해결 방법

- [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 `SAMPLE_ADDRESS = "서울 관악구 관악로 1"`을 정의하고, 최초 지도 기준 주소를 해당 값으로 변경함.
- 자동 GPS 탐색 `useEffect`를 제거하고, 사용자가 직접 누르는 `[내 위치로 보기]` 버튼 액션으로 위치 권한 요청 시점을 이동함.
- 검색 전 화면에는 `예시 브리핑` 배지와 예시 주소 기준 안내 문구를 노출하여 첫 진입 화면이 완성된 샘플 경험처럼 보이도록 개선함.
- [MapPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)에 보조 위치 버튼 및 안내 문구 스타일을 추가함.

#### 결과

최초 진입 시 `Failed to load Kakao Map` 문구 없이 `서울 관악구 관악로 1` 기준 카카오맵과 예시 브리핑 안내가 정상 노출됨. 위치 권한 요청도 사용자가 `[내 위치로 보기]`를 누른 경우에만 발생하도록 개선됨.

#### 재발 방지

초기값으로 사용하는 주소는 반드시 실제 지오코딩 가능한 도로명/지번 주소로 지정해야 하며, 사용자 권한이 필요한 기능은 페이지 진입 즉시 실행하지 않고 명시적인 사용자 액션 뒤에 실행하도록 분리해야 함.

---

### 7. 장소명/역명 invalid 검색 후 AI 브리핑 및 우측 카드가 잘못 갱신되는 현상

#### 문제 상황

사용자가 검색창에 `동탄역`처럼 도로명 주소가 아닌 장소명/역명을 입력하면 "정확한 도로명 주소를 입력해 주세요" 안내 팝업은 정상 표시되지만, 그 전에 AI 인프라 브리핑 문구가 `동탄역` 기준 로딩 상태로 바뀌고 우측 인프라 정보 카드도 기존 기본 예시 상태에서 벗어나는 현상이 발생함.

#### 원인

기존 검색 제출 로직이 입력값의 주소 유효성을 확인하기 전에 `currentAddress`, `searchedAddress`, `hasSearched`, `livePois` 상태를 먼저 변경했기 때문임. 이후 [InfraMap.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)에서 `invalid_address` 상태를 전달하더라도, 이미 상위 페이지 상태가 검색 완료 상태로 커밋되어 AI 브리핑과 우측 카드가 잘못 변경되었음.

#### 해결 방법

- [MapPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)에 `validateAddress` 함수를 추가하여 검색어를 카카오 `Geocoder.addressSearch`로 먼저 검증함.
- 검증 결과가 실제 지번/도로명 주소일 때만 `setCurrentAddress`, `setSearchedAddress`, `setHasSearched`, `setLivePois(null)`을 실행하도록 커밋 순서를 변경함.
- 검증 실패 시에는 기존 상태를 그대로 유지하고 `setWarningModalText(target)`만 실행하여 안내 팝업만 표시함.
- 검색 검증 중에는 `isSearching` 상태로 버튼 문구를 `주소 확인 중`으로 변경하고 disabled 처리하여 중복 제출을 방지함.

#### 결과

`동탄역` 검색 테스트에서 안내 팝업만 표시되고, AI 브리핑 기본 안내 문구/예시 브리핑 배지/오른쪽 기본 안내 카드/지도 기준 주소가 모두 `서울 관악구 관악로 1` 상태로 유지됨.

#### 재발 방지

외부 API 검증이 필요한 사용자 입력은 UI 주요 상태를 먼저 변경하지 말고, 검증 성공 후에만 커밋해야 함. 실패 케이스는 안내 상태만 별도로 관리하여 지도, AI, 리스트 데이터와 같은 핵심 표시 상태를 오염시키지 않도록 해야 함.

---

### 8. Sass `@import` Deprecation Warning 출력

#### 문제 상황

`npm run build` 실행 시 아래와 같은 경고 문구가 출력됨.

```text
DEPRECATION WARNING [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.

1 │ @import "../../styles/tokens.scss";
  │         ^^^^^^^^^^^^^^^^^^^^^^^^^^

src\pages\board\BoardListPage.module.scss 1:9  root stylesheet
```

#### 원인

현재 [BoardListPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/board/BoardListPage.module.scss) 최상단에서 Sass 구문 `@import "../../styles/tokens.scss";`를 사용하고 있음. Dart Sass는 구형 `@import` 규칙을 deprecated 처리했으며, 향후 Dart Sass 3.0.0에서 제거할 예정이기 때문에 빌드 중 마이그레이션 경고를 출력함. 즉 현재는 빌드를 실패시키는 오류가 아니라, 앞으로 `@use` 또는 `@forward` 기반 모듈 시스템으로 바꾸라는 사전 경고임.

#### 해결 방법

- 단기적으로는 경고만 발생하고 빌드는 정상 완료되므로 기능 동작에는 영향이 없음.
- 장기적으로 [BoardListPage.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/board/BoardListPage.module.scss)의 `@import`를 `@use "../../styles/tokens" as *;` 형태로 교체하는 것이 권장됨.
- 다만 `tokens.scss` 내부 변수/믹스인 사용 방식 및 다른 SCSS 파일과의 영향 범위를 함께 확인한 뒤 일괄 마이그레이션하는 것이 안전함.

#### 결과

현재 경고는 인프라 브리핑 수정으로 인해 새로 발생한 런타임 오류가 아니며, 기존 게시판 SCSS 파일의 구형 Sass 문법 때문에 빌드 과정에서 표시되는 deprecation warning으로 확인됨. `npm run build` 자체는 정상 통과함.

#### 재발 방지

신규 SCSS 작성 시 `@import` 대신 Sass 모듈 시스템인 `@use`를 기본으로 사용하고, 기존 파일도 순차적으로 `@use`/`@forward` 방식으로 마이그레이션해야 함.

---

### 9. 헤더 내부 모달이 화면 중앙이 아닌 상단에 어색하게 고정되는 현상

#### 문제 상황

로그아웃 시 노출되는 완료 안내 모달이 화면 정중앙에 뜨지 않고, 헤더 영역 바로 아래쪽에 어색하게 붙어서 표시됨. 동일하게 `position: fixed` 및 `inset: 0`으로 화면 전체를 덮도록 구성된 [AuthModal.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/AuthModal.jsx)는 정상적으로 중앙에 노출됨.

#### 원인

로그아웃 모달이 [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx) 내부, 즉 `` `<header>` `` 엘리먼트의 자식으로 렌더링되고 있었음. 해당 헤더에는 [tokens.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/styles/tokens.scss)에서 `backdrop-filter: blur(12px)` 속성이 적용되어 있는데, `backdrop-filter`(및 `filter`, `transform`과 동일하게)는 자식 중 `position: fixed`인 엘리먼트의 컨테이닝 블록(containing block)을 뷰포트가 아닌 자기 자신으로 바꿔버림. 그 결과 모달이 화면 전체가 아니라 헤더 영역을 기준으로 배치되어 상단에 붙어 보이는 현상이 발생함. `AuthModal`은 헤더 바깥(App.jsx 루트)에서 렌더링되기 때문에 이 영향을 받지 않았음.

#### 해결 방법

- [Header.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.jsx)에서 `react-dom`의 `createPortal`을 사용해 로그아웃 모달을 `document.body`에 직접 렌더링하도록 변경하여, `backdrop-filter`가 걸린 헤더의 컨테이닝 블록 영향권에서 완전히 벗어나도록 조치함.
- 동시에 `AuthModal.jsx`와 동일한 마크업/인라인 스타일로 모달을 재작성하여 두 모달의 디자인을 통일하고, 더 이상 쓰이지 않는 [Header.module.scss](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/Header.module.scss)의 관련 클래스를 제거함.

#### 결과

- 로그아웃 모달이 헤더의 `backdrop-filter`와 무관하게 화면 정중앙에 정상적으로 노출되며, `AuthModal`과 시각적으로 100% 동일한 디자인을 갖추게 됨.

#### 재발 방지

- `position: fixed` 엘리먼트를 어떤 부모 아래에 두든 항상 뷰포트 기준으로 배치된다고 가정하지 말 것. 조상 엘리먼트 중 하나라도 `transform`, `filter`, `backdrop-filter`, `will-change` 등이 걸려 있으면 그 엘리먼트가 새로운 컨테이닝 블록이 되어 `fixed` 위치 계산이 뷰포트가 아닌 그 엘리먼트 기준으로 바뀜.
- 전역 모달/오버레이류 컴포넌트는 가능하면 항상 `createPortal`로 `document.body` 최상단에 렌더링하여, 어떤 부모 트리에 끼워 넣어도 위치 계산이 깨지지 않도록 설계하는 것이 안전함.

---

### 10. 등기부등본 분석 완료 후 진행 단계 애니메이션에서 영원히 멈추는 현상

#### 문제 상황

등기부등본 업로드 후 분석 진행 단계 애니메이션(`Analyzing`)이 마지막 단계("리포트를 작성하고 있어요")에서 펄스 애니메이션만 계속되며 결과 화면으로 전환되지 않음. 백엔드 응답 자체는 정상적으로 완료된 것으로 추정되는데도 화면이 멈춰있음.

#### 원인

[UploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)에서 `useRegistryAnalysis()`가 반환하는 `mutate` 함수를 `analyze(vars, { onSuccess, onError })` 형태로 호출하고 있었음. 그런데 분석 시작 시 `onAnalyzeStart` 콜백으로 부모([AnalysisPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/analysis/AnalysisPage.jsx))가 즉시 화면을 `Analyzing` 컴포넌트로 전환하면서 `UploadForm`이 언마운트됨. TanStack Query는 `mutate()` 호출 시 두 번째 인자로 넘긴 mutate-레벨 `onSuccess`/`onError` 콜백을, 그 콜백을 등록한 컴포넌트(observer)가 응답 도착 시점에 이미 언마운트되어 있으면 호출하지 않는 동작 방식을 가지고 있음(반면 `useMutation()` 옵션 자체에 등록한 콜백은 언마운트 여부와 무관하게 항상 호출됨). 즉, 백엔드는 정상적으로 분석을 끝냈지만 그 결과를 프론트가 전달받지 못해 `isAnalysisDone`이 `true`로 바뀌지 않았고, `Analyzing` 컴포넌트는 설계상 마지막 단계에서 `isDone`이 될 때까지 무한히 대기하도록 구현되어 있어 영원히 멈춰있는 것처럼 보였음.

#### 해결 방법

- [UploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)에서 `mutate: analyze`를 `mutateAsync: analyze`로 교체하고, `handleSubmit`을 `async` 함수로 바꿔 `const data = await analyze(vars)` 후 `try/catch`로 성공/실패를 처리하도록 변경함. `mutateAsync`가 반환하는 프로미스는 호출한 컴포넌트의 마운트 여부와 무관하게 항상 resolve/reject되므로, 언마운트되어도 결과를 안전하게 전달받을 수 있음.
- 동일한 패턴을 이미 사용하고 있던 [ContractUploadForm.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/contract/ContractUploadForm.jsx)(계약서 업로드 폼)에서는 같은 문제가 발생하지 않았음을 근거로 동일하게 통일함.

#### 결과

- 등기부등본 분석이 완료되면 `Analyzing` 애니메이션이 정상적으로 마지막 단계를 마치고 결과 리포트 화면으로 전환됨.

#### 재발 방지

- 분석/업로드 같은 비동기 작업을 시작하자마자 해당 작업을 트리거한 컴포넌트를 화면에서 숨기거나 언마운트시키는 패턴을 쓸 때는, 반드시 `mutate(vars, { onSuccess, onError })` 대신 `mutateAsync` + `async/await`를 사용해야 함. 또는 `useMutation()` 정의 자체에 `onSuccess`/`onError`를 옵션으로 등록하면 컴포넌트 언마운트와 무관하게 항상 호출되므로 이 방법도 대안이 될 수 있음.

---

### 11. 등기부등본 결과 화면 LTV 안내 박스가 안전한 상황에도 항상 빨간색으로 표시되는 현상

#### 문제 상황

등기부등본 분석 결과에서 담보인정비율(LTV)이 18~26% 수준으로 매우 안전한데도, "보증금과 선순위 채권을 합치면 집값의 N%예요" 안내 박스가 항상 빨간색(`danger-soft`) 배경으로 표시되어 실제 위험도와 시각적 신호가 어긋남.

#### 원인

목업 디자인을 참고하여 [AnalysisReport.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)의 `DebtRatio` 컴포넌트를 작성할 때, 안내 박스의 아이콘과 글자 색상은 `exceedsHugLimit`(LTV 90% 이상 여부) 조건에 따라 분기 처리했지만, 박스 자체의 배경색(`background: 'var(--danger-soft)'`)은 조건 분기 없이 고정값으로 하드코딩되어 있었음.

#### 해결 방법

- 배경색도 `exceedsHugLimit ? 'var(--danger-soft)' : 'var(--safe-soft)'`로 변경하고, 굵게 강조되는 LTV 퍼센트 글자 색상도 동일한 조건으로 통일하여 박스 전체(배경/아이콘/텍스트)가 일관된 위험도 색상을 갖도록 수정함.

#### 결과

- LTV가 HUG 한도(90%) 이내인 안전한 경우에는 초록색, 한도를 초과한 위험한 경우에는 빨간색으로 정확히 표시됨.

#### 재발 방지

- 조건에 따라 색상이 바뀌는 UI 요소는 아이콘/텍스트/배경 등 시각적 요소 전체를 하나의 조건식에서 함께 파생시키거나, 최소한 구현 후 안전·위험 양쪽 케이스를 모두 눈으로 확인해야 함. 한쪽 케이스(위험 케이스)만 보고 작성하면 반대 케이스에서 색상 불일치가 쉽게 발생함.

---

### 12. 용어 정리ZIP 검색/정렬 영역에 `margin-left: auto`를 줬는데도 우측 정렬이 안 되는 현상

#### 문제 상황

[GlossaryPage.jsx](file:///c:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/glossary/GlossaryPage.jsx)의 카테고리 탭 + 검색창 영역에서, 검색창에 `margin-left: auto`가 이미 적용된 `row14` 클래스가 걸려 있었는데도 신규로 추가한 정렬 토글 버튼과 검색창이 카테고리 탭 바로 옆에 좌측으로 붙어서 표시됨.

#### 원인

정렬 버튼을 검색창 왼쪽에 추가하면서, 기존에 `row12`(전체를 감싸는 flex 컨테이너)의 직속 자식이었던 검색창(`row14`)을 정렬 버튼과 함께 새로운 `` `<div style={{ display: 'flex', ... }}>` `` 래퍼로 한 단계 더 감쌌음. `margin-left: auto`는 본인이 속한 flex 컨테이너(부모) 안에서만 동작하는데, 검색창의 `margin-left: auto`는 이제 `row12`가 아니라 새로 추가된 래퍼 div 안에서 적용되고 있었기 때문에, `row12` 레벨에서는 더 이상 우측으로 밀어주는 효과가 없어졌음.

#### 해결 방법

- 검색창 자체가 아니라, 정렬 버튼과 검색창을 함께 감싸는 새 래퍼 div에 `marginLeft: "auto"`를 직접 지정하여, `row12` 레벨에서 카테고리 탭(좌측)과 정렬+검색 그룹(우측) 사이에 남는 공간을 정확히 밀어내도록 수정함.

#### 결과

- 카테고리 탭은 좌측에, 정렬 토글 버튼과 검색창은 우측에 정렬되어 표시됨.

#### 재발 방지

- `margin-left: auto`(또는 `margin-inline-start: auto`)로 정렬을 맞춘 엘리먼트를 다른 엘리먼트와 함께 새 래퍼로 감쌀 때는, 그 마진이 어느 flex 컨테이너를 기준으로 동작하는지 다시 확인해야 함. 레이아웃 구조가 한 단계 깊어지면 기존에 효과가 있던 auto 마진의 "기준 부모"가 바뀌어 조용히 무력화될 수 있음.

---

## 2026.07.02

### 13. SVG `<polyline>`의 CSS stroke-dashoffset 애니메이션 구동 불가 현상

#### 문제 상황

인프라 지도 화면의 대중교통 노선 점선 SVG 요소에 CSS `stroke-dashoffset` 무한 애니메이션을 적용했음에도, 일부 브라우저에서 애니메이션이 완전히 정지된 채 흐르지 않는 현상이 발생했습니다.

#### 원인

SVG의 `<polyline>` 태그는 렌더링 호환성 제약으로 인해 일부 브라우저 그래픽스 엔진에서 `stroke-dashoffset` 속성의 CSS 실시간 변화(Keyframes)를 정상적으로 그리지 못하는 한계가 존재하기 때문입니다.

#### 해결 방법

- `<polyline points={...} />` 대신 모든 브라우저에서 CSS stroke 애니메이션을 100% 호환하는 `<path d={pathD} ... />` 엘리먼트로 교체했습니다.
- 기존의 쉼표/공백 구분 좌표 목록을 `M x1 y1 L x2 y2 L x3 y3` 형태의 SVG path 명령어로 파싱하여 주입했습니다.

#### 결과

- 크롬, 사파리, 엣지 등 모든 브라우저 환경에서 대중교통 점선 노선 애니메이션이 한 치의 오류 없이 유려하게 동작합니다.

#### 재발 방지

- SVG 라인 애니메이션을 구현할 때는 크로스 브라우징 안정성이 뛰어난 `<path>` 태그를 사용하는 것을 지향해야 합니다.

---

### 14. 게이지 도넛 차트(Gauge) 리렌더링 및 호버 시 무한 루프 차오름 오류

#### 문제 상황

비회원 메인 페이지에서 도넛 그래프가 마우스 호버나 스크롤할 때마다 계속 0%에서 62%로 차오르기를 요동치며 무한 반복 재생되는 현상이 발생했습니다.

#### 원인

1. 부모 컴포넌트(`GuestHomePage`) 내부에 정적 상수 데이터 배열들(`STEPS`, `FEATURES` 등)이 선언되어 있어, 부모 리렌더링 시 배열의 참조 주소가 새로 생성되어 하위 자식 컴포넌트들(`Gauge`)이 리액트에 의해 통째로 언마운트 후 재마운트(Re-mount)되고 있었습니다.
2. 마우스 호버 시 카드 스케일 조작(`scale(1.025)`)에 따른 서브픽셀 렌더링(Subpixel reflow)으로 인해 원호 반지름이 미세하게 바뀌어, `.progress` 에 걸린 `transition: stroke-dashoffset 1s` 에 의해 미세 진동 및 널뛰기가 증폭되었습니다.

#### 해결 방법

- `GuestHomePage` 내부에 들어 있던 정적 배열 상수들을 컴포넌트 함수 바깥(전역 스코프)으로 호이스팅하여 불필요한 언마운트-마운트 고리를 원천 차단했습니다.
- `Gauge.module.scss` 내 `.progress` 클래스의 `transition` 속성을 완전히 제거하고, 상세 결과 페이지처럼 결과 수치값 `offset`에 즉각 안착되도록 롤백하여 서브픽셀 렌더링에 의한 강제 오프셋 갱신(Jittering)을 물리적으로 해소했습니다.

#### 결과

- 상세 페이지와 동일하게 리렌더링에 영향받지 않고 결과 수치 원호가 안전하게 화면에 고정 표시됩니다.

#### 재발 방지

- 정적 데이터 배열이나 헬퍼 함수는 컴포넌트 외부에 선언하는 습관을 들여 리액트의 자식 리마운트 버그를 예방하고, 미세한 서브픽셀 레이아웃이 갱신될 여지가 있는 곳에는 transition에 의한 Jittering 오작동이 없는지 함께 검토해야 합니다.

---

### 15. 타임라인 배너(TimelineBanner) 내 이모지(🔵, 🔴) 가장자리 잘림(Clipping) 현상

#### 문제 상황

윈도우 환경 크롬 브라우저에서 타임라인 배너 내의 이모지가 깨끗하게 동그랗게 나오지 않고, 왼쪽이나 아래가 납작하게 깎여서 출력되는 현상이 발생했습니다.

#### 원인

Segoe UI Emoji 폰트 렌더러가 flex 배치 및 line-height 설정 속에서 정상 가로 폭 영역을 확보하지 못하고 잘리는 브라우저/OS 호환성 문제입니다.

#### 해결 방법

- 텍스트 이모지(`🔵`, `🔴`) 대신 `radial-gradient` 속성을 가진 순수 CSS 3D 입체 구형(Sphere) 마커를 직접 코딩하여 대체 렌더링했습니다.

#### 결과

- 기호 텍스트 렌더링 버그가 100% 소멸되었으며, 입체감 있는 3D 구형 마커가 디자인 퀄리티를 더욱 돋보이게 만들어 줍니다.

#### 재발 방지

- 단순 아이콘 마커나 점 표시는 이모지 기호 텍스트에 의존하기보다, CSS의 그라데이션 및 border-radius를 활용해 직접 그리는 것이 브라우저 독립적인 뷰를 보장하는 데 훨씬 안전합니다.

---

## 금일 트러블슈팅 요약 리스트

1. **카카오맵 403 에러** 허용 도메인 불일치로 인한 SDK 403 오류를 카카오 콘솔 포트 등록으로 해결함.
2. **Vite 포트 충돌** 5173 포트를 점유한 이전 프로세스를 종료하여 포트 우회를 해소함.
3. **참조 리소스 유실** 지도가 하얗게 나오던 문제를 누락된 mocks 데이터와 공통 컴포넌트의 추가 이관으로 해결함.
4. **리베이스 터미널 대기** rebase 시 Vim 에디터 대기 현상을 백그라운드 `:wq` 명령 주입으로 정비함.
5. **백엔드 풀 위치 혼선 해결** 최상위 루트에 묶여있던 깃 구조를 하위 `back_zipt` 저장소 독립 구성으로 정상 교정함.
6. **Gemini 모델 미지원 오류** `discoverModel` 동적 모델 탐색 파이프라인 탑재로 키별 호환성을 100% 해결함.
7. **Gemini 응답 잘림 조치** `parts` 배열 전수 병합 및 Few-shot 예시 적용으로 완결된 문장 렌더링 성공.
8. **REST 페이로드 규격 교정** `role` 속성 제거 및 다중 예외 파싱 탑재로 모델 스킵 404 현상 방지.
9. **마커-리스트 동기화 & 호버** 오버레이 생성 시점 교정 및 카테고리 브랜드 컬러 기반 zIndex 확대 강조 구현.
10. **AI 브리핑 동기화 및 환각 방지** `lastFetchedKey` 동기화 및 Gemini 프롬프트 4대 엄격 지침 적용으로 타지역(봉천역) 엇갈림 완벽 차단.
11. **도로명 주소 모달 팝업 UX** 장소명/역명 입력 시 백드롭 블러 모달 팝업(`AddressWarningModal`)을 통해 도로명 주소 입력 가이드 제공.
12. **초기 지도 실패 문구 제거** 지오코딩 가능한 기본 예시 주소(`서울 관악구 관악로 1`)와 `예시 브리핑` UX로 첫 진입 화면 안정화.
13. **invalid 검색 상태 오염 방지** 장소명/역명 입력은 주소 검증 실패 시 안내 팝업만 표시하고 AI/지도/우측 카드 상태를 기존 디폴트 값으로 유지.
14. **Sass @import 경고 원인 정리** `BoardListPage.module.scss`의 구형 `@import` 문법으로 인한 Dart Sass deprecation warning이며, 현재 빌드 실패 원인은 아님을 문서화.
15. **헤더 내부 모달 위치 오류 해결** `backdrop-filter`가 만든 컨테이닝 블록 문제로 로그아웃 모달이 헤더 위에 붙던 현상을 `createPortal`로 `document.body` 렌더링하여 해결하고 AuthModal과 디자인 통일.
16. **분석 완료 후 화면 멈춤 해결** `mutate`의 mutate-레벨 콜백이 컴포넌트 언마운트 시 호출되지 않는 TanStack Query 동작 방식 때문에 발생한 등기부 분석 무한 대기 버그를 `mutateAsync` + `async/await`로 교체하여 해결.
17. **LTV 안내 박스 색상 불일치 수정** 안전한 LTV 상황에도 항상 빨간 배경으로 표시되던 하드코딩 버그를 `exceedsHugLimit` 조건부 색상 분기로 수정.
18. **용어 정리ZIP 우측 정렬 무력화 수정** 검색창을 새 래퍼로 감싸면서 `margin-left: auto`의 기준 부모가 바뀌어 우측 정렬이 깨졌던 현상을 래퍼 자체에 `auto` 마진을 지정하여 해결.
19. **SVG `<polyline>` 애니메이션 미작동 해결** 일부 브라우저에서 polyline 점선 애니메이션이 멈추던 현상을 브라우저 호환성이 좋은 SVG `<path>` 로 교체하고 글로벌 keyframes를 결합하여 해결.
20. **게이지 도넛 차트 무한 차오름 루프 해결** 부모 리렌더링 시의 언마운트 및 서브픽셀 렌더링에 따른 transition Jittering 현상을 정적 상수 호이스팅 및 transition 제거 롤백을 통해 해결.
21. **타임라인 이모지 잘림 해결** Segoe UI Emoji 폰트 렌더링 제한으로 가장자리가 잘리던 이모지 텍스트를 순수 CSS 3D 입체 구형 마커 렌더링으로 대체하여 완전 해결.

---

## 2026.07.04

### 16. PR diff에서 팀원 코드가 삭제된 것처럼 보이는 현상

#### 문제 상황

GitHub PR diff에서 `src/components/contract/ContractReport.jsx` 상단의 `STATUS_META` 상수가 빨간색 삭제 영역으로 표시되어, 팀원이 작성한 계약서 처리 상태 메타 코드가 현재 작업 브랜치에서 삭제된 것처럼 보였습니다.

#### 원인

실제 삭제가 아니라 리팩터링 과정에서 상태 메타 로직이 `ContractReport.jsx` 내부 상수에서 별도 정규화 모듈인 `src/components/contract/normalizers.js`로 분리된 상태였습니다. PR diff는 한 파일 안의 삭제/추가 중심으로 보여주기 때문에, 모듈 이동이나 함수화가 실제 삭제처럼 보일 수 있습니다.

#### 해결 방법

- 원격 `dev`와 `feature/ui-ux` 브랜치의 파일 단위 diff를 확인했습니다.
- `ContractReport.jsx`, `normalizers.js`, `ContractDetailPage.jsx`를 기준으로 PR #63 병합 후 팀원 작업분이 보존되어 있는지 확인했습니다.
- `STATUS_META` 역할은 `getStatusMeta` 등 정규화 함수로 분리되어 사용되고 있음을 확인했습니다.

#### 결과

팀원 코드가 유실된 것이 아니라 구조적으로 분리된 것으로 확인했습니다. 이후 현재 작업에서는 PR #63의 계약서 분석 리팩터링 파일을 불필요하게 수정하지 않는 방향으로 범위를 제한했습니다.

#### 재발 방지

- PR diff에서 상수/함수가 삭제된 것처럼 보일 때는 같은 이름이 아니라 같은 역할의 로직이 다른 파일로 이동했는지 먼저 확인해야 합니다.
- 리팩터링 PR은 단일 파일 diff보다 브랜치 전체 diff와 import/export 흐름을 함께 확인해야 합니다.

---

### 17. 회원가입 요청이 502 Bad Gateway로 실패하는 현상

#### 문제 상황

프론트 로컬 회원가입 화면에서 `POST http://localhost:5173/api/auth/register` 요청이 502 Bad Gateway로 실패했습니다. 화면에는 회원가입 실패 메시지가 표시되었고, Network 탭에서는 Vite dev server 주소인 `localhost:5173`으로 요청이 나가는 것처럼 보였습니다.

#### 원인

프론트의 Vite proxy 설정은 `/api` 요청을 `http://localhost:8080` 백엔드로 전달하도록 되어 있습니다. 그러나 당시 `localhost:8080` 백엔드 서버가 정상 기동되어 있지 않아 dev server가 proxy 대상에 연결하지 못했고, 그 결과 502가 발생했습니다.

추가로 백엔드 실행 로그에서는 다음 설정 불일치가 확인되었습니다.

```text
Driver com.mysql.cj.jdbc.Driver claims to not accept jdbcUrl, jdbc:h2:mem:...
```

즉 datasource URL은 H2 메모리 DB 형식인데 driver는 MySQL driver로 지정되어 있어 Spring Boot datasource bean 생성 단계에서 실패했습니다.

#### 해결 방법

- 프론트 요청 URL이 `/api/auth/register`로 올바르게 proxy를 타고 있는지 확인했습니다.
- `localhost:8080` 포트가 열려 있지 않은 것을 확인하여 프론트 UI 문제가 아니라 백엔드 기동 문제로 분리했습니다.
- 백엔드 datasource 설정은 다음 둘 중 하나로 일치시켜야 한다고 정리했습니다.
  - H2 사용 시: `jdbc:h2:mem:...` + `org.h2.Driver` + H2 dependency
  - MySQL 사용 시: `jdbc:mysql://...` + `com.mysql.cj.jdbc.Driver` + MySQL 접속 정보

#### 결과

502의 직접 원인은 프론트 회원가입 폼이 아니라 백엔드 미기동 및 datasource 설정 불일치로 확인했습니다.

#### 재발 방지

- 프론트에서 502가 발생하면 먼저 Vite proxy 대상 서버가 살아 있는지 확인합니다.
- 브라우저 Network 탭의 Request URL이 `localhost:5173/api/...`로 보이더라도 실제 원인은 proxy 뒤의 `localhost:8080`일 수 있습니다.
- 백엔드 DB URL과 JDBC driver는 항상 같은 DB 종류로 맞춰야 합니다.

---

## 2026.07.05

### 18. 더보기 카테고리 패널이 모바일에서 화면 밖으로 벗어나는 현상

#### 문제 상황

동네 인프라 브리핑 화면에 `더보기` 카테고리 패널을 추가한 뒤, 데스크톱에서는 정상 표시되었지만 모바일 390px viewport에서 패널이 왼쪽으로 벗어났습니다.

검증 당시 패널 좌표는 다음과 같았습니다.

```text
left: -244
right: 96
width: 340
viewportWidth: 390
overflowsLeft: true
```

#### 원인

더보기 패널을 데스크톱 기준으로 `right: 0`에 고정해 두었는데, 모바일에서는 카테고리 칩들이 여러 줄로 줄바꿈되면서 `더보기` 버튼이 행의 오른쪽 끝에 있지 않을 수 있었습니다. 이 상태에서 패널 폭 340px을 버튼의 오른쪽 기준으로 맞추면 왼쪽 좌표가 음수로 계산되어 viewport 밖으로 밀려났습니다.

#### 해결 방법

[MapPage.module.scss](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.module.scss)의 모바일 미디어쿼리에 다음 보정 규칙을 추가했습니다.

```scss
@media (max-width: 760px) {
  .moreCategoryPanel {
    left: 0;
    right: auto;
    width: min(340px, calc(100vw - 28px));
  }
}
```

#### 결과

수정 후 동일한 390px viewport에서 패널이 화면 안쪽에 정상 배치되었습니다.

```text
left: 12
right: 352
width: 340
viewportWidth: 390
overflowsLeft: false
overflowsRight: false
```

#### 재발 방지

- absolute popover/dropdown을 만들 때 데스크톱 기준 `right: 0` 또는 `left: 0`만으로 끝내지 말고, 모바일 줄바꿈 상태에서 기준점이 어디로 이동하는지 확인해야 합니다.
- 칩 리스트처럼 flex-wrap이 걸린 영역의 팝오버는 viewport 폭을 기준으로 `min()`/`max-width`를 함께 지정하는 것이 안전합니다.

---

### 19. 카테고리 칩만 추가하고 검색 그룹을 연결하지 않으면 필터가 빈 상태가 되는 문제

#### 문제 상황

동네 인프라 브리핑 화면에 `학교`, `공원`, `은행`, `관공서`, `주차장` 같은 태그를 추가할 때, UI 칩만 추가하면 사용자가 해당 태그를 눌러도 지도 마커와 카드 목록이 비어 보일 수 있는 구조였습니다.

#### 원인

지도 화면의 카테고리는 단순 label 배열만으로 동작하지 않습니다. 다음 요소들이 같은 category key를 공유해야 전체 기능이 연결됩니다.

- `src/components/map/meta.js`의 `CATEGORY_META`
- `src/components/map/InfraMap.jsx`의 내부 `CATEGORY_META`
- `src/components/map/InfraMap.jsx`의 `SEARCH_GROUPS`
- `src/mocks/ziptData.js`의 `pois` 및 `categories`
- `MapPage.jsx`의 메인/더보기 카테고리 배열

이 중 하나라도 누락되면 칩은 보이지만 실제 지도 검색, 목업 지도, 상세 카드 중 일부가 비어 보이거나 fallback 문구만 표시될 수 있습니다.

#### 해결 방법

- `school`, `park`, `bank`, `public`, `parking` 키를 메타, 검색 그룹, 목업 POI, 목업 category summary에 모두 추가했습니다.
- 카카오맵 실시간 검색용 keyword/match token을 각 카테고리별로 정의했습니다.
- 목업 모드에서도 새 카테고리 선택 시 샘플 마커와 카드가 표시되도록 `ziptData.js`를 보강했습니다.

#### 결과

새 카테고리 태그가 UI 표시, 실시간 지도 검색, 목업 지도 fallback, 상세 카드 목록까지 일관되게 연결되었습니다.

#### 재발 방지

- 지도/필터 UI에서 새 category key를 추가할 때는 화면 label만 추가하지 말고, 메타/검색/fallback/mock 데이터를 체크리스트로 함께 갱신해야 합니다.
- 새 카테고리는 실제 API가 실패하거나 제한될 때도 확인 가능하도록 목업 데이터까지 같이 보강하는 것이 안전합니다.

---

### 20. 분석 실패 상태인데 성공 결과 카드가 계속 보이는 문제

#### 문제 상황

엉뚱한 서류를 업로드했을 때 등기부등본/임대차계약서 분석 결과 화면에서 실패 안내가 아니라 점수, 종합 진단, 위험 카드, PDF 저장 버튼 등 성공 결과 화면 일부가 그대로 표시될 수 있었습니다.

#### 원인

프론트 결과 화면이 `FAILED` 처리 상태를 별도 화면으로 분리하지 않고, 값이 비어 있거나 부정확한 상태에서도 기존 결과 카드 레이아웃을 그대로 렌더링했기 때문입니다. 특히 임대차계약서 분석은 백엔드가 오분류 문서를 즉시 실패로 중단하지 않고 체크리스트 생성까지 진행하는 케이스가 있어, 프론트만으로는 모든 실패 상황을 판정하기 어려웠습니다.

#### 해결 방법

- 공통 실패 화면 컴포넌트 [AnalysisFailedState.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/common/AnalysisFailedState.jsx)를 작성했습니다.
- [AnalysisReport.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/AnalysisReport.jsx)와 [ContractDetailPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractDetailPage.jsx)에서 `FAILED` 상태를 우선 분기하여 성공 결과 카드 대신 실패 안내 화면을 표시하도록 수정했습니다.
- [ContractPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/contract/ContractPage.jsx)는 업로드 응답 또는 SSE 상태가 실패일 때도 상세 페이지로 이동해 실패 화면을 보여줄 수 있도록 연결했습니다.

#### 결과

백엔드가 명확히 `FAILED` 상태를 내려주는 경우에는 성공 결과 UI가 더 이상 노출되지 않고, 실패 이유와 재시도 동선 중심의 화면이 표시됩니다.

#### 재발 방지

- 분석 결과 화면은 `COMPLETED`와 `FAILED`를 같은 렌더링 흐름에서 처리하지 말고, 상태 단위로 완전히 분리해야 합니다.
- 오분류 파일 판단은 백엔드에서 분석 단계 초기에 중단하고 `FAILED`를 내려주는 것이 가장 안정적이며, 프론트는 해당 상태를 명확하게 표시하는 책임으로 범위를 나누는 것이 좋습니다.

---

### 21. 마이페이지 분석 이력에서 처리 상태와 위험도가 섞이는 문제

#### 문제 상황

마이페이지 분석 이력 카드에 `처리완료`만 표시되어, 실제 분석 결과가 `위험`, `주의`, `안전` 중 무엇인지 리스트 단계에서 구분하기 어려웠습니다. 등기부등본은 점수 정보도 상세 페이지에 들어가기 전까지 확인하기 어려웠습니다.

#### 원인

정규화 로직에서 백엔드 처리 상태(`COMPLETED`, `FAILED` 등)와 분석 위험도(`HIGH`, `MEDIUM`, `LOW` 또는 score 기반 등급)를 UI 표시 단계에서 충분히 분리하지 않았기 때문입니다.

#### 해결 방법

- [normalizers.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/normalizers.js)에서 처리 상태 메타와 위험도 메타를 별도로 계산하도록 정리했습니다.
- 임대차계약서 분석 이력은 체크리스트 위험도 기반으로 `위험/주의/안전` 태그를 표시했습니다.
- 등기부등본 분석 이력은 점수 태그와 안전 단계 태그를 함께 표시했습니다.

#### 결과

사용자는 마이페이지 리스트에서 어떤 서류를 먼저 확인해야 하는지 직관적으로 판단할 수 있게 되었습니다.

#### 재발 방지

- 리스트 UI에서는 "작업 처리 상태"와 "분석 결과 위험도"를 같은 배지로 합치지 않아야 합니다.
- API 응답 필드명이 비슷하더라도 `status`, `processingStatus`, `riskLevel`, `score`는 목적이 다르므로 정규화 단계에서 명확히 나누어야 합니다.

---

### 22. 카테고리 하위 필터를 학교 전용 로직으로만 만들면 확장성이 떨어지는 문제

#### 문제 상황

처음에는 `학교` 카테고리를 `전체 / 초·중·고 / 대학교`로만 나누면 충분해 보였지만, 이후 `치안·안전`, `세탁`, `운동시설`, `소음주의`, `문화시설` 같은 카테고리도 같은 방식으로 세부 필터가 필요해졌습니다.

#### 원인

하위 필터 상태와 지도 필터 로직이 `schoolFilter`, `schoolLevel`처럼 학교 전용 이름에 묶이면, 다른 카테고리를 추가할 때마다 별도 분기와 prop을 계속 늘려야 하는 구조가 됩니다.

#### 해결 방법

- [MapPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/map/MapPage.jsx)의 하위 필터 상태를 `subFilters` 객체로 일반화했습니다.
- 실시간 지도 [InfraMap.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/InfraMap.jsx)와 목업 지도 [MockInfraMap.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/map/MockInfraMap.jsx) 모두 `subFilter` prop을 받아 `poi.subCategory` 기준으로 필터링하도록 통일했습니다.
- 학교 데이터는 기존 호환을 위해 `schoolLevel`도 유지하되, 내부적으로는 `subCategory`에도 같은 값을 넣어 일반 필터 흐름을 타도록 맞췄습니다.

#### 결과

학교뿐 아니라 새로 추가한 생활 인프라 카테고리들도 같은 하위 필터 UI와 지도 필터 로직을 공유하게 되었습니다.

#### 재발 방지

- 특정 카테고리 하나만 보고 상태 이름과 prop 이름을 짓기보다, 향후 다른 카테고리에도 적용될 가능성이 있으면 `subCategory`, `subFilter`처럼 일반화된 이름을 쓰는 것이 안전합니다.
- 실시간 API 데이터와 목업 데이터는 같은 필드 구조를 갖도록 맞춰야 테스트 환경과 실제 환경의 UX 차이를 줄일 수 있습니다.

---

### 23. 업로드 페이지 영문 라벨만 다른 폰트처럼 보이는 문제

#### 문제 상황

모바일 웹에서 등기부등본/임대차계약서 업로드 페이지의 `ZIPT DEED`, `ZIPT CONTRACT` 영문 라벨이 다른 페이지와 다른 폰트처럼 보였습니다.

#### 원인

업로드 폼 wrapper에 `fontFamily: "sans-serif"`가 인라인으로 지정되어 있어, 전역 Pretendard 기반 폰트 토큰 대신 브라우저 기본 sans-serif가 일부 영역에 적용되었습니다.

#### 해결 방법

- [UploadForm.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/analysis/UploadForm.jsx)와 [ContractUploadForm.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/components/contract/ContractUploadForm.jsx)의 불필요한 인라인 `fontFamily` 지정 값을 제거했습니다.

#### 결과

업로드 페이지의 영문 라벨과 히어로 텍스트가 다른 페이지와 동일한 폰트 흐름으로 렌더링됩니다.

#### 재발 방지

- 특정 페이지에서만 폰트가 달라 보이면 CSS module보다 인라인 style을 먼저 확인해야 합니다.

---

## 2026.07.06

### 24. React Query 캐시 키의 데이터타입(String vs Number) 불일치로 인한 일정 알림 토글 갱신 누락

#### 문제 상황

임대차계약서 상세 결과 페이지에서 "일정 알림 켜기/끄기" 토글을 눌렀을 때, API 요청은 정상(200 OK)적으로 완료되지만 마이페이지로 이동했을 때 알림 스위치나 리마인더 정보가 갱신되지 않고 그대로 멈춰 있는 동기화 누락 현상이 발생했습니다.

#### 원인

1. 마이페이지 분석 이력 조회 시에는 백엔드 응답에서 유래한 **숫자형(`Number`)** `contractId`를 React Query 키인 `['contracts', 15]` 로 설정하여 캐시하고 있었습니다.
2. 반면 상세 결과 페이지 진입 시에는 URL 라우터(`useParams`)로부터 반환된 **문자열형(`String`)** `contractId`를 그대로 캐시 키 `['contracts', '15']` 로 사용하고 있었습니다.
3. 이로 인해 `useContractTrackingUpdate` 훅이 작동한 뒤 `onSettled`에서 캐시 무효화(`invalidateQueries`)를 할 때 `variables.contractId` (문자열형 `"15"`) 기준으로 무효화를 호출하여, 정작 마이페이지의 캐시 `['contracts', 15]` (숫자형)는 새로고침 대상에서 제외되어 예전 상태가 계속 렌더링되었던 것입니다.

#### 해결 방법

- [useContract.js](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/hooks/useContract.js)에서 React Query 캐시 키를 설정 및 갱신하는 모든 부분에서 `contractId` 를 `Number(contractId)` 로 감싸 **숫자형(Number)으로 엄격하게 통일**했습니다.

#### 결과

- 알림 토글 변경 시 마이페이지 목록 및 D-day 위젯에 실시간으로 정보 갱신이 반영됩니다.

#### 재발 방지

- URL 파라미터로 추출된 ID는 항상 문자열 타입이므로, 전역 API 응답(숫자형) 및 캐시 스토어와 비교/무효화할 때는 데이터타입 형변환을 명시적으로 거쳐 캐시 키의 원치 않는 분할을 방지해야 합니다.

---

### 25. 마이페이지 대시보드 위험도 분포 수평 막대그래프(SpectrumBar) 미출력 오류

#### 문제 상황

마이페이지 안심 대시보드의 "위험도 스펙트럼 분포" 백분율 텍스트(예: 안전 47% / 위험 53%)는 잘 표기되지만, 그 사이를 채워야 할 삼색(초록, 노랑, 빨강) 수평 막대그래프가 투명한 회색 빈 칸으로 나타났습니다.

#### 원인

인라인 스타일의 배경색 지정 시 프로젝트 테마에 실재하지 않는 무효한 변수명인 `var(--safe-500)` 및 `var(--danger-500)` 을 참조하여 렌더링이 투명하게 처리되었기 때문입니다.

#### 해결 방법

- [MyPage.jsx](file:///C:/KOSTA_Projects/4_ZIPT_Project/front_zipt/src/pages/mypage/MyPage.jsx) 내 인라인 스타일의 배경색 지정을 정식 토큰인 `var(--safe)` 와 `var(--danger)` 로 복원했습니다.

#### 결과

- 위험도 점유 백분율에 따라 수평 막대차트의 삼색 비주얼이 정상적으로 예쁘게 노출됩니다.

#### 재발 방지

- 글로벌 CSS 테마 변수를 사용할 때는 `tokens.scss` 등의 정의 파일을 검증하여 실재하는 정식 토큰 명칭인지 크로스 체크를 해야 합니다.

---

### 26. 백엔드 비동기 계약 분석 시 MySQL `processing_status` Enum 값 불일치로 인한 `Data truncated` 분석 중단 오류

#### 문제 상황

올바른 임대차계약서 이미지/PDF 파일을 업로드하여 정상 분석 플로우를 시작했음에도 불구하고, 즉각 비동기 백그라운드 태그 분석이 중단되며 화면상에는 어떠한 원인 상세 정보 없이 일괄 `처리실패`로 표기되는 에러가 발생했습니다.

#### 원인

1. 백엔드 자바 비동기 로직(`ContractAsyncProcessor`)이 실행되면서 진행 단계를 다이나믹하게 추적하기 위해 `ContractProcessingStatus` 중 신규 추가된 `OCR_EXTRACTING`, `AI_EXTRACTING`, `CHECKLIST_GENERATING` 상태 값으로 DB 갱신을 지속 시도했습니다.
2. 하지만 실제 구축된 MySQL 데이터베이스(`contracts` 테이블)의 `processing_status` 컬럼은 이전 버전 기준인 `ENUM('COMPLETED', 'FAILED', 'PROCESSING')` 3가지 상태만 가질 수 있도록 엄격하게 고정되어 있었습니다.
3. 이로 인해 새로운 상태 문자열이 DB로 들어갈 때마다 `Data truncated for column 'processing_status' at row 1` SQL 예외가 발생하여, 비동기 연산 스레드 전체가 비정상 예외 종료되고 `FAILED` 상태로 뻗어버린 것이었습니다.

#### 해결 방법

- 로컬 Docker MySQL 데이터베이스 컨테이너에 다이렉트로 접속하여 `contracts` 테이블의 컬럼 규격을 백엔드 엔티티의 최신 Enum 전체 후보군을 포함하도록 확장 변경했습니다.
- **적용 SQL**:
  `ALTER TABLE contracts MODIFY COLUMN processing_status ENUM('COMPLETED', 'FAILED', 'PROCESSING', 'OCR_EXTRACTING', 'AI_EXTRACTING', 'CHECKLIST_GENERATING');`

#### 결과

- 새로운 상세 전이 상태들이 문제없이 정상 보존되며, 임대차계약서 이미지 업로드 시 처리 상태 중단 없이 AI 분석 완료까지 매끄럽게 연결됩니다.

#### 재발 방지

- 백엔드 코드 단에서 엔티티 Enum 값의 명칭을 추가하거나 변경할 때는, 실제 런타임에 연동되는 데이터베이스 스키마(MySQL DDL 파일 등)에도 Enum 정의 정합성을 반드시 함께 동기화해 주어야 쿼리 단계의 실시간 Data Truncated 예외를 막을 수 있습니다.

---


### 27. 마이페이지 대시보드 그리드 카드 간 시각적 높이 불균형 및 여백 낭비 오류


#### 문제 상황

마이페이지 안심 대시보드 화면 진입 시, 좌측의 "내 분석 대시보드" 카드(통계 + 스펙트럼 바 2단)와 우측의 "계약 일정 알림" 카드(D-day 리스트)의 세로 높이가 서로 맞지 않아 시각적 불균형을 이루고, 사용자가 알림을 1건만 등록했을 경우 우측 카드의 넓은 하단 여백이 텅 비어 보이는 레이아웃 결함이 있었습니다.


#### 원인

1. 총 분석/이번 달/위험 등 3대 핵심 수치 지표 배너(`metricsWrapper`)가 좌측 카드 상단에 꽂혀 있어 좌측 카드의 물리적 높이가 과도하게 팽창했습니다.

2. 반면 우측 카드는 단일 위젯 카드로 구성되어 등록된 계약 일정이 적을 시 카드 하단이 그대로 방치되어 공간 활용도 측면에서 비효율적이었습니다.


#### 해결 방법

* 좌측 카드에서 3대 수치 배너를 분리하여 **우측 카드의 상단**으로 이관시켰습니다.

* 이를 통해 좌측 카드는 넓은 가로폭을 시원하게 활용해 유형별 스펙트럼 바 2줄만 보여주는 **안심 스펙트럼 전용 카드**로 재탄생시켰습니다.

* 우측 카드는 상단에 `분석 수치 배너`를, 하단에 `D-day 리스트`를 수직 배치하여 정보 밀도를 균일하게 채웠습니다.


#### 결과

* 좌측 카드와 우측 카드의 세로 픽셀 높이가 정확히 딱 맞아떨어져 극도의 시각적 안도감과 세련된 대시보드 완성도를 달성했습니다.


#### 재발 방지

* 2열 대시보드 그리드 카드를 기획할 때는 콘텐츠의 가변적인 데이터 개수(D-day 건수 등)를 감안하여, 카드 간의 높이 비율(Aspect ratio)과 여백의 낭비가 일어나지 않도록 상하/좌우 균형 재배치 시나리오를 설계해야 합니다.


---


## 2026.07.06 트러블슈팅 요약

* **24. React Query 캐시 키 데이터타입 불일치 해결**: `contractId`를 `Number`형으로 명시적 형변환하여 상세 리포트와 마이페이지 간 알림 설정이 새로고침 없이 즉시 동기화되도록 조치함.

* **25. 마이페이지 대시보드 위험도 수평 그래프 미출력 해결**: 인라인 CSS의 배경색 지정 시 실재하지 않던 디자인 토큰(`--safe-500`, `--danger-500`)을 올바른 테마 토큰(`--safe`, `--danger`)으로 복원하여 삼색 막대가 나타나도록 해결함.

* **26. 백엔드 AI 분석 중단 장애 해결**: 자바 비동기 상태 상세 단계 갱신 시 MySQL Enum 제약으로 일어난 `Data truncated` 예외를 ALTER TABLE 쿼리로 Enum 범위를 확장 동기화하여 완벽 해결함.

* **27. 마이페이지/홈 대시보드 그리드 카드 비대칭 및 여백 낭비 해결**: 좌측 카드의 3대 수치 배너를 우측 카드로 분리 이관하여 좌우 카드의 높이를 픽셀 단위로 일치시키는 시각적 밸런스를 확보하고 가시성을 향상함.
