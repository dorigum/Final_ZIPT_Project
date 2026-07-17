import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Badge, Button, Card, Icon, Gauge, RISK, riskFromScore, PageLoading, Reveal } from '../../components/common/index.jsx';
import { useAnalysisHistory, useAnalysisDetail } from '../../hooks/useAnalysis';
import { useContractHistory, useContractDetail } from '../../hooks/useContract';
import { formatAddressTitle, normalizeAnalysisHistory, normalizeContractHistory } from '../../components/analysis/normalizers';
import { fmtDate } from '../../utils/format';

const GRADE_TO_RISK = { PREMIUM: 'safe', CAUTION: 'warn', DANGER: 'danger' };
const NOISE_META = {
  HIGH: { key: 'danger', label: '높음' },
  MEDIUM: { key: 'warn', label: '보통' },
  LOW: { key: 'safe', label: '낮음' },
};

const normalizeList = (response, keys) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const normalizeAnalyses = (response) => normalizeList(response, ['content', 'analyses']);
const normalizeContracts = (response) => normalizeList(response, ['content', 'contracts']);
const normalizeDetail = (response) => response?.data ?? response ?? null;

const getAnalysisId = (item) => item?.analysisId ?? item?.id;
const getContractId = (item) => item?.contractId ?? item?.id;
const getAnalysisFile = (item, index = 0) => item?.registryFileName ?? item?.fileName ?? item?.registryName ?? `등기부등본 ${index + 1}`;
const getContractFile = (item, index = 0) => item?.originalFileName ?? item?.fileName ?? item?.contractName ?? `계약서 ${index + 1}`;
const getAnalysisTitle = (item, index = 0) => item?.address ? formatAddressTitle(item.address, true) : getAnalysisFile(item, index);
const getContractTitle = (item, index = 0) => item?.propertyAddress ? formatAddressTitle(item.propertyAddress, false) : getContractFile(item, index);
const getUploadedAt = (item) => item?.uploadedAt ?? item?.createdAt ?? item?.analyzedAt;

const PROCESSING_STATUS = {
  PROCESSING: { label: '처리중', background: 'var(--warn-soft)', color: 'var(--warn-600)' },
  COMPLETED: { label: '처리완료', background: 'var(--safe-soft)', color: 'var(--safe-600)' },
  FAILED: { label: '처리실패', background: 'var(--danger-soft)', color: 'var(--danger-600)' },
};

const getProcessingStatus = (status) => {
  if (!status) return PROCESSING_STATUS.COMPLETED;
  return PROCESSING_STATUS[String(status).toUpperCase()] ?? {
    label: status,
    background: 'var(--surface-3)',
    color: 'var(--ink-2)',
  };
};

const leaseRiskMeta = (items = []) => {
  const high = items.filter((item) => item.riskLevel === 'HIGH').length;
  const requiredMissing = items.filter((item) => item.required && !item.checked).length;

  if (high > 0) {
    return {
      key: 'danger',
      high,
      requiredMissing,
      summary: `위험도 높음(HIGH) 특약 ${high}개가 발견됐어요. 계약 전 특약과 필수 기재사항을 꼭 확인하세요.`,
    };
  }

  if (requiredMissing > 0) {
    return {
      key: 'warn',
      high,
      requiredMissing,
      summary: `필수 확인 항목 중 ${requiredMissing}개가 아직 체크되지 않았어요.`,
    };
  }

  return {
    key: 'safe',
    high,
    requiredMissing,
    summary: '주요 위험 조항이나 누락된 필수 항목이 발견되지 않았어요.',
  };
};

function Chip({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-3)', borderRadius: 10, padding: '9px 11px', textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 800, marginTop: 3, color: color || 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function DeedSummaryCard({ detail, analysisId, navigate, deedStats }) {
  const riskScore = detail.riskScore ?? 0;
  const riskKey = GRADE_TO_RISK[detail.scoreGrade] ?? riskFromScore(riskScore).key;
  const risk = RISK[riskKey];
  const senior = detail.totalPriorityAmount || 0;
  const deposit = detail.deposit || 0;
  const appraised = detail.marketPrice || detail.officialPrice || 0;
  const ltv = Math.round(detail.hugDebtRatio || detail.ltvRatio || (appraised > 0 ? ((senior + deposit) / appraised) * 100 : 0));
  const ltvRisk = ltv <= 80 ? RISK.safe : ltv <= 90 ? RISK.warn : RISK.danger;
  const insured = !!detail.insuranceEligible;

  return (
    <Card className="reveal-card-left" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Badge tone="primary">최근 등기부 분석</Badge>
        {getUploadedAt(detail) && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{fmtDate(getUploadedAt(detail))}</span>}
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <Gauge value={riskScore} size={124} label={`${risk.label} 단계`} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>종합 진단</span>
            <Badge tone={riskKey} solid icon={riskKey === 'safe' ? 'check' : 'alert'}>{risk.label}</Badge>
            {riskKey !== 'safe' && (
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                <div style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                  <span style={{
                    position: 'absolute',
                    display: 'inline-flex',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: risk.color,
                    animation: 'zipt-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }} />
                  <span style={{
                    position: 'relative',
                    display: 'inline-flex',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: risk.color,
                  }} />
                </div>
              </div>
            )}
          </div>
          {detail.propertyType && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 7 }}>{detail.propertyType}</div>}
          {detail.address && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail.address}</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
        <Chip label="담보인정비율" value={`${ltv}%`} color={ltvRisk.on} />
        <Chip label="전세보증보험" value={insured ? '가입 가능' : '가입 어려움'} color={insured ? 'var(--safe-600)' : 'var(--danger-600)'} />
      </div>

      {deedStats && deedStats.total > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6 }}>
            <span>등기부 누적 위험도 ({deedStats.total}건 기준)</span>
            <span style={{ color: 'var(--ink)' }}>안전 {deedStats.safePercent}% · 위험 {deedStats.dangerPercent}%</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-3)' }}>
            {deedStats.safePercent > 0 && <div style={{ width: `${deedStats.safePercent}%`, background: 'var(--safe)' }} />}
            {deedStats.warnPercent > 0 && <div style={{ width: `${deedStats.warnPercent}%`, background: 'var(--warn)' }} />}
            {deedStats.dangerPercent > 0 && <div style={{ width: `${deedStats.dangerPercent}%`, background: 'var(--danger)' }} />}
          </div>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <Button full icon="file-text" onClick={() => analysisId != null && navigate(`/analysis/${analysisId}`)}>등기부 리포트 보기</Button>
      </div>
    </Card>
  );
}

function LeaseSummaryCard({ detail, contractId, navigate, leaseStats }) {
  const items = [...(detail.checklistItems ?? [])];
  const meta = leaseRiskMeta(items);
  const risk = RISK[meta.key];
  const noise = NOISE_META[detail.noiseReport?.riskLevel] ?? null;
  const noiseRisk = noise ? RISK[noise.key] : null;

  return (
    <Card className="reveal-card-right-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Badge tone="primary">최근 임대차 분석</Badge>
        {getUploadedAt(detail) && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{fmtDate(getUploadedAt(detail))}</span>}
      </div>

      <div style={{ marginTop: 16, background: risk.soft, borderRadius: 'var(--r-md)', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9, flexShrink: 0 }}>
            {meta.key !== 'safe' && (
              <span style={{
                position: 'absolute',
                display: 'inline-flex',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: risk.color,
                animation: 'zipt-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }} />
            )}
            <span style={{
              position: 'relative',
              display: 'inline-flex',
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: risk.color,
            }} />
          </div>
          <span style={{ fontSize: 15.5, fontWeight: 800, color: risk.on }}>종합 판정 · {risk.label}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 9 }}>{meta.summary}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
        <Chip label="위험 조항" value={`${meta.high}개`} color="var(--danger-600)" />
        <Chip label="필수 미확인" value={`${meta.requiredMissing}개`} color="var(--warn-600)" />
        <Chip label="층간소음" value={noise ? noise.label : '정보 없음'} color={noiseRisk ? noiseRisk.on : 'var(--ink-3)'} />
      </div>

      {leaseStats && leaseStats.total > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6 }}>
            <span>계약서 누적 위험도 ({leaseStats.total}건 기준)</span>
            <span style={{ color: 'var(--ink)' }}>안전 {leaseStats.safePercent}% · 위험 {leaseStats.dangerPercent}%</span>
          </div>
          <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-3)' }}>
            {leaseStats.safePercent > 0 && <div style={{ width: `${leaseStats.safePercent}%`, background: 'var(--safe)' }} />}
            {leaseStats.warnPercent > 0 && <div style={{ width: `${leaseStats.warnPercent}%`, background: 'var(--warn)' }} />}
            {leaseStats.dangerPercent > 0 && <div style={{ width: `${leaseStats.dangerPercent}%`, background: 'var(--danger)' }} />}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <Button variant="soft" full icon="file-signature" onClick={() => contractId != null && navigate(`/contract/${contractId}`)}>임대차 결과 보기</Button>
      </div>
    </Card>
  );
}

function DocEmptyCard({ kind, navigate }) {
  const isDeed = kind === 'deed';
  return (
    <Card className={isDeed ? 'reveal-card-left' : 'reveal-card-right-1'} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Badge tone="primary">{isDeed ? '최근 등기부 분석' : '최근 임대차 분석'}</Badge>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px 8px' }}>
        <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isDeed ? 'file-text' : 'file-signature'} size={23} color="var(--ink-4)" stroke={1.8} />
        </span>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>
          아직 분석한 {isDeed ? '등기부등본이' : '임대차계약서가'} 없어요
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.55 }}>
          {isDeed ? '등기부등본을 올리면 깡통전세·근저당 위험을 점수로 확인할 수 있어요.' : '계약서를 올리면 숨은 독소조항을 찾아 쉬운 말로 풀어 드려요.'}
        </div>
      </div>
      <Button full icon="upload" onClick={() => navigate(isDeed ? '/analysis' : '/contract')}>
        {isDeed ? '등기부 분석하기' : '계약서 분석하기'}
      </Button>
    </Card>
  );
}

function DocFailedCard({ kind, navigate }) {
  const isDeed = kind === 'deed';
  return (
    <Card className={isDeed ? 'reveal-card-left' : 'reveal-card-right-1'} style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: '#fde68a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Badge tone="warn">{isDeed ? '최근 등기부 분석' : '최근 임대차 분석'}</Badge>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px 8px' }}>
        <span style={{ width: 48, height: 48, borderRadius: 13, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert-triangle" size={23} color="var(--warn-600, #d97706)" stroke={1.8} />
        </span>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', marginTop: 12 }}>
          {isDeed ? '등기부등본' : '임대차계약서'} 분석 실패
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.55 }}>
          서류 분석에 실패했습니다. 올바른 형식의 부동산 서류를 다시 업로드해 주세요.
        </div>
      </div>
      <Button
        full
        icon="refresh-cw"
        style={{
          background: 'var(--warn-600, #d97706)',
          color: '#fff',
          border: 'none',
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--warn-700, #b45309)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--warn-600, #d97706)'}
        onClick={() => navigate(isDeed ? '/analysis' : '/contract')}
      >
        다시 분석하기
      </Button>
    </Card>
  );
}

function ReturningUserHomeView({ 
  navigate, name, deedDetail, latestAnalysisId, contractDetail, latestContractId, recent,
  totalCount, thisMonthCount, dangerCount, deedStats, leaseStats
}) {
  return (
    <div style={{ paddingBottom: 40 }}>
      <style>{`
        .zipt-card-hover {
          transition: all 0.35s cubic-bezier(.16,1,.3,1) !important;
          box-shadow: 0 2px 8px rgba(15,27,51,.05) !important;
        }
        .zipt-card-hover:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(42, 107, 230, 0.35) !important;
          box-shadow: 0 16px 36px rgba(42, 107, 230, 0.12) !important;
        }
        .reveal-card-left {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .reveal-card-right-1 {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) 0.08s forwards;
        }
        .reveal-card-right-2 {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) 0.15s forwards;
        }
        @keyframes zipt-ping {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
        .returning-summary-grid > * {
          min-width: 0;
        }
        @media (max-width: 640px) {
          .returning-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.04em', color: 'var(--primary)' }}>MY ZIPT</div>
          <h1 style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-.02em', margin: '8px 0 0', color: 'var(--ink)' }}>
            {name ? `${name}님, 다시 오셨네요` : '다시 오셨네요'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '7px 0 0' }}>
            가장 최근 등기부·임대차 분석 결과를 따로 정리했어요.
          </p>

          {/* 대안 1: 미니 통계 요약 배너 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '7px 12px', background: 'rgba(42, 107, 230, 0.06)', borderRadius: 8, border: '1px solid rgba(42, 107, 230, 0.12)', width: 'fit-content' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="sparkle" size={12} color="var(--primary)" stroke={2.5} />
              분석 요약
            </span>
            <span style={{ width: 1, height: 10, background: 'var(--line)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              총 분석 <strong className="tnum" style={{ fontWeight: 800, color: 'var(--primary)' }}>{totalCount}</strong>건
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-4)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              이번 달 <strong className="tnum" style={{ fontWeight: 800, color: 'var(--navy)' }}>{thisMonthCount}</strong>건
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-4)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              위험 진단 <strong className="tnum" style={{ fontWeight: 800, color: 'var(--danger-600)' }}>{dangerCount}</strong>건
            </span>
          </div>
        </div>
        <Button variant="ghost" icon="user" onClick={() => navigate('/mypage')}>마이페이지</Button>
      </section>

      <div className="returning-summary-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {deedDetail ? (
          String(deedDetail.processingStatus || '').toUpperCase() === 'FAILED' ? (
            <DocFailedCard kind="deed" navigate={navigate} />
          ) : (
            <DeedSummaryCard detail={deedDetail} analysisId={latestAnalysisId} navigate={navigate} deedStats={deedStats} />
          )
        ) : (
          <DocEmptyCard kind="deed" navigate={navigate} />
        )}
        {contractDetail ? (
          String(contractDetail.processingStatus || '').toUpperCase() === 'FAILED' ? (
            <DocFailedCard kind="lease" navigate={navigate} />
          ) : (
            <LeaseSummaryCard detail={contractDetail} contractId={latestContractId} navigate={navigate} leaseStats={leaseStats} />
          )
        ) : (
          <DocEmptyCard kind="lease" navigate={navigate} />
        )}
      </div>

      <Reveal animationType="fade-up-soft" duration={0.7} blur={false}>
        <section style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>최근 분석 내역</div>
            <span onClick={() => navigate('/mypage')} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }}>
              마이페이지에서 전체보기 ›
            </span>
          </div>
          <Card className="reveal-card-right-2" pad={0} style={{ overflow: 'hidden' }}>
            {recent.map((item, index) => {
              const status = getProcessingStatus(item.status);
              const gradeKey = item.grade ? GRADE_TO_RISK[item.grade] : null;
              const gradeRisk = gradeKey ? RISK[gradeKey] : null;
              return (
                <div
                  key={item.key}
                  onClick={() => item.id != null && navigate(item.kind === 'deed' ? `/analysis/${item.id}` : `/contract/${item.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', borderTop: index === 0 ? 'none' : '1px solid var(--line)', cursor: item.id != null ? 'pointer' : 'default' }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={item.kind === 'deed' ? 'file-text' : 'file-signature'} size={20} color="var(--primary)" stroke={1.9} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 4 }}>
                      {(item.dateLabel ? item.dateLabel + ' · ' : '') + (item.kind === 'deed' ? '등기부등본' : '임대차계약서')}
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: status.color, background: status.background, padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {status.label}
                  </span>
                  {gradeRisk && (
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: gradeRisk.on, background: gradeRisk.soft, padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {gradeRisk.label}
                    </span>
                  )}
                  <Icon name="chevron" size={18} color="var(--ink-4)" />
                </div>
              );
            })}
          </Card>
        </section>
      </Reveal>
    </div>
  );
}

export default function ReturningUserHome() {
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const name = member?.name ?? member?.nickname ?? '';
  const { data: analysisResponse, isLoading: isAnalysisLoading } = useAnalysisHistory();
  const { data: contractResponse, isLoading: isContractLoading } = useContractHistory();
  const analyses = normalizeAnalyses(analysisResponse);
  const contracts = normalizeContracts(contractResponse);
  const byDateDesc = (a, b) => new Date(getUploadedAt(b) || 0) - new Date(getUploadedAt(a) || 0);
  const sortedAnalyses = useMemo(() => [...analyses].sort(byDateDesc), [analyses]);
  const sortedContracts = useMemo(() => [...contracts].sort(byDateDesc), [contracts]);
  const latestAnalysisId = getAnalysisId(sortedAnalyses[0]);
  const latestContractId = getContractId(sortedContracts[0]);
  const { data: analysisDetailResponse, isLoading: isAnalysisDetailLoading } = useAnalysisDetail(latestAnalysisId);
  const { data: contractDetailResponse, isLoading: isContractDetailLoading } = useContractDetail(latestContractId);
  const deedDetail = normalizeDetail(analysisDetailResponse);
  const contractDetail = normalizeDetail(contractDetailResponse);

  const deeds = useMemo(() => {
    const result = normalizeAnalysisHistory(analyses);
    return result.deeds || [];
  }, [analyses]);

  const leases = useMemo(() => {
    return normalizeContractHistory(contracts);
  }, [contracts]);

  const totalCount = deeds.length + leases.length;

  const now = new Date();
  const thisMonthCount = useMemo(() => {
    return [...deeds, ...leases].filter(item => {
      const date = item.rawDate ? new Date(item.rawDate) : null;
      return date && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
  }, [deeds, leases]);

  const dangerCount = useMemo(() => {
    return [...deeds, ...leases].filter(item => item.risk === 'danger').length;
  }, [deeds, leases]);

  const deedStats = useMemo(() => {
    const completedDeeds = deeds.filter(item => item.processingStatus === "completed");
    const total = completedDeeds.length;
    const safeCount = completedDeeds.filter(item => item.risk === "safe").length;
    const warnCount = completedDeeds.filter(item => item.risk === "warn").length;
    const dangerCount = completedDeeds.filter(item => item.risk === "danger").length;
    const safePercent = total > 0 ? Math.round((safeCount / total) * 100) : 0;
    const warnPercent = total > 0 ? Math.round((warnCount / total) * 100) : 0;
    const dangerPercent = total > 0 ? Math.max(0, 100 - safePercent - warnPercent) : 0;
    return { total, safePercent, warnPercent, dangerPercent };
  }, [deeds]);

  const leaseStats = useMemo(() => {
    const completedLeases = leases.filter(item => item.processingStatus === "completed");
    const total = completedLeases.length;
    const safeCount = completedLeases.filter(item => item.risk === "safe").length;
    const warnCount = completedLeases.filter(item => item.risk === "warn").length;
    const dangerCount = completedLeases.filter(item => item.risk === "danger").length;
    const safePercent = total > 0 ? Math.round((safeCount / total) * 100) : 0;
    const warnPercent = total > 0 ? Math.round((warnCount / total) * 100) : 0;
    const dangerPercent = total > 0 ? Math.max(0, 100 - safePercent - warnPercent) : 0;
    return { total, safePercent, warnPercent, dangerPercent };
  }, [leases]);

  if (isAnalysisLoading || isContractLoading || (latestAnalysisId && isAnalysisDetailLoading) || (latestContractId && isContractDetailLoading)) {
    return <PageLoading message="분석 이력을 불러오는 중이에요..." />;
  }

  const recent = [
    ...analyses.map((item, index) => ({
      key: `a-${getAnalysisId(item) ?? index}`,
      kind: 'deed',
      id: getAnalysisId(item),
      title: getAnalysisTitle(item, index),
      file: getAnalysisFile(item, index),
      status: item.processingStatus,
      grade: item.scoreGrade,
      at: getUploadedAt(item),
      dateLabel: getUploadedAt(item) ? fmtDate(getUploadedAt(item)) : '',
    })),
    ...contracts.map((item, index) => ({
      key: `c-${getContractId(item) ?? index}`,
      kind: 'lease',
      id: getContractId(item),
      title: getContractTitle(item, index),
      file: getContractFile(item, index),
      status: item.processingStatus,
      grade: item.scoreGrade,
      at: getUploadedAt(item),
      dateLabel: getUploadedAt(item) ? fmtDate(getUploadedAt(item)) : '',
    })),
  ].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0)).slice(0, 5);

  return (
    <ReturningUserHomeView
      navigate={navigate}
      name={name}
      deedDetail={deedDetail}
      latestAnalysisId={latestAnalysisId}
      contractDetail={contractDetail}
      latestContractId={latestContractId}
      recent={recent}
      totalCount={totalCount}
      thisMonthCount={thisMonthCount}
      dangerCount={dangerCount}
      deedStats={deedStats}
      leaseStats={leaseStats}
    />
  );
}
