# Backend 트러블슈팅 로그

## 2026.06.24

### 1. 기존 작업 브랜치와 최신 dev 차이가 커서 작업 기준 재정리

#### 문제 상황

기존 `feature/terms` 작업 브랜치에는 용어 사전 기능 외에도 여러 변경이 섞여 있을 가능성이 있었습니다.

사용자의 핵심 요구사항은 다음과 같았습니다.

- 내가 작업한 용어 사전 기능 외에는 최신 `dev` 브랜치와 동일해야 함
- 불필요한 코드나 팀원 작업 영역 변경을 최소화해야 함

#### 원인

기존 작업 브랜치가 최신 dev를 기준으로 깔끔하게 분기된 상태인지 확실하지 않았습니다.
또한 이전 작업 중 게시판, SecurityConfig, JWT 등 다른 기능과 관련된 변경이 섞일 수 있는 상황이었습니다.

#### 해결 방법

- 최신 `dev` 브랜치를 새 폴더에 clone했습니다.
- 새 프로젝트 경로에서 `feature/terms` 브랜치를 다시 생성했습니다.
- 용어 사전 기능에 필요한 코드만 순차적으로 다시 반영했습니다.

#### 결과

- 작업 범위를 용어 사전 기능으로 제한할 수 있었습니다.
- `SecurityConfig.java`, `S3Config.java` 등 팀원 작업 가능성이 높은 파일은 수정하지 않았습니다.
- 최종 diff 리뷰에서 용어 관련 파일 외 불필요한 변경이 섞이지 않았음을 확인했습니다.

#### 재발 방지

- 기능 브랜치 작업 전 반드시 최신 dev 기준인지 확인합니다.
- 작업 범위가 넓어졌거나 충돌 가능성이 크면 새 clean branch에서 필요한 변경만 다시 반영하는 것이 안전합니다.

---

### 2. 엑셀 파일을 런타임에서 직접 읽을지 여부 고민

#### 문제 상황

용어 사전 데이터 원본은 사용자가 정제한 `.xlsx` 파일이었습니다.
초기에는 서버에서 이 파일을 직접 읽어 DB에 적재할 수도 있었습니다.

#### 원인

런타임에서 `.xlsx`를 직접 읽으려면 엑셀 파싱 라이브러리 의존성이 필요합니다.
또한 배포 환경에 원본 엑셀 파일을 포함하거나 별도로 관리해야 하므로 운영이 복잡해질 수 있습니다.

#### 해결 방법

- 엑셀은 원본 데이터로 보관했습니다.
- 애플리케이션에는 정제된 JSON seed만 포함하기로 결정했습니다.
- `src/main/resources/seed/terms.json` 파일을 생성해 앱 시작 시 읽도록 구성했습니다.

#### 결과

- 런타임 의존성을 늘리지 않았습니다.
- 배포 시 JSON 리소스만 포함하면 되도록 단순화했습니다.
- seed loader와 테스트가 JSON 기준으로 안정적으로 동작하도록 만들었습니다.

#### 재발 방지

- 정적 기준 데이터는 가능한 한 앱에서 바로 읽기 쉬운 JSON, YAML, CSV 등으로 변환해 사용하는 것이 좋습니다.
- 원본 엑셀은 데이터 출처/관리용으로 보관하고 런타임 로직에는 넣지 않는 편이 안전합니다.

---

### 3. 한글이 PowerShell 출력에서 깨져 보이는 문제

#### 문제 상황

PowerShell에서 Java 파일을 `Get-Content`로 확인했을 때 한글 주석과 문자열이 깨져 보였습니다.
예를 들어 카테고리 라벨, 주석, ErrorCode 메시지가 정상 한글이 아니라 깨진 문자로 출력되었습니다.

#### 원인

파일 자체가 깨진 것이 아니라 PowerShell 콘솔의 인코딩 표시 문제였습니다.
실제 파일은 UTF-8로 저장되어 있었고, Python으로 unicode escape를 확인했을 때 한글 코드포인트가 정상임을 확인했습니다.

#### 해결 방법

- 단순 터미널 출력만 보고 파일이 깨졌다고 판단하지 않았습니다.
- Python으로 파일을 UTF-8로 읽고 unicode escape 형태로 확인했습니다.
- BOM 여부도 별도로 검사했습니다.

#### 결과

- 실제 파일 내용은 정상 UTF-8임을 확인했습니다.
- 이후 파일 저장 시 UTF-8 no BOM을 명시적으로 사용했습니다.

#### 재발 방지

- Windows PowerShell에서 한글 깨짐이 보이면 파일 인코딩 자체와 콘솔 표시 문제를 분리해서 확인해야 합니다.
- Java 소스 파일은 UTF-8 no BOM으로 저장하는 것이 안전합니다.

---

### 4. ErrorCode 수정 중 잘못된 문자열 이스케이프가 들어간 문제

#### 문제 상황

`ErrorCode.java`에 `TERM_NOT_FOUND`, `INVALID_TERM_SEARCH_CONDITION`을 추가하는 과정에서 PowerShell 문자열 치환이 잘못되어 `` `r`n `` 문자가 코드에 그대로 들어갔습니다.

예상:

```java
TERM_NOT_FOUND(404, "존재하지 않는 용어입니다"),
INVALID_TERM_SEARCH_CONDITION(400, "올바르지 않은 용어 검색 조건입니다"),
```

문제:

```java
TERM_NOT_FOUND(...),`r`n    INVALID_TERM_SEARCH_CONDITION(...),
```

#### 원인

PowerShell 문자열 안에서 백틱 이스케이프와 따옴표 처리가 섞이면서 줄바꿈 문자가 실제 줄바꿈이 아니라 문자열 그대로 삽입되었습니다.

#### 해결 방법

- `git diff`로 이상 삽입을 확인했습니다.
- `ErrorCode.java`를 정상 내용으로 다시 저장했습니다.
- UTF-8 no BOM으로 저장해 BOM 문제도 함께 방지했습니다.

#### 결과

- `ErrorCode.java`에는 용어 관련 ErrorCode 두 개만 정상 추가되었습니다.
- `git diff --check`를 통과했습니다.

#### 재발 방지

- PowerShell에서 복잡한 치환을 할 때는 백틱과 따옴표 조합을 주의해야 합니다.
- 작은 변경이라도 `git diff`로 즉시 확인해야 합니다.
- 가능하면 `apply_patch` 또는 명확한 파일 재작성 방식을 사용합니다.

---

### 5. TermController.java BOM으로 인한 컴파일 실패

#### 문제 상황

`TermController.java` 추가 후 `compileJava` 실행 시 다음 오류가 발생했습니다.

```text
illegal character: '\ufeff'
class, interface, enum, or record expected
```

오류 위치는 파일 첫 줄의 `package` 선언이었습니다.

#### 원인

`TermController.java` 파일 맨 앞에 UTF-8 BOM 문자가 들어갔습니다.
Java 컴파일러가 BOM을 불법 문자로 인식해 package 선언을 정상적으로 읽지 못했습니다.

#### 해결 방법

- `TermController.java`와 관련 수정 파일을 UTF-8 no BOM으로 다시 저장했습니다.
- BOM 검사 스크립트를 실행해 BOM 파일이 남아 있지 않은지 확인했습니다.
- 다시 `compileJava`를 실행했습니다.

#### 결과

- `compileJava`가 성공했습니다.
- 최종 리뷰에서도 BOM 파일이 없음을 확인했습니다.

#### 재발 방지

- Windows 환경에서 `Set-Content -Encoding UTF8` 사용 시 BOM이 들어갈 수 있으므로 주의합니다.
- Java 소스 파일은 UTF-8 no BOM으로 저장합니다.
- 컴파일 실패 메시지에 `\ufeff`가 보이면 BOM 문제를 우선 의심합니다.

---

### 6. 테스트 클래스 생성자 주입 실패

#### 문제 상황

`TermFeatureIntegrationTest` 실행 시 모든 테스트가 실패했습니다.

오류 메시지:

```text
No ParameterResolver registered for parameter [TermSeedDataLoader seedDataLoader]
```

#### 원인

JUnit Jupiter가 테스트 클래스 생성자 파라미터를 Spring bean으로 자동 주입하지 못했습니다.
테스트 클래스 생성자에 Spring 주입 설정이 명확하지 않았기 때문에 일반 JUnit 파라미터로 해석되었습니다.

#### 해결 방법

- 생성자 주입 대신 필드 주입 방식으로 변경했습니다.
- `@Autowired`를 사용해 `TermSeedDataLoader`, `TermService`, `RealEstateTermRepository`를 주입했습니다.
- 테스트용 `ObjectMapper`는 `@TestConfiguration`으로 제공했습니다.

#### 결과

- `TermFeatureIntegrationTest`가 정상 실행되었습니다.
- seed loader, repository, service 흐름을 H2 기반으로 검증할 수 있었습니다.

#### 재발 방지

- Spring Boot slice test에서 생성자 주입을 사용할 경우 테스트 확장 설정을 명확히 해야 합니다.
- 간단한 테스트에서는 필드 주입이 설정 문제를 줄일 수 있습니다.

---

### 7. 전체 테스트 실패 원인 분리

#### 문제 상황

용어 테스트는 통과했지만 전체 테스트 명령은 실패했습니다.

실패 명령:

```bash
./gradlew.bat test
```

실패 테스트:

```text
BackZiptApplicationTests.contextLoads()
```

#### 원인

전체 애플리케이션 컨텍스트 로딩 중 `S3Config`에서 다음 설정값을 찾지 못했습니다.

```text
cloud.aws.credentials.access-key
```

즉, 용어 기능 문제가 아니라 기존 전역 설정 문제였습니다.

#### 해결 방법

- 전체 테스트 실패 리포트를 확인했습니다.
- 실패 원인이 `S3Config` 설정값 누락임을 확인했습니다.
- 용어 기능 자체는 별도 테스트 명령으로 분리해 검증했습니다.

검증 명령:

```bash
./gradlew.bat test --tests com.zipt.domain.term.*
```

#### 결과

- 용어 기능 테스트는 성공했습니다.
- 전체 테스트 실패는 기존 S3 설정 문제로 분리했습니다.
- 이 내용은 별도 문서와 최종 로그에 기록했습니다.

#### 재발 방지

- 전체 컨텍스트 테스트는 외부 설정값이 필요한 bean 때문에 실패할 수 있습니다.
- 기능 단위 검증은 slice test 또는 standalone MockMvc 테스트로 분리하는 것이 좋습니다.
- S3Config 같은 외부 연동 설정은 test profile에서 dummy 설정 또는 조건부 bean 처리가 필요할 수 있습니다.

---

### 8. SecurityConfig를 건드리지 않고 API 테스트를 진행해야 했던 문제

#### 문제 상황

`/api/terms/**` API는 실제 서버에서 인증 대상이 될 가능성이 있었습니다.
하지만 사용자가 `SecurityConfig.java`는 팀원 작업 코드를 따로 확인하겠다고 했기 때문에 수정하지 않아야 했습니다.

#### 원인

현재 `SecurityConfig`에서는 `/api/terms/**`에 대해 명시적인 `permitAll()` 설정이 없었습니다.
실제 서버 실행 후 호출하면 인증이 필요할 수 있었습니다.

#### 해결 방법

- `SecurityConfig.java`는 수정하지 않았습니다.
- 컨트롤러의 라우팅과 응답 구조는 `MockMvc standaloneSetup`으로 검증했습니다.
- 전역 SecurityFilterChain을 띄우지 않고 `TermController`와 `GlobalExceptionHandler`만 조합해 테스트했습니다.

#### 결과

- Security 설정을 건드리지 않고도 용어 API 컨트롤러 동작을 검증했습니다.
- `/api/terms/**` 공개 여부는 후속 확인 사항으로 문서화했습니다.

#### 재발 방지

- 인증/인가 설정이 팀 공통 영역이면 기능 브랜치에서 임의 수정하지 않는 것이 안전합니다.
- 컨트롤러 기능 검증은 standalone MockMvc 테스트로 분리할 수 있습니다.

---

### 9. slug 명칭과 실제 term-001 ID 의미가 맞지 않는 문제

#### 문제 상황

초기 API는 `/api/terms/{slug}` 형태였지만 실제 조회 값은 `term-001` 같은 공식 용어 ID였습니다.

#### 원인

`slug`라는 이름은 보통 URL 친화적인 사람이 읽을 수 있는 문자열을 의미합니다.
하지만 현재 데이터는 용어를 slug화한 값이 아니라 `term-001` 형식의 내부 식별자였습니다.

#### 해결 방법

- `slug` 명칭을 제거했습니다.
- 공식 용어 식별자를 `termId`로 관리하도록 변경했습니다.
- API path variable도 `{slug}`에서 `{id}`로 변경했습니다.
- 관련 메서드명도 모두 변경했습니다.
  - `findBySlug` → `findByTermId`
  - `getBySlug` → `getByTermId`
  - `getSlug` → `getTermId`

#### 결과

- API 의미가 데이터 구조와 일치하게 되었습니다.
- `/api/terms/term-001`은 공식 용어 ID 조회로 해석됩니다.
- 최종 검색에서 `slug`, `getBySlug`, `findBySlug` 잔여 참조가 없음을 확인했습니다.

#### 재발 방지

- URL path variable 이름은 실제 식별자 의미와 맞춰야 합니다.
- 내부 ID를 쓰는 경우 `id`, `termId`처럼 명확한 이름을 사용하는 것이 좋습니다.

---

### 10. Seed loader가 부분 적재 상태를 복구하지 못하는 문제

#### 문제 상황

초기 seed loader는 DB에 데이터가 하나라도 있으면 seed 적재를 전체 스킵했습니다.

```java
if (repository.count() > 0) {
    return;
}
```

이 방식은 DB에 일부 데이터만 들어간 상태에서는 나머지 seed 데이터를 복구하지 못합니다.

#### 원인

전체 count만 보고 적재 여부를 판단했기 때문에, 어떤 용어가 존재하고 어떤 용어가 누락되었는지 알 수 없었습니다.

#### 해결 방법

- `existsByTermId(String termId)`를 repository에 추가했습니다.
- seed JSON의 각 term을 확인하면서 DB에 없는 `termId`만 추가하도록 변경했습니다.
- 기존 데이터는 덮어쓰지 않도록 했습니다.

#### 결과

- 일부 seed 데이터가 누락된 상태에서도 loader 재실행 시 누락 항목만 보강됩니다.
- 기존 DB에 이미 존재하는 용어는 보존됩니다.
- 테스트에서 `term-001`을 삭제해 79개 상태를 만든 뒤 loader 재실행 시 80개로 복구되는 것을 검증했습니다.

#### 재발 방지

- seed loader는 전체 count보다 자연키 또는 공식 ID 기준으로 idempotent하게 동작해야 합니다.
- 기준 데이터 적재는 “없는 데이터만 추가” 또는 명확한 upsert 정책을 가져야 합니다.

---

### 11. 부분 적재 복구 테스트에서 unique 제약 위반 발생

#### 문제 상황

부분 적재 복구 테스트를 처음 작성했을 때 `term-001`을 직접 저장한 뒤 seed loader를 실행하려 했습니다.
하지만 테스트 실행 시 `term_id` unique 제약 위반이 발생했습니다.

오류 요약:

```text
Unique index or primary key violation on REAL_ESTATE_TERMS(TERM_ID)
```

#### 원인

`TermSeedDataLoader`는 `ApplicationRunner`이기 때문에 테스트 컨텍스트 시작 시 자동으로 실행되었습니다.
즉, 테스트 메서드가 시작되기 전에 이미 seed 80개가 DB에 들어간 상태였습니다.
그 상태에서 다시 `term-001`을 저장하려고 해서 unique 제약에 걸렸습니다.

#### 해결 방법

- 테스트 시나리오를 변경했습니다.
- 직접 `term-001`을 insert하는 대신, 이미 적재된 `term-001`을 삭제해 79개 상태를 만든 뒤 seed loader를 재실행했습니다.

#### 결과

- 실제 부분 누락 상태를 더 자연스럽게 재현했습니다.
- loader 재실행 후 80개로 복구되는 것을 검증했습니다.

#### 재발 방지

- `ApplicationRunner` 또는 `CommandLineRunner` bean은 테스트 컨텍스트 로딩 시 자동 실행될 수 있습니다.
- seed 관련 테스트에서는 컨텍스트 시작 시점에 데이터가 이미 들어갔는지 고려해야 합니다.

---

### 12. category 응답이 label 문자열만 내려가던 문제

#### 문제 상황

초기 category 응답은 다음처럼 한글 label 문자열만 내려갔습니다.

```json
"category": "보증금 안전·위험 예방"
```

목록 응답의 categories도 문자열 배열이었습니다.

#### 원인

프론트가 화면에 보여줄 label과 API 요청에 사용할 code가 분리되어 있지 않았습니다.
label도 요청값으로 허용하긴 했지만, 명세상 안정적이지 않았습니다.

#### 해결 방법

- `TermResponse.CategoryResponse` record를 추가했습니다.
- category 응답을 `{ code, label }` 구조로 변경했습니다.
- 목록 응답의 `categories`도 같은 구조로 변경했습니다.

#### 결과

응답 예시:

```json
{
  "code": "DEPOSIT_SAFETY",
  "label": "보증금 안전·위험 예방"
}
```

- 프론트는 화면에는 `label`을 보여주고, 필터 요청에는 `code`를 사용할 수 있습니다.
- 관련 컨트롤러 테스트와 서비스 테스트를 수정해 검증했습니다.

#### 재발 방지

- enum 기반 필터 값은 API 응답에 code와 label을 함께 제공하는 것이 좋습니다.
- 화면 표시용 값과 요청 파라미터 값을 분리하면 프론트 연동이 안정적입니다.

---

### 13. PowerShell heredoc 문법 오류

#### 문제 상황

Python 스크립트를 PowerShell에서 실행할 때 Bash 스타일 heredoc을 사용해 오류가 발생했습니다.

문제 명령 형태:

```bash
python - <<'PY'
...
PY
```

PowerShell에서는 해당 문법을 지원하지 않아 파싱 오류가 발생했습니다.

#### 원인

Bash heredoc 문법을 PowerShell 환경에서 그대로 사용했습니다.

#### 해결 방법

- 짧은 스크립트는 `python -c`로 실행했습니다.
- 긴 스크립트는 `C:\Tmp` 아래 임시 `.py` 파일로 저장한 뒤 실행했습니다.

#### 결과

- JSON 점검, 코드 치환, 파일 인코딩 확인 작업을 정상 진행했습니다.

#### 재발 방지

- Windows PowerShell에서는 Bash heredoc을 사용하지 않습니다.
- 긴 Python 스크립트는 임시 파일로 작성해 실행하는 것이 안전합니다.

---

### 14. apply_patch 사용 실패로 인한 대체 파일 수정 방식 사용

#### 문제 상황

일부 파일 수정 과정에서 `apply_patch` 사용이 안정적으로 동작하지 않았습니다.

#### 원인

현재 Windows sandbox 환경에서 patch 적용 도구가 일관되게 동작하지 않는 문제가 있었습니다.

#### 해결 방법

- 작은 수정은 PowerShell 또는 Python 스크립트로 안전하게 처리했습니다.
- 파일 저장 시 UTF-8 no BOM을 명시했습니다.
- 수정 후 항상 `git diff`, `compileJava`, 용어 테스트로 결과를 검증했습니다.

#### 결과

- 필요한 코드 수정은 모두 반영했습니다.
- BOM, 잘못된 줄바꿈, 잔여 문자열 문제를 최종 점검했습니다.

#### 재발 방지

- Windows 환경에서 자동 패치 도구가 불안정하면, 작은 스크립트로 수정하고 즉시 diff를 확인합니다.
- 파일 저장 인코딩을 명확히 지정합니다.

---

### 15. 최종 diff 리뷰에서 untracked 파일이 diff stat에 보이지 않는 문제

#### 문제 상황

`git diff --stat`를 실행했을 때 새로 추가한 용어 도메인 파일과 seed 파일이 보이지 않았습니다.

#### 원인

새 파일들은 아직 git에 stage되지 않은 untracked 상태였습니다.
`git diff --stat`는 기본적으로 tracked 파일 변경만 보여줍니다.

#### 해결 방법

- `git ls-files --others --exclude-standard`를 사용해 untracked 파일 목록을 별도로 확인했습니다.
- `git status --short --branch`로 tracked 변경과 untracked 파일을 함께 확인했습니다.

#### 결과

- 최종 변경 파일 전체 목록을 확인했습니다.
- 커밋 전 포함해야 할 파일을 명확히 파악했습니다.

#### 재발 방지

- 커밋 전 리뷰에서는 `git diff`만 보지 말고 `git status`와 untracked 목록도 함께 확인해야 합니다.

---

## 2026.06.25

### 1. BOM 및 줄바꿈 불일치로 인한 전체 파일 수정 오인 문제

#### 문제 상황
- 깃허브 PR 페이지 상에서 수정된 파일들의 거의 모든 소스 코드 라인이 통째로 삭제되었다가 다시 추가된 녹색(`+`) 상태로 인식되어, 깃 작성자 히스토리가 깨지고 코드 리뷰가 불가능한 현상이 발생했습니다.

#### 원인
- 윈도우 파워쉘 환경에서 텍스트 리다이렉션으로 인해 파일 맨 앞 3바이트에 UTF-8 BOM 마크가 붙거나, 개행 문자가 CRLF로 강제 변환되면서 깃이 파일의 전체 라인이 달라진 것으로 오인하였습니다.

#### 해결 방법
- `git reset --soft origin/dev`를 통해 로컬의 지저분한 이전 커밋 이력을 초기화하였습니다.
- 문제 파일들을 에디터를 통해 BOM 마크가 제거된 순수 UTF-8 및 LF 개행 형식으로 정규화하여 저장했습니다.
- `git add --renormalize .`를 실행하여 깃 내의 개행 정합성을 정교하게 교정 및 스테이징한 뒤 단일 커밋을 발행하여 원격에 강제 푸시(`git push -f`) 하였습니다.

#### 결과
- 통째로 삭제 후 생성되었던 깃허브 diff가 정상화되어, 실제로 수정된 몇몇 라인만 깨끗하게 표시되는 단일 커밋 정화 상태를 확보했습니다.

#### 재발 방지
- 윈도우 환경에서 파워쉘 등을 통한 파일 수정 시 반드시 인코딩 형식(BOM 미포함 UTF-8)과 개행 형식(LF)을 사전에 확인해야 합니다.
- 파일 인코딩 이슈가 생기면 커밋하기 전 `git diff`를 통해 라인 전체가 수정 표시로 뜨는지 모니터링해야 합니다.

---

### 2. 동기화 API 추가 시 스프링 시큐리티 인가 충돌 문제

#### 문제 상황
- 용어 사전 API `/api/terms/**`를 추가한 후 비로그인 일반 사용자가 조회 시 401 Unauthorized 에러가 발생하는 것과, 어드민 전용 동기화 API(`/api/terms/sync`)를 안전하게 제공해야 하는 요구사항이 상충되었습니다.

#### 원인
- `SecurityConfig.java`에 용어 관련 엔드포인트에 대한 허용 설정이 없어 기본 시큐리티 필터에 의해 모든 일반 사용자의 조회가 제한되었기 때문입니다.

#### 해결 방법
- `SecurityConfig.java`에 `.requestMatchers("/api/terms/**").permitAll()` 규칙을 추가하여 용어 관련 경로는 통과되도록 조치했습니다.
- 어드민 전용 동기화 API의 호출 통제를 위해 스프링 시큐리티의 역할 시스템 대신, 컨트롤러 내부 로직에서 `@RequestHeader("X-Admin-Token")`을 직접 받아 자격 증명을 2차 검증(Custom Validation)하도록 우회 구현했습니다.

#### 결과
- 비로그인 일반 사용자는 로그인 없이 용어를 원활히 조회/검색할 수 있게 되었으며, 동기화 API는 헤더 비밀키를 가진 관리자만 안전하게 호출할 수 있는 구조를 마련했습니다.

#### 재발 방지
- 공용 정보 제공 API와 관리 목적 API가 동일한 프리픽스(`/api/terms/**`)를 공유할 때는, 시큐리티 설정을 일괄 허용하되 관리 전용 컨트롤러 로직 단에서 명시적 토큰 검증을 하도록 통제 경계를 설계하는 것이 유연합니다.
---

### 16. 등기부등본 분석 실패가 처리완료로 표시되는 문제

#### 문제 상황

CloudFront 배포 환경에서 로그인 후 등기부등본 분석 페이지에 잘못된 서류를 업로드했을 때, 분석이 실패해야 하지만 화면에는 이전 분석 결과처럼 정상 결과 카드가 표시되고 이력에는 `[주소 인식 불가]`와 함께 `처리완료`로 남는 문제가 발생했습니다.

#### 원인

- `OcrService`에서 주소 파싱에 실패해도 예외를 던지지 않고 `주소 인식 불가` 문자열을 넣어 정상 `RegistryData`를 반환했습니다.
- `AnalysisService`는 파싱 결과의 유효성을 검증하지 않고 계속 시세 조회, LTV 계산, 보증보험 판별을 수행했습니다.
- 저장 시 `processingStatus`를 항상 `AnalysisProcessingStatus.COMPLETED`로 지정했습니다.
- `AnalysisProcessingStatus.FAILED` enum은 존재했지만 등기부 분석 파이프라인에서 실제로 사용되지 않았습니다.
- 실패 사유를 담을 `processingErrorMessage` 필드가 등기부 분석 결과 엔티티에는 없었습니다.

#### 해결 방법

- `OcrService`에 등기부등본 문서 검증을 추가했습니다.
  - OCR 텍스트 공백 검증
  - 등기부등본 핵심 키워드 검증
  - 주소 파싱 실패 검증
- `ErrorCode.INVALID_REGISTRY_DOCUMENT`를 추가했습니다.
- `AnalysisResult`에 `processing_error_message` 컬럼 매핑을 추가했습니다.
- `AnalysisResponse`, `AnalysisHistoryResponse`에 `processingErrorMessage`를 추가했습니다.
- `AnalysisService`에서 분석 실패 시 `FAILED` 상태의 이력을 저장하고 실패 응답을 반환하도록 했습니다.
- `getDetail()`에서 실패 결과는 LTV/보험 계산을 다시 수행하지 않도록 분기했습니다.

#### 결과

- 잘못된 서류 또는 주소 인식 실패는 더 이상 `COMPLETED`로 저장되지 않습니다.
- 프론트는 `processingStatus === "FAILED"`와 `processingErrorMessage`를 기준으로 실패 화면을 표시할 수 있습니다.
- 실패한 분석 이력도 조회/삭제 대상으로 다룰 수 있습니다.

#### 남은 확인 사항

- 운영 DB에 아래 컬럼 추가 필요:

```sql
ALTER TABLE analysis_results
ADD COLUMN processing_error_message VARCHAR(1000);
```

- 전체 테스트 실패는 기존 테스트 환경 문제로 별도 정리가 필요합니다.
  - MySQL dialect 설정과 H2 테스트 DB 충돌
  - `S3Service` 테스트 빈 누락
  - H2에서 MySQL 전용 DDL 처리 실패

#### 재발 방지

- 분석 파이프라인에서는 "기본 문자열"로 실패를 숨기지 말고, 필수 필드 검증 실패 시 명시적으로 실패 상태를 만들어야 합니다.
- `PROCESSING`, `COMPLETED`, `FAILED` 상태 enum을 추가했다면 실제 저장/응답 흐름에서 모두 사용되는지 확인해야 합니다.
- 프론트 화면 상태는 주소 문자열이나 점수 값이 아니라 `processingStatus`를 기준으로 분기해야 합니다.

---