# ════════════════════════════════════════════
# ZIPT 백엔드 Dockerfile
# Spring Boot 3.5 / Java 21 / Gradle
# ════════════════════════════════════════════

# ── 1단계: 빌드 ──────────────────────────
#FROM gradle:8.5-jdk21-alpine AS build
#
#WORKDIR /app

## 의존성 캐싱 (소스 변경 시 재다운로드 방지)
#COPY build.gradle settings.gradle ./
#COPY gradle ./gradle
#RUN gradle dependencies --no-daemon || true
#
## 소스 복사 + 빌드 (테스트 제외)
#COPY src ./src
#RUN gradle bootJar --no-daemon -x test

# ── 2단계: 실행 ──────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 타임존 한국 설정
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone && \
    rm -rf /var/cache/apk/*

# 빌드 결과물 복사
COPY build/libs/*.jar app.jar
#COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

# docker compose
ENTRYPOINT ["java", \
  "-jar", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "app.jar"]
