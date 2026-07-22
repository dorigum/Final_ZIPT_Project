# 용어 사전 API 남은 확인 사항

작성일: 2026-06-25
대상 브랜치: feature/terms

## 1. SecurityConfig 접근 권한

현재 `/api/terms/**`가 실제 서버에서 인증 없이 열릴지는 아직 확정되지 않았습니다.

용어 사전이 로그인 없이 조회 가능한 공개 기능이라면 `SecurityConfig`에 아래와 같은 허용 정책이 필요합니다.

```java
.requestMatchers("/api/terms/**").permitAll()
```

다만 `SecurityConfig.java`는 팀원 작업 코드와 충돌 가능성이 있으므로, 현재 용어 기능 작업 범위에서는 수정하지 않고 보류합니다.

## 2. 전체 테스트 실패 이슈

용어 기능 관련 테스트는 통과했습니다.

검증 완료 명령:

```bash
./gradlew.bat compileJava
./gradlew.bat test --tests com.zipt.domain.term.*
```

다만 전체 테스트는 기존 전역 설정 문제로 실패합니다.

실패 명령:

```bash
./gradlew.bat test
```

확인된 원인:

- `S3Config`에서 `cloud.aws.credentials.access-key` 설정값을 필수로 요구함
- 테스트 환경에 해당 AWS 설정값이 없어 `BackZiptApplicationTests.contextLoads()`가 실패함

현재 판단:

- 용어 사전 코드 문제는 아님
- PR 설명에 “전체 테스트는 기존 S3 설정값 누락으로 실패, 용어 테스트는 통과”라고 명시하면 좋음
- S3 설정 수정은 용어 기능 범위를 넘어갈 수 있으므로 별도 이슈로 분리 권장

## 3. API 명세 문서화

용어 API 응답 구조가 확정되었으므로 PR 설명 또는 Swagger 문서에 정리하는 것이 좋습니다.

### 목록 조회

```http
GET /api/terms
```

지원 query parameter:

| 이름 | 설명 | 예시 |
| --- | --- | --- |
| `q` | 검색어 | `보증금` |
| `category` | 카테고리 코드 또는 라벨 | `DEPOSIT_SAFETY` |
| `risk` | 위험도 | `neutral` |
| `page` | 페이지 번호 | `0` |
| `size` | 페이지 크기 | `20` |

### 단건 조회

```http
GET /api/terms/{id}
```

예시:

```http
GET /api/terms/term-001
```

### Category 응답 구조

현재 category는 문자열이 아니라 `code`, `label` 구조로 내려갑니다.

```json
{
  "code": "DEPOSIT_SAFETY",
  "label": "보증금 안전·위험 예방"
}
```

프론트 사용 방향:

- 화면 표시: `label`
- 필터 요청: `code`

## 4. DB 마이그레이션 여부

현재 용어 사전 기능은 JPA가 테이블을 생성해주는 개발 환경을 전제로 동작합니다.

생성 대상 테이블:

- `real_estate_terms`
- `term_aliases`

운영 DB 또는 공유 개발 DB에 직접 반영해야 한다면 별도의 DDL 또는 마이그레이션 스크립트가 필요할 수 있습니다.

현재 판단:

- 아직 운영 반영 전이면 필수 작업은 아님
- 팀 DB에 바로 붙이는 단계라면 마이그레이션 파일 작성 여부를 팀과 확인 필요

## 현재 결론

용어 기능 자체의 필수 오류성 이슈는 정리된 상태입니다.

남은 항목은 다음 범주로 분리하는 것이 안전합니다.

1. `SecurityConfig` 공개 API 허용 여부: 팀원 코드 확인 후 결정
2. 전체 테스트 실패: 기존 S3 설정 문제로 별도 이슈 처리
3. API 명세: PR 설명 또는 Swagger에 반영
4. DB 마이그레이션: 운영/공유 DB 반영 시점에 결정