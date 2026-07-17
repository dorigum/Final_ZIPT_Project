const WON_PER_MANWON = 10_000;

export function wonToManwon(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value) / WON_PER_MANWON) : 0;
}

export function manwonToWon(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value) * WON_PER_MANWON) : 0;
}

export function normalizeRisk(value) {
  const risk = String(value || "").toUpperCase();
  if (risk === "SAFE" || risk === "PREMIUM" || risk === "LOW") return "safe";
  if (risk === "WARNING" || risk === "WARN" || risk === "CAUTION" || risk === "MEDIUM") return "warn";
  return "danger";
}

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getFirstNumber(item, keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return toCount(item[key]);
    }
  }
  return 0;
}

function getRiskCountMapValue(item, level) {
  const maps = [
    item?.riskCounts,
    item?.riskLevelCounts,
    item?.checklistRiskCounts,
    item?.checklistRiskLevelCounts,
    item?.checklistSummary,
    item?.summary,
  ];

  for (const map of maps) {
    if (!map || typeof map !== "object") continue;
    const value = map[level] ?? map[level.toLowerCase()];
    if (value !== undefined && value !== null) return toCount(value);
  }

  return 0;
}

function getChecklistItems(item) {
  const sources = [
    item?.checklistItems,
    item?.checklists,
    item?.checklist,
    item?.contractChecklistItems,
  ];

  return sources.find(Array.isArray) ?? [];
}

function getContractRiskCounts(item) {
  const checklistItems = getChecklistItems(item);
  const highFromItems = checklistItems.filter((check) => String(check?.riskLevel || "").toUpperCase() === "HIGH").length;
  const mediumFromItems = checklistItems.filter((check) => String(check?.riskLevel || "").toUpperCase() === "MEDIUM").length;

  const high = highFromItems
    || getFirstNumber(item, [
      "highRiskCount",
      "highCount",
      "highRiskItemCount",
      "highChecklistCount",
      "dangerCount",
      "toxicCount",
      "toxic",
    ])
    || getRiskCountMapValue(item, "HIGH");

  const medium = mediumFromItems
    || getFirstNumber(item, [
      "mediumRiskCount",
      "mediumCount",
      "mediumRiskItemCount",
      "mediumChecklistCount",
      "warningCount",
      "warnCount",
    ])
    || getRiskCountMapValue(item, "MEDIUM");

  return { high, medium };
}

function normalizeContractRisk(item) {
  const status = String(item?.processingStatus || "").toUpperCase();
  if (status === "FAILED") return "danger";
  if (status === "PROCESSING" || status === "OCR_EXTRACTING" || status === "AI_EXTRACTING" || status === "CHECKLIST_GENERATING") {
    return "warn";
  }

  const { high, medium } = getContractRiskCounts(item);
  if (high > 0) return "danger";
  if (medium > 4) return "warn";

  const explicitRisk = item?.riskLevel || item?.overallRiskLevel || item?.scoreGrade;
  if (explicitRisk) return normalizeRisk(explicitRisk);

  return "safe";
}

function normalizeAnalysisRisk(item) {
  const status = String(item?.processingStatus || "").toUpperCase();
  if (status === "FAILED") return "danger";
  if (item?.riskLevel || item?.scoreGrade) return normalizeRisk(item.riskLevel || item.scoreGrade);

  const score = Number(item?.riskScore);
  if (Number.isFinite(score)) {
    if (score >= 70) return "safe";
    if (score >= 40) return "warn";
    return "danger";
  }

  return "safe";
}

function formatBond(bond) {
  const creditor = bond.creditor ? ` · ${bond.creditor}` : "";
  const amount = wonToManwon(bond.amount).toLocaleString();
  return `${amount}만원${creditor}`;
}

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProcessingStatus(value) {
  const status = String(value || "").toUpperCase();
  if (status === "FAILED") return "failed";
  if (status === "PROCESSING" || status === "OCR_EXTRACTING" || status === "AI_EXTRACTING" || status === "CHECKLIST_GENERATING") {
    return "processing";
  }
  return "completed";
}

export function normalizeAnalysisReport(data, { fileName = "등기부등본" } = {}) {
  if (!data) return null;
  if (data.safetyScore !== undefined) return data;

  const risk = normalizeRisk(data.riskLevel || data.scoreGrade);
  const warnings = data.registryWarnings || [];
  const factors = data.riskFactors || [];
  const bonds = data.priorityBonds || [];
  const flags = [...factors, ...warnings].map((text, index) => ({
    risk,
    title: index === 0 ? "주요 위험 요소" : "추가 확인 사항",
    text,
  }));

  if (!flags.length) {
    flags.push({ risk: "safe", title: "즉시 확인된 위험 없음", text: "등기 분석 결과에서 주요 위험 요소가 발견되지 않았어요." });
  }

  return {
    id: data.id,
    address: data.address || "주소 정보 없음",
    propertyType: data.propertyType || "부동산",
    ownerName: data.ownerName || "소유자",
    fileName,
    analyzedAt: data.analyzedAt || "방금 전",
    safetyScore: toFiniteNumber(data.riskScore),
    risk,
    appraisedValue: wonToManwon(data.officialPrice || data.marketPrice),
    deposit: wonToManwon(data.deposit),
    seniorDebt: wonToManwon(data.totalPriorityAmount),
    ltvRatio: toFiniteNumber(data.ltvRatio),
    hugDebtRatio: toFiniteNumber(data.hugDebtRatio),
    priorityRatio: toFiniteNumber(data.priorityRatio),
    totalLtv: toFiniteNumber(data.totalLtv ?? data.ltvRatio),
    insuranceEligible: Boolean(data.insuranceEligible),
    insuranceConditions: Array.isArray(data.insuranceConditions) ? data.insuranceConditions : [],
    pdfUrl: data.pdfUrl || null,
    summary: data.insuranceRecommendation
      || `${data.address || "해당 매물"}의 종합 위험도는 ${data.riskLevel || "확인 필요"} 단계예요.`,
    flags,
    gabgu: warnings.length
      ? warnings.map((text) => ({ keyword: "등기 경고", risk, text }))
      : [{ keyword: "소유권 확인", risk: "safe", text: `${data.ownerName || "소유자"} 정보가 확인됐어요.` }],
    eulgu: bonds.length
      ? bonds.map((bond) => ({ keyword: bond.type || "선순위 채권", risk, text: formatBond(bond) }))
      : [{ keyword: "선순위 채권", risk: "safe", text: "확인된 선순위 채권이 없어요." }],
  };
}

// 주소에서 시/도, 시/군/구, 동/읍/면/로/길 까지만 파싱하여 제목 생성
export function formatAddressTitle(addr, isDeed = true) {
  const suffix = isDeed ? "등기부등본 분석 내역" : "임대차계약서 분석 내역";
  if (!addr) return suffix;
  const parts = addr.split(' ');
  const refinedParts = [];
  
  for (const part of parts) {
    refinedParts.push(part);
    if (part.endsWith('동') || part.endsWith('읍') || part.endsWith('면') || part.endsWith('가') || part.endsWith('리') || part.endsWith('로') || part.endsWith('길')) {
      break;
    }
  }
  
  return `[${refinedParts.join(' ')}] ${suffix}`;
}

// 날짜 및 시간 포맷 안전 파싱 (yyyy.mm.dd 오후 hh:mm)
function formatCreatedDateWithTime(dt) {
  if (!dt) return "방금 전";
  
  let dateObj = null;
  if (typeof dt === "string") {
    dateObj = new Date(dt);
  } else if (Array.isArray(dt)) {
    const [year, month, day, hour = 0, minute = 0] = dt;
    if (year && month && day) {
      dateObj = new Date(year, month - 1, day, hour, minute);
    }
  } else {
    try {
      dateObj = new Date(dt);
    } catch (e) {}
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    let hour = dateObj.getHours();
    const minute = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hour >= 12 ? '오후' : '오전';
    hour = hour % 12;
    hour = hour ? hour : 12; // 0시일 때는 12시로 표기
    const hourStr = String(hour).padStart(2, '0');
    return `${year}.${month}.${day} ${ampm} ${hourStr}:${minute}`;
  }
  return "방금 전";
}

export function truncateFileName(fileName, maxLength = 35) {
  if (!fileName) return "";
  if (fileName.includes(",")) {
    const files = fileName.split(",").map(f => f.trim()).filter(Boolean);
    if (files.length > 1) {
      const firstFile = files[0];
      const truncatedFirst = firstFile.length > 20 ? firstFile.substring(0, 20) + "..." : firstFile;
      return `${truncatedFirst} 외 ${files.length - 1}개`;
    }
  }
  if (fileName.length > maxLength) {
    return fileName.substring(0, maxLength) + "...";
  }
  return fileName;
}

export function normalizeAnalysisHistory(data) {
  if (data && (data.deeds !== undefined || data.leases !== undefined)) return data;

  const items = Array.isArray(data) ? data : [];

  const list = items.map((item) => {
    const status = String(item?.processingStatus || "").toUpperCase();
    let risk = "safe";
    if (status === "FAILED") {
      risk = "danger";
    } else if (status === "PROCESSING") {
      risk = "warn";
    } else {
      risk = normalizeAnalysisRisk(item);
    }

    const analyzedAt = formatCreatedDateWithTime(item.uploadedAt ?? item.createdAt ?? item.analyzedAt);
    const rawDate = item.uploadedAt ?? item.createdAt ?? item.analyzedAt ?? "";

    return {
      id: item.analysisId ?? item.id,
      nick: item.address || "등기부 분석",
      addr: item.address || "주소 정보 없음",
      title: formatAddressTitle(item.address, true),
      fileName: truncateFileName(item.registryFileName ?? item.fileName ?? item.registryName ?? `등기부_분석_${item.id}.pdf`),
      analyzedAt,
      type: item.propertyType || "부동산",
      deposit: item.deposit ? wonToManwon(item.deposit) : 0,
      score: item.riskScore ?? 0,
      risk,
      processingStatus: normalizeProcessingStatus(item.processingStatus),
      headline: status === "FAILED"
        ? (item.processingErrorMessage || "서류 분석에 실패했습니다.")
        : `LTV ${item.ltvRatio ?? 0}% · ${item.insuranceEligible ? "보증보험 가능" : "보증보험 확인 필요"}`,
      flags: risk === "safe" ? 0 : 1,
      rawDate,
    };
  });

  const sortedDeeds = list.sort((a, b) => {
    const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
    return timeB - timeA;
  });

  return {
    deeds: sortedDeeds,
    leases: [],
  };
}

const CONTRACT_ENUM_LABELS = {
  JEONSE: '전세',
  MONTHLY_RENT_WITH_DEPOSIT: '보증부 월세',
  MONTHLY_RENT: '월세',
};

export function normalizeContractHistory(data) {
  const payload = data?.data ?? data;
  const items = Array.isArray(payload) ? payload : (payload?.content ?? payload?.contracts ?? []);

  const list = items.map((item) => {
    const risk = normalizeContractRisk(item);
    const riskCounts = getContractRiskCounts(item);

    const toxicCount = riskCounts.high;

    let headline = "";
    if (item.processingStatus === "FAILED") {
      headline = item.processingErrorMessage || "서류 분석에 실패했습니다.";
    } else if (item.processingStatus === "PROCESSING") {
      headline = "계약서 분석 진행 중입니다...";
    } else {
      const confidence = Number(item.extractionConfidence);
      const confidencePct = Number.isFinite(confidence) 
        ? `${(confidence * 100).toFixed(0)}%` 
        : "100%";
      headline = `추출 품질 ${confidencePct} · 특약 확인 완료`;
    }

    const analyzedAt = formatCreatedDateWithTime(item.createdAt);

    return {
      id: item.contractId ?? item.id,
      nick: item.propertyAddress || "임대차 계약서",
      addr: item.propertyAddress || "주소 정보 없음",
      title: formatAddressTitle(item.propertyAddress, false),
      fileName: truncateFileName(item.originalFileName || "계약서 파일"),
      analyzedAt,
      type: risk === "danger" ? "" : (CONTRACT_ENUM_LABELS[item.contractType] || item.contractType || "전세"),
      deposit: item.depositAmount ? wonToManwon(item.depositAmount) : 0,
      processingStatus: normalizeProcessingStatus(item.processingStatus),
      risk,
      toxic: toxicCount,
      headline,
      rawDate: item.createdAt || "",
      deliveryDate: item.deliveryDate || "",
      endDate: item.endDate || "",
      trackingEnabled: Boolean(item.trackingEnabled),
    };
  });

  return list.sort((a, b) => {
    const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
    return timeB - timeA;
  });
}


