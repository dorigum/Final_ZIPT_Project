const STATUS_META = {
  PROCESSING: { label: '처리중', tone: 'warn' },
  OCR_EXTRACTING: { label: '텍스트 추출중', tone: 'warn' },
  AI_EXTRACTING: { label: '정보 분석중', tone: 'warn' },
  CHECKLIST_GENERATING: { label: '체크리스트 생성중', tone: 'warn' },
  COMPLETED: { label: '처리완료', tone: 'safe' },
  FAILED: { label: '처리실패', tone: 'danger' },
};

const ENUM_LABELS = {
  JEONSE: '전세',
  MONTHLY_RENT_WITH_DEPOSIT: '보증부 월세',
  MONTHLY_RENT: '월세',
  NEW: '신규',
  AGREED_RENEWAL: '합의 갱신',
  RENEWAL_REQUEST: '갱신 요구',
  FIXED: '정액',
  NON_FIXED: '비정액',
  NONE: '없음',
  EXISTS: '있음',
  NOT_APPLICABLE: '해당 없음',
  UNKNOWN: '확인 필요',
};

export const isEmptyValue = (value) => value == null || value === '' || (Array.isArray(value) && value.length === 0);

export const formatEnum = (value) => {
  if (isEmptyValue(value)) return '-';
  return ENUM_LABELS[value] ?? String(value);
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} `
    + `${date.getHours() < 12 ? '오전' : '오후'} ${String(date.getHours() % 12 || 12).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const formatConfidence = (value) => {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return '-';
  const percent = confidence <= 1 ? confidence * 100 : confidence;
  return `${percent.toFixed(1)}%`;
};

export const formatText = (value) => {
  if (isEmptyValue(value)) return '-';
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  return String(value);
};

export const getStatusMeta = (status) => STATUS_META[status] ?? { label: formatText(status), tone: 'neutral' };

export const formatNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return new Intl.NumberFormat('ko-KR').format(number);
};

export const formatPercentage = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '-';
  return `${Math.round(number)}%`;
};
