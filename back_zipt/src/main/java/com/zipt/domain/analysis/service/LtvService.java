package com.zipt.domain.analysis.service;

import com.zipt.domain.analysis.dto.InsuranceResult;
import com.zipt.domain.analysis.dto.LtvResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class LtvService {

    /**
     * LTV 계산 + 최종 위험 점수
     * LTV = (선순위채권 + 전세보증금) / 시세 × 100
     * 60% 기준으로 전세사기 가능성 판단
     */
    public LtvResult calculate(long priorityAmount,
                               long deposit,
                               long marketPrice) {
        if (marketPrice == 0) {
            throw new IllegalArgumentException("시세 데이터 없음");
        }

        // ── LTV 계산 ──────────────────────────────────────────
        double ltv = (double)(priorityAmount + deposit) / marketPrice * 100;

        // ── 위험 등급 (LTV 기준) ───────────────────────────────
        String riskLevel = ltv <= 60 ? "SAFE"
                : ltv <= 80 ? "WARNING"
                  :              "DANGER";

        // ── 위험 요인 ──────────────────────────────────────────
        List<String> factors = new ArrayList<>();
        if (priorityAmount > marketPrice * 0.5)
            factors.add("선순위 채권이 시세의 50% 초과 — 경매 시 보증금 회수 어려움");
        if (deposit > marketPrice * 0.8)
            factors.add("전세보증금이 시세의 80% 초과 — 깡통전세 의심");
        if (ltv > 100)
            factors.add("총 채권액이 시세 초과 — 보증금 전액 손실 위험");

        // ── 최종 점수 계산 ─────────────────────────────────────
        int riskScore = calcRiskScore(ltv);

        // ── 등급 기준 ──────────────────────────────────────────
        // 85~100점 🟢 프리미엄 안심 (LTV 낮음, 선순위 없음)
        // 60~84점  🟡 황색 유의   (LTV 55% 전후)
        // 60점 미만 🔴 적색 경고  (LTV 높음)
        String scoreGrade = riskScore >= 85 ? "PREMIUM"
                : riskScore >= 60 ? "CAUTION"
                  :                   "DANGER";

        return LtvResult.builder()
                .ltvRatio(Math.round(ltv * 10) / 10.0)
                .riskLevel(riskLevel)
                .riskScore(riskScore)
                .scoreGrade(scoreGrade)
                .totalPriorityAmount(priorityAmount)
                .depositAmount(deposit)
                .marketPrice(marketPrice)
                .riskFactors(factors)
                .build();
    }

    /**
     * HUG 전세보증보험 가입 가능 여부 판별
     * 3대 공식 + 5개 조건 체크
     */
    public InsuranceResult checkInsurance(long deposit,
                                          long marketPrice,
                                          long officialPrice,
                                          long priority,
                                          String propertyType) {
        List<InsuranceResult.ConditionCheck> conds = new ArrayList<>();
        List<String> fails = new ArrayList<>();

        // ① HUG 부채비율 = (선순위 + 보증금) / 공시가격 × 100 → 90% 미만
        double hugDebtRatio = (double)(priority + deposit) / officialPrice * 100;
        boolean c1 = hugDebtRatio < 90;
        conds.add(InsuranceResult.ConditionCheck.builder()
                .name("HUG 부채비율 (합격: 90% 미만)")
                .standard("90% 미만")
                .actual(String.format("%.1f%%", hugDebtRatio))
                .passed(c1).build());
        if (!c1) fails.add(String.format("HUG 부채비율 %.1f%% 초과", hugDebtRatio));

        // ② 선순위 채권 비율 = 선순위 / 공시가격 × 100 → 60% 이하
        double priorityRatio = (double) priority / officialPrice * 100;
        boolean c2 = priorityRatio <= 60;
        conds.add(InsuranceResult.ConditionCheck.builder()
                .name("선순위 채권 비율 (60% 이하)")
                .standard("60% 이하")
                .actual(String.format("%.1f%%", priorityRatio))
                .passed(c2).build());
        if (!c2) fails.add(String.format("선순위 채권 비율 %.1f%% 초과", priorityRatio));

        // ③ 총 LTV = (선순위 + 보증금) / 시세 × 100 → 100% 이하
        double totalLtv = (double)(priority + deposit) / marketPrice * 100;
        boolean c3 = totalLtv <= 100;
        conds.add(InsuranceResult.ConditionCheck.builder()
                .name("총 LTV (100% 이하)")
                .standard("100% 이하")
                .actual(String.format("%.1f%%", totalLtv))
                .passed(c3).build());
        if (!c3) fails.add(String.format("총 LTV %.1f%% 초과", totalLtv));

        // ④ 보증금 한도 (수도권 7억)
        boolean c4 = deposit <= 700_000_0000L;
        conds.add(InsuranceResult.ConditionCheck.builder()
                .name("보증금 한도 (수도권 7억)")
                .standard("7억 이하")
                .actual(formatWon(deposit))
                .passed(c4).build());
        if (!c4) fails.add("보증금 7억 초과");

        // ⑤ 담보인정비율 (아파트 150% / 빌라 140%)
        double colRatio      = "아파트".equals(propertyType) ? 1.5 : 1.4;
        long   maxByOfficial = (long)(officialPrice * colRatio);
        boolean c5 = deposit <= maxByOfficial;
        conds.add(InsuranceResult.ConditionCheck.builder()
                .name("담보인정비율 (공시가 × " + (int)(colRatio * 100) + "%)")
                .standard(formatWon(maxByOfficial) + " 이하")
                .actual(formatWon(deposit))
                .passed(c5).build());
        if (!c5) fails.add("담보인정비율 초과");

        boolean eligible = fails.isEmpty();
        String rec = eligible
                ? "전세보증보험(HUG) 가입 가능합니다. khug.or.kr에서 최종 확인하세요."
                : "가입 불가 — " + String.join(" / ", fails);

        return InsuranceResult.builder()
                .eligible(eligible)
                .recommendation(rec)
                .hugDebtRatio(Math.round(hugDebtRatio * 10) / 10.0)
                .priorityRatio(Math.round(priorityRatio * 10) / 10.0)
                .totalLtv(Math.round(totalLtv * 10) / 10.0)
                .conditions(conds)
                .build();
    }

    /**
     * 최종 위험 점수 계산 (5 ~ 100점)
     *
     * LTV 기반 점수
     *   LTV 40% 이하  → 100점
     *   LTV 40~60%    → 100 ~ 60점 (선형 감소)
     *   LTV 60~80%    → 60  ~ 30점 (선형 감소)
     *   LTV 80% 초과  → 30점 이하  (최소 5점)
     *
     * TODO 추후 패널티 추가 예정
     *   주택 유형 패널티: 아파트 0점 / 빌라 -5점 / 다가구 -10점
     *   임대인 리스크 패널티: 임대사업자 -5점 / 가등기 -15점 / 가처분 -15점
     *   HUG 패널티: HUG 부채비율 80% 이상 -5점 / 90% 이상 -20점
     */
    private int calcRiskScore(double ltv) {
        double ltvScore;
        if      (ltv <= 40) ltvScore = 100;
        else if (ltv <= 60) ltvScore = 100 - (ltv - 40) * 2.0;
        else if (ltv <= 80) ltvScore = 60  - (ltv - 60) * 1.5;
        else                ltvScore = Math.max(5, 30 - (ltv - 80) * 1.25);

        // TODO 패널티 적용 (추후)
        // double propertyPenalty = calcPropertyPenalty(propertyType);
        // double rentalPenalty   = calcRentalPenalty(isRental, warnings);
        // double hugPenalty      = calcHugPenalty(hugDebtRatio);
        // ltvScore = ltvScore - propertyPenalty - rentalPenalty - hugPenalty;

//        if (isRental)                           ltvScore -= 5;   // 임대사업자
//        if (warnings.contains("가등기 발견"))    ltvScore -= 15;
//        if (warnings.contains("가처분 발견"))    ltvScore -= 15;
//        if (hugDebtRatio >= 90)                 ltvScore -= 20;
//        else if (hugDebtRatio >= 80)            ltvScore -= 5;

        return (int) Math.max(5, Math.min(95, Math.round(ltvScore)));
    }

    private String formatWon(long amount) {
        if (amount >= 1_0000_0000L)
            return String.format("%.1f억", amount / (double) 1_0000_0000L);
        return String.format("%,d원", amount);
    }
}