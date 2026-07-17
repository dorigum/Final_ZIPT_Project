//전세사기분석 ANALYSIS 관련 유틸 - 오혜진
export const fmtWon = (v) => {
  if (!v && v !== 0) return '-';
  const amount = Number(v);
  if (!Number.isFinite(amount)) return '-';
  if (amount >= 1e8) return (amount / 1e8).toFixed(1) + '억원';
  if (amount >= 1e4) return Math.round(amount / 1e4).toLocaleString() + '만원';
  return amount.toLocaleString() + '원';
};

// 날짜 포맷
export const fmtDate = (s) => {
  if (!s) return '-';
  if (typeof s === 'string') return s.replace('T', ' ').substring(0, 16);
  const date = new Date(s);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().replace('T', ' ').substring(0, 16);
};
// LTV 위험 등급 라벨
export const riskLevelLabel = (level) => ({
  SAFE:    '🟢 안심',
  WARNING: '🟡 유의',
  DANGER:  '🔴 위험',
}[level] || level);

// 최종 점수 등급 라벨
export const scoreGradeLabel = (grade) => ({
  PREMIUM: '🟢 프리미엄 안심 (85~100점)',
  CAUTION: '🟡 황색 유의구역 (60~84점)',
  DANGER:  '🔴 적색 경고구역 (60점 미만)',
}[grade] || grade);

// 층간소음 레벨 (추후 임대차 계약서 구현시 적용)
export const noiseLevelLabel = (level) => ({
  LOW:    '🟢 낮음',
  MEDIUM: '🟡 보통',
  HIGH:   '🔴 높음',
}[level] || level);

// D-day 계산: "D-7" (미래) / "D-DAY" (오늘) / "D+3" (지남). 날짜가 없거나 유효하지 않으면 null.
export const formatDday = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;

  const today = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(target) - startOfDay(today)) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'D-DAY';
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
};
