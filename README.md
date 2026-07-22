# ZIPT (집트) — 전세 계약 안전 분석 및 인프라 통합 서비스

> **사회초년생과 부동산 초보자를 위한 등기부등본 위험 분석 및 선호 생활 인프라 통합 제공 서비스**

<br>

## 📌 프로젝트 소개

**ZIPT**는 복잡하고 어려운 부동산 등기부등본 정보를 직관적인 언어로 풀어 설명하고, 매물의 전세사기 위험도를 사전에 분석하여 사용자가 안전하게 전세 계약을 진행하도록 돕는 플랫폼입니다. 이에 더해 매물 주변의 다양한 생활 인프라 정보와 사용자의 개인 선호 조건을 결합한 개인 맞춤형 지도를 제공합니다.

### ⚠️ 기존 시장의 문제점 및 ZIPT의 해결책
1. **어려운 법률 용어**: 등기부등본의 갑구·을구, 근저당권, 선순위 채권 등 어려운 용어 $\rightarrow$ **ZIPT의 쉬운 말 번역 및 행동 지침 제공**
2. **위험도 직접 계산의 한계**: 보증금과 근저당권을 공시가 대비 비교 분석 $\rightarrow$ **LTV, 선순위채권 비율을 기준으로 한 자동 위험 등급 산출**
3. **파편화된 정보 검색**: 매물 따로, 주변 인프라(학군, 교통, 병원 등) 따로 조회 $\rightarrow$ **Kakao Maps 기반의 개인 선호도 필터 인프라 지도 제공**

---

## 🛠️ 주요 기능 (Key Features)

### 1. 등기부등본 OCR 분석 & 위험도 계산
* **Naver Clova OCR**을 활용해 등기부등본의 갑구/을구 스캔 이미지에서 근저당권 설정, 선순위 채권액 정보를 추출합니다.
* 보증금, 선순위채권, 공시가격을 대조하여 LTV(담보인정비율)를 구하고, **HUG 전세보증보험 가입 가능 조건** 및 위험 등급(안전/주의/위험)을 판별합니다.

### 2. 부동산 초보자 전용 용어 사전 연동
* 런타임에 호출되는 어려운 부동산 단어들(근저당권 등)을 즉시 조회하여 팝업이나 쉬운 설명으로 제공합니다.
* Spring Boot 기동 시 자동으로 적재되는 용어 시드 데이터 기반으로 안정적인 사전 조회를 지원합니다.

### 3. 개인 선호 인프라 지도 (Infra Map)
* **Kakao Maps SDK**와 공공 데이터를 연동하여 매물 주변의 교통, 대형마트, 병원, 힐링 인프라 정보를 시각화합니다.
* 사용자가 본인의 우선순위(예: 역세권, 병원 필수 등)를 설정하면 가중치를 반영한 매물 점수를 계산해 제공합니다.

---

## ⚙️ 기술 스택 (Tech Stack)

### Client
* **Framework**: React (Vite)
* **Styling**: SCSS (CSS Modules), Tokens 기반 테마
* **Build Tool**: Vite
* **Libraries**: React Router v6, Kakao Maps API

### Server
* **Framework**: Spring Boot (Java 17)
* **Security & Auth**: Spring Security, JWT (Json Web Token)
* **Database**: MySQL, Redis (캐싱 및 토큰 관리)
* **ORM & Data**: Spring Data JPA
* **Cloud Storage**: AWS S3 (서류 및 리포트 저장)
* **External APIs**: Naver Clova OCR API, 국토교통부 실거래가 조회 공공 API

---

## 📐 시스템 아키텍처 (System Architecture)

```mermaid
flowchart LR
    U["사용자"] --> F["React + Vite 프론트엔드"]

    F -->|"OAuth 시작 / JWT API 요청"| B["Spring Boot 백엔드"]
    F -->|"JavaScript SDK"| KM["Kakao Maps"]

    B -->|"OAuth2 Authorization"| KO["Kakao Login"]
    B -->|"JPA"| DB[("MySQL")]
    B -->|"OCR 요청"| OCR["Naver Clova OCR"]
    B -->|"실거래가 조회"| MOLIT["국토교통부 공공 API"]
    B -.->|"캐싱 / 토큰 확장"| REDIS[("Redis")]
    B -.->|"서류·리포트 저장"| S3["AWS S3"]

    P["용어 데이터 파이프라인"] -->|"수집·정제·병합"| T[("용어 데이터")]
    T --> F
    T -.-> B
```

---

## 📂 프로젝트 구조 (Repository Structure)

본 프로젝트는 프론트엔드와 백엔드 및 문서 시스템이 통합 관리되는 모노레포 구조입니다.

```
Final_ZIPT_Project/
├── front_zipt/              # React 프론트엔드 소스 코드
├── back_zipt/               # Spring Boot 백엔드 API 소스 코드
└── documents/               # 정제 완료된 표준 문서 및 기록
    ├── PROJECT_LOG.md       # 메인 문서 통합 인덱스
    ├── TROUBLESHOOTING.md   # 전체 트러블슈팅 색인 (CORS, Router, DB 동기화 등)
    ├── project-log/         # 17개의 날짜별 개발 작업 일지
    ├── info/                # 기획안, PPT 발표 자료, HUG 핵심 용어 사전 정리
    ├── guides/              # 용어 사전 동기화 가이드, 마이그레이션 가이드
    └── plan/                # 마이페이지 및 레이아웃 이관 구현 계획서
```

---

## 🚀 시작하기 (Getting Started)

### Prerequisites
* Java 17 / Gradle
* Node.js v18+ / npm or yarn
* MySQL Database

### 1. Backend 실행
```bash
cd back_zipt
# 환경 변수 및 application.yml 설정 후 기동
./gradlew bootRun
```

### 2. Frontend 실행
```bash
cd front_zipt
npm install
npm run dev
```

---

## 🤝 기여 및 협업 기준

* 모든 문서는 `documents/PROJECT_LOG.md`를 허브로 삼아 연계하며, 날짜별 로그는 `documents/project-log/` 아래에 기록합니다.
* 개발 및 인프라 관련 트러블슈팅은 `documents/TROUBLESHOOTING.md`에 이슈 발생일과 해결 내역을 인덱싱하여 보관합니다.
