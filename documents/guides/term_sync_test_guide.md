# 부동산 용어 S3 동기화 테스트 가이드

## 2026.06.25

1. 로컬 개발 환경 실행 방법: `back_zipt` 폴더 경로에서 PowerShell 터미널을 열고 `.\gradlew.bat bootRun` 명령을 실행해 로컬 톰캣 서버를 기동시킵니다. 서버는 기본 포트인 `8080` 포트로 실행됩니다.
2. 초기 구동 로그 및 S3 Fallback 동작 확인: AWS 자격 증명이 적용되지 않았거나 S3 버킷 파일이 없는 로컬 환경에서는 서버 기동 시 다음과 같은 콘솔 로그가 찍히는지 확인하여 Fallback 로직의 안정성을 확인합니다.
   - `S3에서 부동산 용어 데이터 동기화를 시도합니다. Key: seed/terms.json`
   - `WARN ... S3 동기화에 실패하여 로컬 백업 리소스(classpath:seed/terms.json)로부터 데이터를 로드합니다. 에러: ...`
   - `INFO ... 로컬 백업 데이터 로드 성공 — 80개 신규 용어 추가 완료`
3. 실제 S3 연동 테스트 준비: 실제 AWS S3 동기화를 검증하려면, PC 환경변수나 `application.yml`에 접근 가능한 `AWS_ACCESS_KEY`와 `AWS_SECRET_KEY`, 그리고 `S3_BUCKET_FILES` 정보를 임시 기입해야 합니다. 그리고 해당 S3 버킷 내 `seed/terms.json` 경로에 테스트할 용어 데이터 JSON 파일을 올려둡니다. (예: 특정 용어의 쉬운 설명 문구를 변경)
4. 어드민 동기화 API(cURL) 테스트 방법: 터미널에서 다음 cURL 명령을 이용하거나 Postman 등의 도구를 사용하여 동기화 API 동작 및 토큰 검증을 테스트합니다.
   - **정상 토큰 요청 (성공 케이스)**
     ```bash
     curl -X POST http://localhost:8080/api/terms/sync \
          -H "X-Admin-Token: zipt-temp-token-2026"
     ```
     - 예상 결과: HTTP Status `200 OK` 및 바디에 갱신 성공한 용어 개수 반환 (예: `{"status": 200, "message": "OK", "data": 80}`)
   - **비정상 토큰 요청 (실패 케이스)**
     ```bash
     curl -X POST http://localhost:8080/api/terms/sync \
          -H "X-Admin-Token: invalid-token-value"
     ```
     - 예상 결과: HTTP Status `401 Unauthorized` 및 에러 메세지 (`인증에 실패했습니다`) 반환
5. 동기화 결과 DB 적재 확인: 동기화 성공 응답을 받은 뒤, 웹 브라우저나 클라이언트에서 기존에 구비된 용어 상세 조회 API(`GET http://localhost:8080/api/terms/{용어ID}`)를 호출해 S3의 변경 내용이 DB에 Upsert 형태로 덮어써져 갱신 완료되었는지 최종 검증합니다.
