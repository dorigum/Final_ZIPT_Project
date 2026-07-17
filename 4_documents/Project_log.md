# ZIPT Project Log

ZIPT 프로젝트의 개발 과정과 주요 의사결정을 날짜별로 정리한 문서 목차이다.

## 핵심 문서

- [프로젝트 명세](info/PROJECT_SPECIFICATION.md)
- [트러블슈팅](TROUBLESHOOTING.md)
- [스프링 부트 용어 마이그레이션 가이드](guides/spring-boot-terms-migration.md)
- [프로젝트 회의록](info/플젝_회의록.md)

## 날짜별 개발 기록

- [2026-06-23](project-log/2026-06-23.md): 부동산 용어 사전(Term) API 및 도메인 엔티티, Repository, Service, Controller, Seed DataLoader 개발 및 Null-safety 예외 수정 완료
- [2026-06-22](project-log/2026-06-22.md): back_zipt 원격 dev 브랜치 머지 및 충돌 해결, front_zipt/backend로 관련 백엔드 개선 로직 이식, JWT Refresh Token 재발급 API, 3사 소셜 로그인 연동, 프론트엔드 API 클라이언트 토큰 자동 재발급/재시도 메커니즘 탑재
- [2026-06-21](project-log/2026-06-21.md): 프론트엔드 React Query 확장, 공통 상태 UI 적용, JWT 기반 라우터 인증 보호, back_zipt -> Mockup/backend 머지 및 빌드 충돌 해결, P0 분석 DTO 및 보증금 단위 계약 보강
- [2026-06-20](project-log/2026-06-20.md): 프론트엔드 디렉터리 구조 개편 및 webpack/vite 세팅 조정, 원격 브랜치 통합 및 UI 레이아웃 고도화
- [2026-06-19](project-log/2026-06-19.md): 프로젝트 기획 명세 구체화 및 용어 정리 HUG 데이터 연동 테스트
- [2026-06-18](project-log/2026-06-18.md): 카카오맵 API 실사용 컴포넌트 연동, 카카오 OAuth 콜백 화면 구성 및 백엔드 Spring Security/JWT 기본 의존성 추가

## 작성 기준

1. 구현·수정 내역은 작업 날짜의 문서에 번호형 목록으로 기록한다.
2. 오류 원인과 해결 과정은 날짜별 문서에 기록하고 트러블슈팅 색인에도 연결한다.
3. 실행 방법이 달라지면 기능 설명보다 실행 가이드를 먼저 갱신한다.
