import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Icon, RISK } from '../common/index.jsx';
import { fmtWon, fmtDate } from '../../utils/format.js';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll.js';
import {
  formatDateTime,
  formatConfidence,
  formatEnum,
  formatNumber,
  formatPercentage,
  formatText,
  getStatusMeta,
  isEmptyValue,
} from './normalizers.js';

const RISK_LEVEL_TO_KEY = { HIGH: 'danger', MEDIUM: 'warn', LOW: 'safe' };
const PRIORITY_CHECK_KEYWORDS = ['미납', '선순위', '근저당권', '근저당'];
const PRIORITY_CHECK_FIELDS = ['title', 'description', 'reason', 'actionRequired', 'referenceText', 'category'];

const formatList = (value) => {
  if (isEmptyValue(value)) return '-';
  let items = value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      return value;
    }
  }
  if (!Array.isArray(items) || items.length === 0) return formatText(value);
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
      {items.map((item, index) => <li key={index}>{String(item)}</li>)}
    </ul>
  );
};

const isChecklistItemChecked = (item) => item?.checked === true || item?.checked === 'true';

const buildContractSummary = (checklistItems) => {
  const highCount = checklistItems.filter((item) => item.riskLevel === 'HIGH').length;
  const requiredMissing = checklistItems.filter((item) => item.required && !isChecklistItemChecked(item)).length;
  if (highCount > 0) return `이 계약서는 위험도 높음(HIGH) 항목이 ${highCount}개 발견됐어요. 특약과 필수 기재사항을 꼭 다시 확인하세요.`;
  if (requiredMissing > 0) return `필수 확인 항목 중 ${requiredMissing}개가 아직 체크되지 않았어요. 계약 전 빠짐없이 확인하세요.`;
  return '주요 위험 조항이나 누락된 필수 항목이 발견되지 않았어요. 그래도 계약 전 최종 확인은 꼭 하세요.';
};

const isPriorityChecklistItem = (item) => {
  const searchableText = PRIORITY_CHECK_FIELDS
    .map((field) => item?.[field])
    .filter((value) => !isEmptyValue(value))
    .map(String)
    .join(' ');

  return PRIORITY_CHECK_KEYWORDS.some((keyword) => searchableText.includes(keyword));
};

const Field = ({ label, value, highlight = false, full = false }) => (
  <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : undefined }}>
    <div style={{ marginBottom: 6, color: 'var(--ink-3)', fontSize: 13, fontWeight: 700 }}>{label}</div>
    <div style={{ color: highlight ? 'var(--primary-700)' : 'var(--ink)', fontSize: highlight ? 18 : 15, fontWeight: highlight ? 800 : 600, lineHeight: 1.55, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
      {value}
    </div>
  </div>
);

const FieldGrid = ({ fields }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px 24px' }}>
    {fields.map((field) => <Field key={field.label} {...field} />)}
  </div>
);

/* ── 체크리스트 위험도 분포 막대 (표/숫자 대신 비율로 한눈에 보여주는 차트) ── */
const ChecklistRiskBar = ({ high, medium, total }) => {
  const safe = Math.max(0, total - high - medium);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (total === 0) return null;

  const pct = (n) => (n / total) * 100;
  const segments = [
    { key: 'danger', count: high, label: '위험', color: RISK.danger.color },
    { key: 'warn', count: medium, label: '주의', color: RISK.warn.color },
    { key: 'safe', count: safe, label: '안전', color: RISK.safe.color },
  ].filter((s) => s.count > 0);

  return (
    <div>
      <div style={{ display: 'flex', height: 14, borderRadius: 99, overflow: 'hidden', background: 'var(--surface-3)' }}>
        {segments.map((s) => (
          <div key={s.key} style={{ width: animate ? `${pct(s.count)}%` : 0, background: s.color, transition: 'width .8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 9, fontSize: 12, color: 'var(--ink-2)', flexWrap: 'wrap' }}>
        {segments.map((s) => (
          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <i style={{ width: 9, height: 9, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.label} {s.count}개
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--ink-3)' }}>전체 {total}개 중</span>
      </div>
    </div>
  );
};

const SectionCard = ({ title, aside, children }) => (
  <Card style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ fontSize: 15.5, fontWeight: 800 }}>{title}</div>
      {aside}
    </div>
    {children}
  </Card>
);

function ImportantChecklistRow({ item, index, defaultOpen = false, checked = false, priority = false, onToggleChecked, checking = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const riskKey = RISK_LEVEL_TO_KEY[item.riskLevel] ?? 'warn';
  const risk = RISK[riskKey] ?? RISK.warn;
  const text = item.actionRequired || item.description || item.reason || item.referenceText;
  const hasDetail = Boolean(item.description || item.reason || item.actionRequired || item.referenceText);

  return (
    <div
      key={item.id ?? index}
      style={{
        minHeight: 70,
        padding: '14px 16px 13px',
        borderRadius: 'var(--r-md)',
        background: risk.soft,
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Icon
          name={riskKey === 'warn' ? 'alert-circle' : riskKey === 'safe' ? 'check-circle' : 'x-circle'}
          size={19}
          color={risk.on}
          stroke={2.2}
          style={{ flexShrink: 0, marginTop: 2 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: risk.on, lineHeight: 1.45, overflowWrap: 'anywhere' }}>
              {formatText(item.title)}
            </div>
            {priority && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: 22,
                  padding: '3px 8px',
                  borderRadius: 'var(--r-pill)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary-700)',
                  fontSize: 11.5,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                우선 확인
              </span>
            )}
            {onToggleChecked && (
              <button
                type="button"
                onClick={() => onToggleChecked()}
                disabled={checking}
                aria-pressed={checked}
                aria-busy={checking}
                aria-label={checked ? `${formatText(item.title)} 확인 완료 해제` : `${formatText(item.title)} 확인 완료`}
                title={checked ? '확인 완료' : '확인 전'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  padding: 0,
                  borderRadius: 4,
                  border: `1.5px solid ${checked ? 'var(--ink-3)' : 'var(--line-2)'}`,
                  background: checked ? 'var(--surface)' : 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--ink-2)',
                  cursor: checking ? 'wait' : 'pointer',
                  flexShrink: 0,
                  opacity: checking ? 0.65 : 1,
                }}
              >
                {checked && <Icon name="check" size={11} stroke={3} />}
              </button>
            )}
          </div>
          {text && (
            <div
              style={{
                fontSize: 12.5,
                color: item.actionRequired ? 'var(--primary-700)' : 'var(--ink-2)',
                fontWeight: item.actionRequired ? 800 : 400,
                marginTop: 3,
                lineHeight: 1.55,
                overflow: open ? 'visible' : 'hidden',
                display: open ? 'block' : '-webkit-box',
                WebkitLineClamp: open ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {item.actionRequired ? `필요 조치: ${text}` : text}
            </div>
          )}
        </div>
        {hasDetail && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            style={{
              flexShrink: 0,
              border: 0,
              background: 'transparent',
              color: risk.on,
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              padding: '2px 0',
              whiteSpace: 'nowrap',
            }}
          >
            {open ? '접기 ▲' : '자세히 보기 ▾'}
          </button>
        )}
      </div>
      {open && hasDetail && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(15, 23, 42, 0.08)', display: 'grid', gap: 7 }}>
          {item.reason && <div style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.6 }}>{item.reason}</div>}
          {item.description && <div style={{ color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.6 }}>[분석 결과] {item.description}</div>}
        </div>
      )}
    </div>
  );
}

function ShowMoreList({ items, renderItem, initialCount = 3 }) {
  const [expanded, setExpanded] = useState(false);
  if (!items || items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - visibleItems.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {visibleItems.map(renderItem)}
      {items.length > initialCount && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          style={{ alignSelf: 'center', marginTop: 4, padding: '8px 16px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-pill)', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
        >
          {expanded ? '접기 ▲' : `${hiddenCount}개 더보기 ▾`}
        </button>
      )}
    </div>
  );
}

const NOISE_RISK_META = {
  HIGH: { key: 'danger', label: 'HIGH (위험)' },
  MEDIUM: { key: 'warn', label: 'MEDIUM (주의)' },
  LOW: { key: 'safe', label: 'LOW (낮음)' },
};

const getNoiseRiskMeta = (riskLevel) => NOISE_RISK_META[riskLevel] ?? { key: 'neutral', label: formatText(riskLevel) };

const buildTopNoiseStats = (stats = []) => {
  const sourceStats = Array.isArray(stats) ? stats : [];
  const sortedStats = [...sourceStats]
    .filter((item) => !isEmptyValue(item?.category) && Number(item?.percentage) > 0)
    .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

  const topStats = sortedStats.slice(0, 2);
  const remainingPercentage = sortedStats.slice(2).reduce((sum, item) => sum + Number(item.percentage ?? 0), 0);

  return remainingPercentage > 0
    ? [...topStats, { category: '나머지', percentage: remainingPercentage }]
    : topStats;
};

const NoiseReportSummary = ({ noiseReport }) => {
  const riskMeta = getNoiseRiskMeta(noiseReport?.riskLevel);
  const r = RISK[riskMeta.key] ?? { soft: 'var(--surface-2)', on: 'var(--ink)' };
  const mainStats = buildTopNoiseStats(noiseReport?.stats);
  const baseYear = noiseReport?.stats?.find((item) => !isEmptyValue(item?.year))?.year;

  const [revealRef, isVisible] = useRevealOnScroll({ threshold: 0.1 });

  return (
    <div ref={revealRef} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
      <div style={{ padding: 18, background: r.soft, borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ margin: 0, color: 'var(--ink-3)', fontSize: 13, fontWeight: 800 }}>층간소음 위험도 분석</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong style={{ color: r.on, fontSize: 22, lineHeight: 1.25 }}>{riskMeta.label}</strong>
          {riskMeta.key !== 'safe' && (
            <div style={{ position: 'relative', display: 'inline-flex', width: 14, height: 14, flexShrink: 0 }}>
              <span style={{
                position: 'absolute',
                display: 'inline-flex',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: r.color,
                animation: 'zipt-ping-strong 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
              }} />
              <span style={{
                position: 'relative',
                display: 'inline-flex',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: r.color,
              }} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: 18, borderBottom: '1px solid var(--line)' }}>
        <div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 700 }}>신고건수</div>
          <div style={{ marginTop: 4, color: 'var(--ink)', fontSize: 20, fontWeight: 800 }}>{formatNumber(noiseReport?.complaintCount)}건</div>
        </div>
        <div>
          <div style={{ color: 'var(--ink-3)', fontSize: 13, fontWeight: 700 }}>소음수준</div>
          <div style={{ marginTop: 4, color: 'var(--ink)', fontSize: 20, fontWeight: 800 }}>{formatNumber(noiseReport?.noiseLevel)}점</div>
        </div>
      </div>

      <div style={{ padding: 18 }}>
        <h3 style={{ margin: '0 0 12px', color: 'var(--ink)', fontSize: 15 }}>주요 원인{baseYear ? ` (${baseYear}년 기준)` : ''}</h3>
        {mainStats.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--ink-4)' }}>표시할 원인 데이터가 없습니다.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {mainStats.map((item, index) => {
              const pct = Number(item.percentage) || 0;
              return (
                <div key={`${item.category}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--ink-2)', fontWeight: 700, fontSize: 13.5, overflowWrap: 'anywhere' }}>{formatText(item.category)}</span>
                    <span style={{ color: 'var(--primary-700)', fontWeight: 800, fontSize: 13.5 }}>{formatPercentage(item.percentage)}</span>
                  </div>
                  <div style={{ position: 'relative', height: 8, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: isVisible ? `${pct}%` : '0%',
                      background: 'var(--primary)',
                      borderRadius: 99,
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ContractReport({
  contract,
  reportRef,
  isPdfAvailable,
  pdfLoading,
  isRegenerating,
  isChecklistChecking,
  checkingChecklistItemId,
  onBackToHistory,
  onPdfSave,
  onReanalysis,
  onToggleChecklistItem,
  onToggleTracking,
  isTrackingUpdating,
}) {
  const navigate = useNavigate();
  const checklistItems = useMemo(() => (
    [...(contract?.checklistItems ?? [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
  ), [contract?.checklistItems]);

  const statusMeta = getStatusMeta(contract?.processingStatus);
  const highCount = checklistItems.filter((item) => item.riskLevel === 'HIGH').length;
  const mediumCount = checklistItems.filter((item) => item.riskLevel === 'MEDIUM').length;
  const requiredMissingCount = checklistItems.filter((item) => item.required && !isChecklistItemChecked(item)).length;
  const overallRiskKey = highCount > 0 ? 'danger' : mediumCount > 4 ? 'warn' : 'safe';
  const overallRisk = RISK[overallRiskKey];
  const priorityItems = checklistItems.filter(isPriorityChecklistItem);
  const topChecklistItems = [
    ...priorityItems,
    ...checklistItems.filter((item) => !isPriorityChecklistItem(item)),
  ];
  const checkedChecklistCount = topChecklistItems.filter(isChecklistItemChecked).length;
  const heroSummaryItems = [
    { label: '총 항목', description: '전체 체크리스트', value: checklistItems.length, background: 'var(--surface-2)', color: 'var(--ink)', descriptionColor: 'var(--ink-3)' },
    { label: '위험 높음', description: 'HIGH 위험 항목', value: highCount, background: RISK.danger.soft, color: RISK.danger.on, descriptionColor: RISK.danger.on },
    { label: '우선 확인', description: '미납·선순위·근저당', value: priorityItems.length, background: 'var(--primary-soft)', color: 'var(--primary-700)', descriptionColor: 'var(--primary-700)' },
    { label: '필수 확인 필요', description: '계약 전 꼭 봐야 할 항목', value: requiredMissingCount, background: RISK.warn.soft, color: RISK.warn.on, descriptionColor: RISK.warn.on },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '16px 0 48px', animation: 'zipt-fade .3s ease' }}>
      <style>{`
        @keyframes zipt-ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70%, 100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes zipt-ping-strong {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          70%, 100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }
        @media (max-width: 768px) {
          .contract-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div ref={reportRef}>
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 18 }}>
          <div className="contract-hero-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}>
            <div style={{ padding: '30px 24px', background: 'var(--surface-2)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96 }}>
                {overallRiskKey !== 'safe' && (
                  <span style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: overallRisk.color,
                    animation: 'zipt-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                )}
                <span style={{
                  position: 'relative',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: overallRisk.soft,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name={overallRiskKey === 'safe' ? 'shield-check' : overallRiskKey === 'warn' ? 'alert' : 'x-circle'} size={42} color={overallRisk.on} stroke={2} />
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: overallRisk.on }}>{overallRisk.label} 단계</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>체크리스트 기준 종합 진단</div>
              </div>
            </div>
            <div style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Icon name="file-signature" size={17} color="var(--ink-3)" />
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, overflowWrap: 'anywhere' }}>{formatText(contract?.propertyAddress)}</span>
                <Badge tone={statusMeta.tone} size="sm">{statusMeta.label}</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>ZIPT 종합 진단</span>
                <Badge tone={overallRiskKey} solid icon={overallRiskKey === 'safe' ? 'check' : 'alert'}>{overallRisk.label}</Badge>
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '15px 17px' }}>
                {buildContractSummary(checklistItems)}
              </div>
              <div style={{ marginTop: 18 }}>
                <ChecklistRiskBar high={highCount} medium={mediumCount} total={checklistItems.length} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'end', marginTop: 18 }}>
                <div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <Field label={'계약 유형'} value={formatEnum(contract?.contractType)} highlight />
                    <Field label={'계약 구분'} value={formatEnum(contract?.contractKind)} highlight />
                    <Field label={'보증금'} value={fmtWon(contract?.depositAmount)} highlight />
                    <Field label={'월세'} value={fmtWon(contract?.monthlyRent)} highlight />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                    {isPdfAvailable && (
                      <>
                        <Button size="sm" icon="undo" variant="ghost" onClick={onReanalysis} disabled={isRegenerating}>
                          {isRegenerating ? '재분석 요청 중...' : '재분석'}
                        </Button>
                        <Button size="sm" icon="download" onClick={onPdfSave} disabled={pdfLoading}>{pdfLoading ? 'PDF 저장 중...' : 'PDF 저장'}</Button>
                        <Button size="sm" variant="ghost" icon="list" onClick={() => {
                                                          sessionStorage.setItem("mypage_active_tab", "lease");
                                                          navigate('/mypage');
                                                        }}>서류 분석 내역 보기</Button>
                        <Button
                          size="sm"
                          variant={contract?.trackingEnabled ? "primary" : "ghost"}
                          icon="bell"
                          onClick={() => onToggleTracking?.(!contract?.trackingEnabled)}
                          disabled={isTrackingUpdating}
                        >
                          {contract?.trackingEnabled ? "일정 알림 켜짐" : "일정 알림 켜기"}
                        </Button>
                      </>
                    )}
                  </div>
                  {contract?.trackingEnabled && (
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
                      마이페이지 목록에 인도일·계약종료일 D-day가 표시돼요. 실제로 진행 중인 계약이 아니라면 꺼주세요.
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                  {heroSummaryItems.map((item) => (
                    <div key={item.label} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: item.background, textAlign: 'center', minHeight: 74, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ color: item.color, fontSize: 11.5, fontWeight: 800 }}>{item.label}</div>
                      <div style={{ color: item.color, fontSize: 20, fontWeight: 900, marginTop: 3 }}>{item.value}</div>
                      <div style={{ color: item.descriptionColor, fontSize: 10.5, fontWeight: 700, marginTop: 3, opacity: 0.78, lineHeight: 1.25 }}>{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {contract?.processingErrorMessage && (
          <Card style={{ marginBottom: 18, background: 'var(--danger-soft)' }}>
            <div style={{ color: 'var(--danger-600)', lineHeight: 1.6 }}>{contract.processingErrorMessage}</div>
          </Card>
        )}

        <Card style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 4 }}>✅ 이것만은 꼭 확인하세요!</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                ZIPT가 종합 진단한 임대차계약서의{' '}
                <b style={{ color: 'var(--danger-600)' }}>[위험]</b>
                {' / '}
                <b style={{ color: 'var(--warn-600)' }}>[주의]</b>
                {' / '}
                <b style={{ color: 'var(--safe-600)' }}>[안전]</b>
                {' '}등의 항목을 반드시 확인해주세요. 확인한 내용은 <b style={{ color: 'var(--primary-700)' }}>[체크박스]</b> 버튼을 눌러 체크해주세요.
              </div>
            </div>
            <span style={{ color: 'var(--ink-3)', fontSize: 13, whiteSpace: 'nowrap' }}>
              {checkedChecklistCount}/{topChecklistItems.length} <b>확인 완료</b>
            </span>
          </div>
          {topChecklistItems.length > 0 ? (
            <ShowMoreList
              items={topChecklistItems}
              initialCount={3}
              renderItem={(item, index) => {
                const priority = isPriorityChecklistItem(item);
                return (
                  <ImportantChecklistRow
                    key={item.id ?? index}
                    item={item}
                    index={index}
                    defaultOpen={index < 3}
                    checked={isChecklistItemChecked(item)}
                    checking={isChecklistChecking && String(checkingChecklistItemId) === String(item.id)}
                    priority={priority}
                    onToggleChecked={() => onToggleChecklistItem(item)}
                  />
                );
              }}
            />
          ) : (
            <ImportantChecklistRow item={{ riskLevel: 'LOW', title: '우선 확인이 필요한 위험 항목이 발견되지 않았어요.' }} index={0} />
          )}
        </Card>

        {contract?.noiseReport && (
          <Card style={{ marginBottom: 18 }}>
            <NoiseReportSummary noiseReport={contract.noiseReport} />
          </Card>
        )}

        <SectionCard title={'계약 기본 정보'}>
          <FieldGrid fields={[
            { label: '소재지', value: formatText(contract?.propertyAddress) },
            { label: '건물 구조', value: formatText(contract?.buildingStructure) },
            { label: '건물 용도', value: formatText(contract?.buildingPurpose) },
            { label: '임대 부분', value: formatText(contract?.leasedPart) },
          ]} />
        </SectionCard>

        <SectionCard title={'금액 및 납부'}>
          <FieldGrid fields={[
            { label: '계약금', value: fmtWon(contract?.contractAmount) },
            { label: '중도금', value: fmtWon(contract?.intermediateAmount) },
            { label: '중도금 지급일', value: fmtDate(contract?.intermediatePaymentDate) },
            { label: '잔금', value: fmtWon(contract?.balanceAmount) },
            { label: '잔금 지급일', value: fmtDate(contract?.balancePaymentDate) },
            { label: '월세 납부일', value: contract?.monthlyRentPaymentDay ? `매월 ${contract.monthlyRentPaymentDay}일` : '-' },
          ]} />
        </SectionCard>

        <SectionCard title={'기간 및 관리비'}>
          <FieldGrid fields={[
            { label: '인도일', value: fmtDate(contract?.deliveryDate) },
            { label: '계약 종료일', value: fmtDate(contract?.endDate) },
            { label: '관리비 유형', value: formatEnum(contract?.maintenanceFeeType) },
            { label: '관리비 금액', value: fmtWon(contract?.maintenanceFeeAmount) },
            { label: '관리비 산정 방법', value: formatText(contract?.maintenanceFeeCalculationMethod) },
          ]} />
        </SectionCard>

        <SectionCard title={'권리관계 및 수리 특약'}>
          <FieldGrid fields={[
            { label: '미납 국세/지방세', value: formatEnum(contract?.unpaidTaxStatus) },
            { label: '미납 세금 설명', value: formatText(contract?.unpaidTaxDescription) },
            { label: '선순위 확정일자', value: formatEnum(contract?.priorityFixedDateStatus) },
            { label: '선순위 설명', value: formatText(contract?.priorityFixedDateDescription) },
            { label: '수리 필요 여부', value: formatEnum(contract?.repairNeededStatus) },
            { label: '수리 내용', value: formatText(contract?.repairContent) },
            { label: '수리 완료 예정일', value: fmtDate(contract?.repairCompletionDate) },
            { label: '수리 불이행 처리', value: formatText(contract?.repairDefaultHandling) },
          ]} />
        </SectionCard>

        <SectionCard title={'추출 품질'}>
          <FieldGrid fields={[
            { label: '추출 신뢰도', value: formatConfidence(contract?.extractionConfidence) },
            { label: '생성일', value: formatDateTime(contract?.createdAt) },
            { label: '수정일', value: formatDateTime(contract?.updatedAt) },
            { label: '경고', value: formatList(contract?.extractionWarnings), full: true },
          ]} />
        </SectionCard>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4, marginBottom: 12 }}>
        <Button variant="ghost" full icon="arrow-left" onClick={() => navigate('/contract')}>다른 서류 분석하기</Button>
        {isPdfAvailable && (
          <Button full icon="download" onClick={onPdfSave} disabled={pdfLoading}>{pdfLoading ? 'PDF 저장 중...' : '분석 리포트 PDF 저장'}</Button>
        )}
      </div>
    </div>
  );
}
