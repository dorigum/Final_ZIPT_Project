# Redis 구성 가이드 (팀 공유용)

> 요약: Redis 하나를 **논리 DB 번호로 나눠** 용도별로 격리했습니다.
> **DB 0 = 토큰 블랙리스트**, **DB 1 = 외부 API 응답 캐시**.

---

## 1. 왜 나눴나

| DB | 용도 | 접근 방식 | TTL |
|----|------|-----------|-----|
| **0** | 로그아웃한 AccessToken 블랙리스트 | `StringRedisTemplate` (직접) | 토큰 잔여 만료시간 |
| **1** | 층간소음·시세 등 외부 API 응답 캐시 | `@Cacheable` (자동) | 1시간 |

- 블랙리스트와 캐시는 성격이 완전히 다름 → 같은 DB에 섞이면 관리/디버깅이 어려움
- DB를 나누면 `FLUSHDB`로 캐시만 통째 비우기 등 운영이 쉬움
- 물리 분리라 서로의 키가 섞이지 않음.

---

## 2. 설정이 어디에 있나

### (1) `application.yml` — DB 번호 정의
```yaml
zipt:
  redis:
    cache-database: 1      # 응답 캐시 공용 (noise·시세 등)
    blacklist-database: 0  # AccessToken 블랙리스트 전용
```
> DB 번호를 바꾸려면 **이 yml만** 수정하면 됨. 자바 코드 수정 불필요.

### (2) `RedisProperties.java` — yml 값 매핑
`zipt.redis.*` 값을 자바 객체로 받는 클래스. (`cache-database` ↔ `cacheDatabase` 자동 매핑)

### (3) `RedisConfig.java` — 핵심 설정
- `@EnableCaching` — `@Cacheable` 활성화 (이게 없으면 캐시 자체가 동작 안 함)
- 커넥션 팩토리 2개: `blacklistConnectionFactory`(DB 0), `cacheConnectionFactory`(DB 1)
- `stringRedisTemplate` — `@Qualifier("blacklistConnectionFactory")` → DB 0
- `cacheManager` — `@Qualifier("cacheConnectionFactory")` → DB 1, 값은 JSON 직렬화 + TTL 1h

### (4) `application.yml` autoconfigure exclude — 주의
```yaml
spring:
  autoconfigure:
    exclude:
      - ...PgVectorStoreAutoConfiguration
      - org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration
```
- **Redis Repository 자동설정을 껐음.** 우리는 `@RedisHash`/Redis용 `CrudRepository`를 안 쓰는데,
  이 자동설정이 내부적으로 `redisTemplate` Bean을 요구해서 기동 에러(`redisReferenceResolver`)가 났기 때문.
- ⚠️ **나중에 `@RedisHash`로 객체를 Redis에 저장하는 기능을 쓰게 되면**, 이 exclude 줄을 지우고
  이름이 `redisTemplate`인 Bean을 직접 정의해줘야 함.

---

## 3. 캐시가 실제로 적용된 곳

`NoiseService`:
- `@Cacheable(value = "noiseReport", key = "#address")` — 층간소음 분석
- `@Cacheable(value = "noiseStats", key = "#address")` — 지역 통계

→ 같은 `address`로 재호출 시 메서드를 건너뛰고 Redis(DB 1)에서 반환.
→ 캐시 대상 객체(`NoiseReport`)는 JSON 직렬화됨 (`Serializable` + 기본 생성자 필요).

---

## 4. 블랙리스트 동작 흐름

**쓰기(등록) — 로그아웃 시**
```
AuthController.logout()
  → AuthService.logout()        // 토큰 유효하면
    → TokenBlacklistService.addTokenToBlacklist(token, 잔여TTL)
      → Redis DB 0에 "blacklist:{SHA-256}" 저장
```

**읽기(검사) — 모든 인증 요청마다**
```
Spring Security 필터 체인
  → JwtAuthenticationFilter.doFilterInternal()   // 요청마다 자동 실행
    → tokenBlacklistService.isBlacklisted(token) // DB 0 조회
      → 블랙리스트에 있으면 인증 거부 (로그아웃된 토큰 차단)
```
> JWT는 서버가 강제 무효화할 수 없으므로, 로그아웃된 토큰을 블랙리스트로 별도 차단함.
> 필터는 `SecurityConfig`에서 `new`로 생성하며 `TokenBlacklistService`(@Service Bean)를 생성자로 주입받음.

---

## 5. 로컬 테스트 방법

### 사전 준비
```bash
# Redis 컨테이너 확인 (docker-compose.yml의 zipt-redis)
docker ps | grep redis            # 없으면: docker compose up -d zipt-redis

# 깨끗한 상태로 시작
docker compose exec zipt-redis redis-cli -n 0 FLUSHDB
docker compose exec zipt-redis redis-cli -n 1 FLUSHDB

# 앱 기동
./gradlew bootRun
```
> redis-cli는 컨테이너 안에 이미 있음. 별도 설치 불필요.
> 대화형 접속: `docker compose exec zipt-redis redis-cli` → 안에서 `SELECT 0` / `SELECT 1`로 DB 전환.

### 테스트 순서

| # | 검증 | 방법 | 합격 기준 |
|---|------|------|-----------|
| 0 | 정상 기동 | `./gradlew bootRun` | `redisTemplate`/`redisReferenceResolver` 에러 없이 기동 |
| 1 | 블랙리스트 → DB 0 | 로그인 → **로그아웃** (Authorization 헤더 필수) | `redis-cli -n 0 KEYS '*'` 에 `blacklist:...` 등장 |
| 2 | 로그아웃 토큰 차단 | 로그아웃한 토큰으로 인증 API 호출 | 401/인증 거부 |
| 3 | 캐시 → DB 1 저장 | noise 분석 API 1회 호출 | `redis-cli -n 1 KEYS '*'` 에 `noiseReport::...` 등장 (JSON) |
| 4 | **캐시 히트** | 같은 주소로 2번째 호출 | 로그 `"층간소음 분석 시작..."` 이 2번째엔 **안 찍힘** |
| 5 | DB 격리 | `-n 0` / `-n 1` 각각 조회 | 서로의 키가 안 섞임 |

### 확인 명령 모음
```bash
# 블랙리스트 (DB 0)
docker compose exec zipt-redis redis-cli -n 0 KEYS '*'
docker compose exec zipt-redis redis-cli -n 0 TTL "blacklist:..."   # 양수면 OK

# 캐시 (DB 1)
docker compose exec zipt-redis redis-cli -n 1 KEYS '*'
docker compose exec zipt-redis redis-cli -n 1 GET "noiseReport::..." # {"@class":...} JSON
docker compose exec zipt-redis redis-cli -n 1 TTL "noiseReport::..." # 3600초 근처
```

> ⚠️ 로그아웃 테스트 시 반드시 `Authorization: Bearer <AccessToken>` 헤더를 실어 보낼 것.
> 헤더가 없으면 토큰이 null로 처리되어 블랙리스트에 등록되지 않음.

---

## 6. 운영(prod) 참고

- host/port는 `application-prod.yml`의 `spring.data.redis.host/port`(ElastiCache) 사용.
- `RedisConfig`는 password/TLS가 켜져도 수정 불필요 — yml만 변경하면 됨.
- DB 분리 설정(`zipt.redis.*`)은 dev/prod 공통(`application.yml`)이라 운영에도 동일 적용됨.
