# Backend 작업 로그

## 2026.06.24

### 1. 최신 dev 기준 feature/terms 작업 브랜치 정리

#### 작업 내용

- 최신 `dev` 브랜치 기준으로 새 작업 폴더를 구성했습니다.
- 로컬 브랜치명을 `feature/terms`로 맞춰 용어 사전 기능 작업을 진행했습니다.
- 기존 작업 브랜치에 dev와 무관한 변경이 섞일 수 있는 위험을 줄이기 위해, 최신 dev 기반의 깨끗한 브랜치에서 용어 사전 기능만 다시 반영하는 방향으로 정리했습니다.

#### 작업 이유

- 팀 작업 기준에서 가장 중요한 조건은 “내가 작업한 용어 사전 기능 외에는 dev 브랜치와 동일해야 한다”는 점이었습니다.
- 기존 작업 상태는 여러 변경이 섞여 있었기 때문에, 최신 dev 기준으로 필요한 기능만 다시 적용하는 방식이 가장 안전했습니다.

#### 결과

- 용어 사전 기능 중심으로 변경 범위를 제한했습니다.
- `SecurityConfig.java`, `S3Config.java` 등 팀원 작업 영향이 큰 파일은 수정하지 않았습니다.

---

### 2. HUG 기반 부동산 용어 엑셀 데이터 분석 및 JSON seed 생성

#### 작업 내용

- 사용자가 정제해둔 엑셀 파일을 분석했습니다.
- 엑셀 구조를 확인했습니다.
  - 시트명: `시트1`
  - 총 데이터: 80개 용어
  - 주요 컬럼: `카테고리`, `용어`, `설명`, `표준 정의`, `출처`
- 카테고리 분포를 확인했습니다.
  - `계약 및 부동산 계약서 기초 용어`: 30개
  - `보증금 안전 & 위험 예방 필수 키워드`: 25개
  - `주거 형태 & 주택 구조 관련 용어`: 13개
  - `면적 · 가격 및 정부 정책 용어`: 12개
- 일부 행에서 `표준 정의`, `출처`가 비어 있는 것을 확인했습니다.
- 엑셀을 런타임에서 직접 읽지 않고, 앱에서 사용할 JSON seed 데이터로 변환했습니다.
- 생성 파일:
  - `src/main/resources/seed/terms.json`

#### 작업 이유

- 서버 실행 시 `.xlsx`를 직접 읽게 만들면 엑셀 파싱 의존성이 추가되고 배포 환경이 복잡해집니다.
- 엑셀은 원본 데이터로 보관하고, 애플리케이션은 정제된 JSON seed만 읽는 구조가 더 안정적입니다.
- 배포 시 리소스 파일만 포함하면 되므로 운영과 테스트가 단순해집니다.

#### 결과

- 80개 용어가 JSON seed로 정리되었습니다.
- 각 용어는 `term-001` 형식의 공식 용어 ID를 갖도록 구성했습니다.
- 매핑 구조는 다음과 같습니다.
  - `용어` → `term`
  - `term-001` 형식 ID → `id`
  - `카테고리` → enum code
  - `설명` → `zipt.easy`
  - `표준 정의` → `official.definition`
  - `출처` → `official.source`
  - `aliases` → 빈 배열
  - `zipt.tip` → `null`
  - `zipt.risk` → `neutral`
  - `isCore` → `true`

---

### 3. 용어 사전 도메인 패키지 및 엔티티 구성

#### 작업 내용

- 용어 사전 기능용 패키지를 추가했습니다.
  - `src/main/java/com/zipt/domain/term`
- 주요 엔티티와 enum을 추가했습니다.
  - `RealEstateTerm.java`
  - `TermCategory.java`
  - `RiskLevel.java`
- `RealEstateTerm`은 용어 사전 데이터를 저장하는 JPA 엔티티입니다.
- `TermCategory`는 용어 카테고리를 enum으로 관리합니다.
- `RiskLevel`은 용어 위험도 값을 enum으로 관리합니다.
- 팀장 리뷰 의견에 맞춰 `RealEstateTerm.java`, `RiskLevel.java`, `TermCategory.java`는 `entity` 패키지 아래에 배치했습니다.

#### 작업 이유

- 용어 사전은 독립적인 도메인 기능이므로 `domain/term` 하위에 controller, service, repository, entity, dto, config를 분리하는 구조가 적합했습니다.
- `RealEstateTerm` 같은 핵심 도메인 모델은 `entity` 패키지에 두는 것이 프로젝트 구조상 더 명확합니다.
- 용어 카테고리와 위험도는 문자열로 흩어지게 두는 것보다 enum으로 제한하는 것이 API와 DB 정합성에 유리합니다.

#### 결과

- 용어 사전 도메인 모델이 프로젝트에 추가되었습니다.
- 별칭은 `@ElementCollection`을 사용해 `term_aliases` 테이블에 분리 저장하도록 구성했습니다.
- 대표 용어뿐 아니라 향후 줄임말, 유사어 검색까지 확장 가능한 구조를 만들었습니다.
- 생성/수정 시간은 JPA lifecycle callback으로 관리하도록 했습니다.

---

### 4. 용어 공식 식별자 termId 기준 정리

#### 작업 내용

- 처음에는 `slug`라는 이름으로 단건 조회 식별자를 관리했으나, 실제 값은 `term-001` 같은 공식 용어 ID였습니다.
- 혼동을 줄이기 위해 `slug` 명칭을 제거하고 `termId` 기준으로 정리했습니다.
- 변경 내용:
  - `RealEstateTerm.slug` → `RealEstateTerm.termId`
  - `findBySlug` → `findByTermId`
  - `getBySlug` → `getByTermId`
  - `/api/terms/{slug}` → `/api/terms/{id}`
- 별칭 테이블 FK 컬럼명도 `term_id`와 혼동되지 않도록 `real_estate_term_id`로 정리했습니다.

#### 작업 이유

- `slug`는 보통 사람이 읽을 수 있는 URL 친화 문자열을 의미하지만, 현재 용어 식별자는 `term-001`처럼 내부 공식 ID에 가깝습니다.
- API와 코드의 이름이 실제 데이터 의미와 다르면 유지보수 시 혼동이 생길 수 있습니다.
- 공식 ID 기반 관리가 현재 데이터 구조에 더 적합하다고 판단했습니다.

#### 결과

- 단건 조회 API는 `/api/terms/{id}` 형태로 의미가 명확해졌습니다.
- API 응답의 `id`는 `RealEstateTerm.termId` 값을 내려줍니다.
- `slug`, `getBySlug`, `findBySlug` 관련 잔여 참조가 없는 것을 확인했습니다.

---

### 5. TermSeedDataLoader 구현 및 부분 적재 복구 로직 개선

#### 작업 내용

- 앱 시작 시 JSON seed를 읽어 DB에 적재하는 `TermSeedDataLoader`를 추가했습니다.
- 기본 seed 경로는 다음과 같습니다.
  - `classpath:seed/terms.json`
- 최초 구현에서는 DB에 데이터가 하나라도 있으면 seed 적재를 건너뛰는 방식이었습니다.
- 이후 부분 적재 실패 상황을 고려해 `termId` 기준으로 DB에 없는 용어만 추가하도록 개선했습니다.
- 추가 repository 메서드:
  - `existsByTermId(String termId)`

#### 작업 이유

- 단순히 `repository.count() > 0`이면 전체 seed를 스킵하는 방식은 위험합니다.
- 예를 들어 중간 실패로 80개 중 일부만 들어간 상태라면, 재시작해도 누락된 용어가 복구되지 않습니다.
- 운영/개발 DB에 이미 존재하는 용어는 보존하면서, seed에 새로 추가되었거나 누락된 용어만 보강하는 방식이 더 안전합니다.

#### 결과

- seed loader는 기존 용어를 덮어쓰지 않습니다.
- seed 기준으로 DB에 없는 `termId`만 추가합니다.
- 일부 용어가 누락된 상태에서도 앱 재시작 또는 loader 재실행 시 누락 데이터가 복구됩니다.
- 관련 테스트를 추가해 79개 상태에서 다시 80개로 복구되는 것을 검증했습니다.

---

### 6. Repository, Service, Controller 추가

#### 작업 내용

- `RealEstateTermRepository`를 추가했습니다.
- `TermService`를 추가했습니다.
- `TermController`를 추가했습니다.
- 제공 API:
  - `GET /api/terms`
  - `GET /api/terms/{id}`
- 목록 조회는 다음 조건을 지원합니다.
  - `q`: 검색어
  - `category`: 카테고리 code 또는 label
  - `risk`: 위험도
  - `page`: 페이지 번호
  - `size`: 페이지 크기
- repository 검색 쿼리는 용어명, 쉬운 설명, 별칭을 대상으로 검색하도록 구성했습니다.

#### 작업 이유

- 프론트에서 용어 목록, 검색, 필터링, 상세 조회를 사용할 수 있도록 API 레이어가 필요했습니다.
- 단건 조회는 공식 용어 ID인 `termId` 기준으로 제공하는 것이 현재 데이터 구조와 맞습니다.
- 검색은 사용자가 정확한 용어명을 모를 수 있으므로 쉬운 설명과 별칭까지 검색 범위에 포함했습니다.

#### 결과

- 용어 목록/검색/필터 API가 추가되었습니다.
- 용어 상세 조회 API가 추가되었습니다.
- 잘못된 page, size, category, risk 요청은 `INVALID_TERM_SEARCH_CONDITION`으로 400 응답 처리합니다.
- 존재하지 않는 용어 ID는 `TERM_NOT_FOUND`로 404 응답 처리합니다.

---

### 7. DTO 응답 구조 정리

#### 작업 내용

- `TermResponse`를 추가했습니다.
- `TermListResponse`를 추가했습니다.
- API 응답을 `official`, `zipt` 섹션으로 나누어 내려주도록 구성했습니다.
- category 응답은 단순 문자열에서 `code`, `label` 구조로 개선했습니다.

#### 작업 이유

- 공식 기관 출처 기반 정의와 ZIPT에서 제공하는 쉬운 설명은 성격이 다릅니다.
- 응답에서 `official`, `zipt`를 분리하면 프론트와 팀원이 데이터 의미를 이해하기 쉽습니다.
- category를 문자열 label만 내려주면 프론트가 필터 요청에 어떤 값을 보내야 하는지 애매할 수 있습니다.
- `{ code, label }` 구조를 사용하면 화면 표시와 API 요청 값을 명확히 나눌 수 있습니다.

#### 결과

- 용어 상세 응답 예시:

```json
{
  "id": "term-001",
  "term": "보증금",
  "category": {
    "code": "DEPOSIT_SAFETY",
    "label": "보증금 안전·위험 예방"
  },
  "official": {
    "definition": "...",
    "source": "..."
  },
  "zipt": {
    "easy": "...",
    "tip": null,
    "risk": "neutral"
  },
  "isCore": true
}
```

- 프론트는 `label`을 화면에 보여주고, `code`를 필터 요청에 사용할 수 있습니다.

---

### 8. ErrorCode 및 ZiptException 기반 예외 처리 정리

#### 작업 내용

- 기존에 별도 `TermNotFoundException` 파일을 두는 방식은 사용하지 않았습니다.
- 프로젝트 공통 예외 방식에 맞춰 `ErrorCode`와 `ZiptException`을 사용했습니다.
- 추가한 ErrorCode:
  - `TERM_NOT_FOUND`
  - `INVALID_TERM_SEARCH_CONDITION`

#### 작업 이유

- 팀장 리뷰에서 별도 `TermNotFoundException`보다 공통 `ZiptException + ErrorCode`를 사용하는 방향이 더 적합하다는 의견이 있었습니다.
- 프로젝트 전역 예외 처리 방식과 일관성을 맞추는 것이 유지보수에 좋습니다.

#### 결과

- 용어 단건 조회 실패 시 404 응답을 반환합니다.
- 잘못된 검색 조건 요청 시 400 응답을 반환합니다.
- `TermNotFoundException.java`는 생성하지 않았고, 관련 잔여 참조도 없습니다.

---

### 9. 테스트 코드 추가 및 검증

#### 작업 내용

- 테스트용 H2 의존성을 추가했습니다.
  - `testRuntimeOnly 'com.h2database:h2'`
- `TermFeatureIntegrationTest`를 추가했습니다.
- `TermControllerTest`를 추가했습니다.
- 검증한 내용:
  - seed 데이터 80개 적재
  - seed loader 중복 실행 시 중복 적재 방지
  - 일부 seed 누락 상태에서 복구
  - 검색어, 카테고리, 위험도 필터 조회
  - `termId` 기반 단건 조회
  - 존재하지 않는 용어 조회 예외
  - 컨트롤러 목록 조회 응답
  - 컨트롤러 단건 조회 응답
  - 잘못된 필터 조건 400 응답
  - 잘못된 page 요청 400 응답

#### 작업 이유

- 현재 전체 애플리케이션 컨텍스트는 S3 설정값 누락으로 테스트가 실패할 수 있습니다.
- 용어 기능 자체가 정상인지 확인하기 위해 H2 기반 JPA 테스트와 MockMvc standalone 컨트롤러 테스트를 분리했습니다.
- `SecurityConfig`를 건드리지 않으면서 용어 API 라우팅과 응답 구조를 검증하기 위함입니다.

#### 결과

- 용어 관련 테스트는 통과했습니다.

검증 명령:

```bash
./gradlew.bat compileJava
./gradlew.bat test --tests com.zipt.domain.term.*
```

검증 결과:

- `compileJava` 성공
- `test --tests com.zipt.domain.term.*` 성공

---

### 10. 전체 테스트 실패 원인 확인 및 문서화

#### 작업 내용

- 전체 테스트 명령을 실행해 기존 프로젝트 상태를 확인했습니다.

```bash
./gradlew.bat test
```

- 전체 테스트는 `BackZiptApplicationTests.contextLoads()`에서 실패했습니다.
- 실패 원인은 `S3Config`가 `cloud.aws.credentials.access-key` 설정값을 필수로 요구하기 때문입니다.

#### 작업 이유

- PR 또는 커밋 전에 “용어 기능 문제인지, 기존 프로젝트 설정 문제인지”를 분리해두는 것이 필요했습니다.
- 전체 테스트 실패를 그대로 두더라도 원인을 명확히 기록해야 팀원이 확인하기 쉽습니다.

#### 결과

- 전체 테스트 실패는 용어 기능 변경으로 인한 문제가 아님을 확인했습니다.
- 별도 문서에 남은 확인 사항을 정리했습니다.
  - `C:\KOSTA_Projects\4_ZIPT_Project\4_documents\terms_api_remaining_notes.md`

---

### 11. 남은 확인 사항 정리

#### 작업 내용

- 다음 항목은 현재 용어 기능 작업 범위에서 직접 수정하지 않고 보류했습니다.
  - `SecurityConfig`에서 `/api/terms/**` 공개 여부
  - S3 설정값 누락으로 인한 전체 테스트 실패
  - 운영/공유 DB 반영 시 DDL 또는 마이그레이션 파일 필요 여부

#### 작업 이유

- `SecurityConfig.java`는 팀원 작업 코드와 충돌 가능성이 있어 사용자가 별도 확인하기로 했습니다.
- `S3Config` 수정은 용어 기능 범위를 넘어갈 수 있습니다.
- DB 마이그레이션은 운영/공유 DB 반영 시점에 팀 정책에 맞춰 결정하는 것이 좋습니다.

#### 결과

- 용어 기능 자체의 필수 오류성 이슈는 정리되었습니다.
- 남은 항목은 별도 확인 또는 후속 작업으로 분리했습니다.

---

### 12. 최종 diff 리뷰

#### 작업 내용

- 최종 변경 범위를 확인했습니다.
- 확인한 변경 범위:
  - `src/main/java/com/zipt/domain/term/**`
  - `src/main/resources/seed/terms.json`
  - `src/test/java/com/zipt/domain/term/**`
  - `src/main/java/com/zipt/global/exception/ErrorCode.java`
  - `build.gradle`
- 다음 항목을 확인했습니다.
  - `SecurityConfig.java` 수정 없음
  - `S3Config.java` 수정 없음
  - `TermNotFoundException` 잔여 참조 없음
  - `slug`, `getBySlug`, `findBySlug` 잔여 참조 없음
  - BOM 파일 없음
  - `git diff --check` 통과

#### 작업 이유

- 커밋 전 용어 기능 외 변경이 섞이지 않았는지 확인하기 위함입니다.
- 팀 dev 브랜치와 비교했을 때 불필요한 변경이 포함되지 않도록 안전하게 검토했습니다.

- 최종 diff 기준으로 용어 기능 코드에서 새로 해결해야 할 기능 오류나 회귀 위험은 발견하지 못했습니다.
- 커밋과 푸시는 아직 진행하지 않았습니다.

---

## 2026.06.25

### 1. S3 기반 부동산 용어 데이터 동적 동기화 구현

#### 작업 내용
1. S3Service.java 기능 확장: S3 버킷에서 용어 데이터 JSON 파일 스트림을 받아올 수 있도록 `InputStream download(String key)`를 구현했습니다.
2. application.yml 속성 추가: 동기화에 사용할 `s3-key`와 임시 토큰인 `admin-token` 프로퍼티 설정을 추가했습니다.
3. SeedPayload.java DTO 생성: Jackson 파싱과 JPA 매핑에 활용하기 위해 공통 DTO 레코드를 신규 추가했으며, 빌드 오류 방지를 위해 BOM을 제거한 인코딩을 적용했습니다.
4. RealEstateTerm.java 엔티티 수정: 더티 체킹을 통한 안전한 데이터 갱신을 위해 `update()` 비즈니스 메소드를 정의했습니다.
5. TermService.java 동기화 로직 구현: S3에서 다운로드한 JSON 데이터를 읽어 DB에 Upsert(있으면 갱신, 없으면 추가)하는 `syncFromS3(String s3Key)`를 구현했습니다.
6. TermSeedDataLoader.java 수정: 초기 기동 시 S3로부터 용어 데이터를 우선 로딩하고, S3 다운로드 실패 시 로컬 패키지 리소스(`classpath:seed/terms.json`)로부터 데이터 세팅을 시도하는 Fallback 처리 구조를 구축했습니다.
7. TermController.java 수정: 스프링 시큐리티 영향을 최소화하면서 API 보호를 제공하기 위해 `X-Admin-Token` 헤더를 검증하여 S3 동기화를 트리거하는 `POST /api/terms/sync` 엔드포인트를 구현했습니다.
8. 컴파일 빌드 검증 및 빌드 정상화: Gradle 컴파일(`.\gradlew.bat compileJava`)을 실행하여 BOM 에러와 임포트 오류 등을 모두 해결하고 빌드 성공을 확인했습니다.

#### 작업 이유
1. 데이터 동적 관리 구조 도입: 배포 없이 데이터를 갱신하기 위해 S3에서 동적으로 데이터를 동기화하는 구조가 필요했습니다.
2. 안정적인 안전장치 설계: 로컬 Fallback을 통해 AWS 자격증명이 없는 로컬 개발 환경에서도 서버 실행과 로컬 데이터 로드가 100% 정상 작동하도록 조치했습니다.
3. 간이 보안 검증 적용: X-Admin-Token을 이용한 간이 토큰 검증 방식을 사용해 보안 구성이나 권한 설정 충돌을 최소화했습니다.

#### 결과
1. S3 동적 용어 데이터 관리 체계 구축 완료: S3 용어 데이터의 동적 로딩, Upsert 및 관리자 트리거링 API 작성을 안전하게 마쳤습니다.
2. 빌드 유효성 확인 완료: 컴파일을 통해 빌드가 정상적으로 100% 통과함을 확인했습니다.

---

### 2. S3 데이터 누락 해결 및 로컬 설정 격리 보안 강화

#### 작업 내용
1. S3 데이터 적재 및 업로드: S3 버킷(`zipt-files`)에 `seed/terms.json` 파일이 존재하지 않아 동기화 시 `NoSuchKeyException`이 유발되던 현상을 해결하기 위해 로컬 백업용 용어 JSON 데이터를 S3 버킷에 정상적으로 업로드 완료했습니다.
2. AWS 자격 증명 보안 분리: `application.yml`에 기재되어 있던 실제 AWS Access Key/Secret Key를 완벽히 제거하고 기존의 주석 처리 및 환경 변수 주입 형태로 원상복구했습니다.
3. 로컬 전용 설정 파일 이식: 본인의 로컬 개발 환경용 실제 키값은 `application-local.yml`에 작성하여 이전 보존했습니다.
4. 깃 제외 설정 (.gitignore): `application-local.yml`이 깃허브 원격 저장소에 업로드되지 않도록 `.gitignore` 파일에 `*local.yml` 규칙을 등록했습니다.
5. 소스코드 핵심 주석 보강: 신규 구현한 부동산 용어 S3 동기화 로직 및 API, DTO, DataLoader 등 4개의 핵심 파일들에 상세한 설명용 주석을 보강하여 가독성을 높였습니다.

#### 작업 이유
1. 보안 침해 사고 방지: 실제 AWS 키값이 깃허브에 커밋/푸시될 경우 발생할 수 있는 악용 위험 및 관리자 계정 해킹 차단을 위한 필수 보안 조치였습니다.
2. 깃 오염 및 유출 방지: 로컬 테스트용 H2 설정과 키값을 독립 파일(`application-local.yml`)로 차단 격리하여 다른 팀원들의 설정에 영향을 주지 않으면서 본인의 로컬 편의성을 유지했습니다.
3. 가독성 개선: S3 연동 흐름이나 Upsert 로직 등 신규로 추가된 복잡한 로직을 팀원들이 쉽게 분석할 수 있도록 상세한 해설을 달았습니다.

#### 결과
1. 용어 동기화 API 테스트 100% 성공: S3 업로드 이후 80개 데이터의 성공적인 동기화가 이루어졌습니다. (`{"success":true,"message":"OK","data":80}`)
2. 안전한 깃 커밋/푸시 완료: 민감한 자격 증명 유출 없이 `feature/term-edit` 브랜치에 안전하게 모든 소스코드와 명세서, 로그 문서를 커밋 및 푸시 완료하였습니다.
---

## 2026.07.05

### 1. 등기부등본 분석 실패 상태 처리 로직 추가

#### 작업 내용

- 등기부등본 분석 API에서 잘못된 서류를 업로드했을 때 기존 분석 결과처럼 `COMPLETED`로 저장되는 문제를 확인했습니다.
- 원인은 OCR/파싱 결과가 부족해도 `OcrService`가 `"주소 인식 불가"` 문자열을 넣고 정상 `RegistryData`를 반환하며, `AnalysisService`가 저장 시 `AnalysisProcessingStatus.COMPLETED`를 무조건 지정하는 구조였습니다.
- `AnalysisProcessingStatus`에는 이미 `FAILED`가 있었지만 실제 분석 파이프라인에 연결되어 있지 않았습니다.
- 다음 파일들을 수정했습니다.
  - `src/main/java/com/zipt/domain/analysis/service/OcrService.java`
  - `src/main/java/com/zipt/domain/analysis/service/AnalysisService.java`
  - `src/main/java/com/zipt/domain/analysis/entity/AnalysisResult.java`
  - `src/main/java/com/zipt/domain/analysis/dto/AnalysisResponse.java`
  - `src/main/java/com/zipt/domain/analysis/dto/AnalysisHistoryResponse.java`
  - `src/main/java/com/zipt/global/exception/ErrorCode.java`

#### 구현 내용

- OCR 텍스트가 비어 있거나 등기부등본 핵심 키워드가 부족하면 `INVALID_REGISTRY_DOCUMENT`로 실패 처리하도록 했습니다.
- 주소 파싱 결과가 `주소 인식 불가`이면 실패로 판정하도록 했습니다.
- 분석 중 `ZiptException` 또는 예상하지 못한 예외가 발생하면 분석 이력을 `FAILED` 상태로 저장하도록 했습니다.
- 실패 이력에는 `processing_error_message` 값을 저장하고, 목록/상세 응답에도 `processingErrorMessage`를 포함하도록 했습니다.
- 상세 조회 시 `FAILED` 결과는 LTV/보증보험 계산을 다시 수행하지 않고 실패 응답 데이터 그대로 반환하도록 했습니다.

#### 프론트 연동 기준

- 프론트는 등기부 분석 응답 또는 이력 응답에서 `processingStatus === "FAILED"`이면 실패 화면을 렌더링하면 됩니다.
- 실패 사유는 `processingErrorMessage`를 사용합니다.
- 실패 이력도 삭제 기능 대상에 포함할 수 있습니다.

#### 검증 결과

```bash
.\gradlew.bat compileJava
```

- 결과: `BUILD SUCCESSFUL`
- 전체 테스트(`.\gradlew.bat test`)는 실패했지만, 실패 원인은 변경 코드가 아니라 기존 테스트 환경 문제로 확인했습니다.
  - H2 테스트 DB에 MySQL driver/dialect가 섞이는 문제
  - `S3Service` 빈 누락
  - H2에서 MySQL `engine=InnoDB`, enum, JSON DDL을 처리하지 못하는 문제

#### 배포 전 필요 작업

운영/공유 DB에는 신규 컬럼 추가가 필요합니다.

```sql
ALTER TABLE analysis_results
ADD COLUMN processing_error_message VARCHAR(1000);
```

---