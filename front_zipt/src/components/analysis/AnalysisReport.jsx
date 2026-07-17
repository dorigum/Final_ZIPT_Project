import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fmtWon, fmtDate } from '../../utils/format';
import { useUploadPdf } from '../../hooks/useAnalysis';
import { AnalysisFailedState, Badge, Button, Card, Gauge, Icon, RichText, RISK, TrafficLight } from '../common/index.jsx';

/**
 * AnalysisReport.jsx
 * AnalysisResponse (백엔드) → 분석 리포트 렌더링
 */

// scoreGrade(PREMIUM/CAUTION/DANGER) → 공통 RISK 시스템 키(safe/warn/danger) 매핑
const GRADE_TO_RISK = { PREMIUM: 'safe', CAUTION: 'warn', DANGER: 'danger' };
const FAILED_STATUSES = new Set(['FAILED', 'FAIL', 'ERROR']);

const isFailedAnalysis = (data) => {
  const status = String(data?.processingStatus ?? data?.status ?? data?.analysisStatus ?? '').toUpperCase();
  return FAILED_STATUSES.has(status) || data?.success === false || Boolean(data?.processingErrorMessage);
};

const getAnalysisErrorMessage = (data) => (
  data?.processingErrorMessage
  || data?.errorMessage
  || '업로드한 파일에서 등기부등본 정보를 확인하지 못했어요. 등기부등본 형식의 PDF 또는 선명한 이미지 파일로 다시 시도해 주세요.'
);

const conTitle = (grade) => ({
  PREMIUM: '✅ 계약 진행 가능합니다',
  CAUTION: '⚠️ 신중하게 검토하세요',
  DANGER: '❌ 계약을 중단하세요',
}[grade] || 'ℹ️ 분석 결과 안내');

// 한 줄 종합 진단 문구 생성 — 백엔드가 별도 요약 문장을 내려주지 않으므로 핵심 지표로 직접 구성
function buildSummary(data) {
  const { propertyType, totalPriorityAmount, ltvRatio = 0, scoreGrade, insuranceEligible } = data;
  const debtPart = totalPriorityAmount > 0
    ? `이 집은 ${propertyType || '주택'}이고, 을구에 ${fmtWon(totalPriorityAmount)}의 근저당권이 잡혀 있어요.`
    : `이 집은 ${propertyType || '주택'}이고, 을구에 선순위 채권(근저당권 등)이 없어요.`;
  const ltvPart = scoreGrade === 'DANGER'
    ? `보증금까지 더하면 집값의 ${ltvRatio}%로 깡통전세 위험 구간이에요.`
    : scoreGrade === 'CAUTION'
      ? `보증금까지 더하면 집값의 ${ltvRatio}%로 다소 주의가 필요한 구간이에요.`
      : `보증금까지 더해도 집값의 ${ltvRatio}%로 안전한 구간이에요.`;
  const insurancePart = insuranceEligible
    ? '보증보험 가입이 가능해 안심할 수 있어요.'
    : '보증보험 가입이 어려울 수 있으니 특약과 시세를 꼭 확인하세요.';
  return `${debtPart} ${ltvPart} ${insurancePart}`;
}

function buildFallbackInsuranceConditions(data) {
  const deposit = Number(data.deposit) || 0;
  const marketPrice = Number(data.marketPrice) || 0;
  const officialPrice = Number(data.officialPrice) || 0;
  const propertyValue = marketPrice || officialPrice;
  const priorityAmount = Number(data.totalPriorityAmount) || 0;
  const hugDebtRatio = Number(data.hugDebtRatio ?? data.ltvRatio ?? 0);
  const priorityRatio = Number(data.priorityRatio ?? 0);

  const hasPropertyValue = propertyValue > 0;
  const hasDeposit = deposit > 0;
  const ltvPassed = hugDebtRatio > 0 ? hugDebtRatio <= 90 : Boolean(data.insuranceEligible);

  return [
    {
      name: '담보인정비율',
      standard: 'HUG 기준 90% 이하',
      actual: hugDebtRatio > 0 ? `${hugDebtRatio}%` : '계산 데이터 없음',
      passed: ltvPassed,
    },
    {
      name: '선순위 채권',
      standard: '없음 또는 기준 이내',
      actual: priorityAmount > 0
        ? `${fmtWon(priorityAmount)}${priorityRatio ? ` (${priorityRatio}%)` : ''}`
        : '0원',
      passed: priorityAmount === 0 || priorityRatio <= 60,
    },
    {
      name: '보증금 대비 주택가격',
      standard: '보증금이 주택가격 대비 과도하지 않음',
      actual: hasDeposit && hasPropertyValue
        ? `보증금 ${fmtWon(deposit)} / 주택가격 ${fmtWon(propertyValue)}`
        : '가격 또는 보증금 데이터 없음',
      passed: hasDeposit && hasPropertyValue ? deposit <= propertyValue : Boolean(data.insuranceEligible),
    },
  ];
}

function getInsuranceConditions(data) {
  return Array.isArray(data.insuranceConditions) && data.insuranceConditions.length > 0
    ? data.insuranceConditions
    : buildFallbackInsuranceConditions(data);
}

function buildInsuranceRecommendation(data, conditions) {
  if (data.insuranceRecommendation) return data.insuranceRecommendation;

  const failedCount = conditions.filter((condition) => !condition.passed).length;
  if (data.insuranceEligible && failedCount === 0) {
    return '현재 입력된 등기 분석 데이터 기준으로 HUG 주요 요건을 충족하는 것으로 보여요. 단, 최종 가입 가능 여부는 HUG 심사에서 확정됩니다.';
  }

  if (failedCount > 0) {
    return `현재 입력된 등기 분석 데이터 기준으로 HUG 주요 요건 중 ${failedCount}개 항목의 추가 확인이 필요해요. 계약 전 HUG 공식 심사와 전문가 확인을 권장합니다.`;
  }

  return '전세보증보험 가입 가능 여부를 판단할 상세 조건 데이터가 부족해요. 계약 전 HUG 공식 심사를 통해 최종 확인하세요.';
}

/* ── 위험 요소 한 줄 카드 ── */
function FlagRow({ risk, text }) {
  const r = RISK[risk];
  return (
    <div style={{ display: 'flex', gap: 12, padding: '13px 14px', borderRadius: 'var(--r-md)', background: r.soft, alignItems: 'flex-start' }}>
      <Icon name={risk === 'safe' ? 'check-circle' : risk === 'warn' ? 'alert-circle' : 'x-circle'} size={19} color={r.on} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 13.5, fontWeight: 600, color: r.on, lineHeight: 1.5 }}>
        <RichText text={text} />
      </div>
    </div>
  );
}

/* ── HUG 요건 카드 (조건 1개, 표 대신 시각화) ── */
function ConditionCard({ name, standard, actual, passed, ratio, threshold }) {
  const r = passed ? RISK.safe : RISK.danger;
  const hasRatio = typeof ratio === 'number' && !Number.isNaN(ratio);
  return (
    <Card style={{ padding: '15px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={passed ? 'check-circle' : 'x-circle'} size={17} color={r.on} stroke={2.2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1, minWidth: 0 }}>{name}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: r.on, background: r.soft, padding: '3px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          {passed ? '패스' : '미달'}
        </span>
      </div>

      {hasRatio ? (
        <>
          <div className="tnum" style={{ fontSize: 21, fontWeight: 800, color: r.on, marginTop: 10 }}>{Math.round(ratio)}%</div>
          <div style={{ position: 'relative', height: 8, borderRadius: 99, background: 'var(--surface-3)', marginTop: 8, overflow: 'visible' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(100, Math.max(0, ratio))}%`, background: r.color, transition: 'width .8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            {typeof threshold === 'number' && (
              <div style={{ position: 'absolute', left: `${Math.min(100, threshold)}%`, top: -3, bottom: -3, width: 2, background: 'var(--ink-4)' }} />
            )}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', marginTop: 10 }}>{actual}</div>
      )}

      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 8, lineHeight: 1.4 }}>{standard}</div>
    </Card>
  );
}

/* ── 담보인정비율(LTV) 막대 ── */
function DebtRatio({ data }) {
  const seniorDebt = data.totalPriorityAmount || 0;
  const deposit = data.deposit || 0;
  const appraisedValue = data.marketPrice || data.officialPrice || 0;
  const total = seniorDebt + deposit;
  const ltv = Math.round(data.hugDebtRatio || (appraisedValue > 0 ? (total / appraisedValue) * 100 : 0));
  const r = ltv <= 80 ? RISK.safe : ltv <= 90 ? RISK.warn : RISK.danger;
  const seniorPct = appraisedValue > 0 ? (seniorDebt / appraisedValue) * 100 : 0;
  const depositPct = appraisedValue > 0 ? (deposit / appraisedValue) * 100 : 0;
  const exceedsHugLimit = ltv >= 90;

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>담보인정비율 (집값 대비 빚)</span>
        <span className="tnum" style={{ fontSize: 22, fontWeight: 800, color: r.on }}>{ltv}%</span>
      </div>
      <div style={{ position: 'relative', height: 22, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: animate ? `${Math.min(100, seniorPct)}%` : '0%',
          background: 'var(--warn)',
          transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
        <div style={{
          position: 'absolute',
          left: animate ? `${seniorPct}%` : '0%',
          top: 0,
          bottom: 0,
          width: animate ? `${Math.min(100 - seniorPct, depositPct)}%` : '0%',
          background: 'var(--primary)',
          transition: 'left 1s cubic-bezier(0.16, 1, 0.3, 1), width 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
        <div style={{ position: 'absolute', left: '90%', top: -3, bottom: -3, width: 2, background: 'var(--danger)' }} />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 11, fontSize: 12, color: 'var(--ink-2)', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--warn)', display: 'inline-block' }} /> 선순위 채권 {fmtWon(seniorDebt)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <i style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--primary)', display: 'inline-block' }} /> 내 보증금 {fmtWon(deposit)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 'auto', color: 'var(--danger)', fontWeight: 700 }}>
          <i style={{ width: 2, height: 12, background: 'var(--danger)', display: 'inline-block' }} /> HUG 한도 90%
        </span>
      </div>
      <div style={{ marginTop: 16, padding: '13px 15px', background: exceedsHugLimit ? 'var(--danger-soft)' : 'var(--safe-soft)', borderRadius: 'var(--r-md)', display: 'flex', gap: 10 }}>
        <Icon name={exceedsHugLimit ? 'alert' : 'check-circle'} size={18} color={exceedsHugLimit ? 'var(--danger-600)' : 'var(--safe-600)'} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>
          보증금과 <RichText text="선순위 채권" />을 합치면 집값의 <b style={{ color: exceedsHugLimit ? 'var(--danger-600)' : 'var(--safe-600)' }}>{ltv}%</b>예요.
          {exceedsHugLimit
            ? <> HUG <RichText text="담보인정비율" /> 기준(90%)을 넘어 <b>깡통전세</b>가 우려돼요.</>
            : <> HUG <RichText text="담보인정비율" /> 기준(90%) 이내예요.</>}
        </div>
      </div>
    </Card>
  );
}

export default function AnalysisReport({ data, onBack }) {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const insuranceRef = useRef(null);
  const { mutate: uploadPdf, isPending: pdfLoading } = useUploadPdf();

  if (!data) {
    return <div style={{ textAlign: 'center', padding: 40 }}>리포트 데이터를 불러오는 중입니다...</div>;
  }

  if (isFailedAnalysis(data)) {
    return (
      <AnalysisFailedState
        title="등기부등본을 분석할 수 없어요"
        message={getAnalysisErrorMessage(data)}
        primaryAction={{
          label: '다른 파일 업로드',
          icon: 'upload',
          onClick: () => navigate('/analysis'),
        }}
        secondaryAction={{
          label: '분석 내역 보기',
          icon: 'list',
          onClick: () => {
            sessionStorage.setItem('mypage_active_tab', 'deed');
            navigate('/mypage');
          },
        }}
      />
    );
  }

  const ltvRatio = data.ltvRatio || 0;
  const riskScore = data.riskScore || 0;
  const scoreGrade = data.scoreGrade || 'CAUTION';
  const riskKey = GRADE_TO_RISK[scoreGrade] || 'warn';
  const r = RISK[riskKey];

  // 보증보험 조건 분리 (HUG 3대 공식)
  const insuranceConditions = getInsuranceConditions(data);
  const insuranceRecommendation = buildInsuranceRecommendation(data, insuranceConditions);
  const condCore = insuranceConditions.slice(0, 3);
  const condExtra = insuranceConditions.slice(3);

  // 핵심 3대 조건은 순서가 고정돼 있어(담보인정비율/선순위 채권/보증금 대비 주택가격),
  // 표 대신 각 카드에 채워 넣을 비율(0~100)을 data에서 직접 계산한다.
  const conditionRatios = [
    { ratio: Number(data.hugDebtRatio ?? data.ltvRatio) || undefined, threshold: 90 },
    { ratio: Number(data.priorityRatio) || undefined, threshold: 60 },
    (() => {
      const propertyValue = Number(data.marketPrice) || Number(data.officialPrice) || 0;
      const deposit = Number(data.deposit) || 0;
      return {
        ratio: propertyValue > 0 && deposit > 0 ? (deposit / propertyValue) * 100 : undefined,
        threshold: 100,
      };
    })(),
  ];

  // 위험 요소 카드 — 백엔드 riskFactors(위험)/registryWarnings(주의)를 색상별 한 줄 카드로 변환
  const flags = [
    ...(data.riskFactors || []).map((text) => ({ risk: 'danger', text })),
    ...(data.registryWarnings || []).map((text) => ({ risk: 'warn', text })),
  ];

  const handlePdf = async () => {
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [imgWidth, imgHeight] });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const pdfBlob = pdf.output('blob');

      uploadPdf(
        { id: data.id, pdfBlob },
        {
          onSuccess: () => pdf.save(`zipt-report-${data.id}.pdf`),
          onError: () => alert('PDF 저장 실패'),
        }
      );
    } catch (e) {
      alert('PDF 생성 실패');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '16px 0 48px', animation: 'zipt-fade .3s ease' }}>
      <style>{`
        @media (max-width: 768px) {
          .analysis-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .analysis-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, padding: 0, cursor: 'pointer' }}>
        <Icon name="arrow-left" size={16} /> 다른 서류 분석하기
      </button> */}

      <div ref={reportRef}>
        {/* ── 히어로: 게이지 + 종합 진단 ── */}
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 18 }}>
          <div className="analysis-hero-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr' }}>
            <div style={{ padding: '30px 24px', background: 'var(--surface-2)', borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Gauge value={riskScore} size={210} label={`${r.label} 단계`} sub="HUG 기준 종합 판정" />
            </div>
            <div style={{ padding: '26px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Icon name="pin" size={17} color="var(--ink-3)" />
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>{data.address || '주소 정보 없음'}</span>
                <Badge tone="neutral" size="sm">{data.analyzedAt ? fmtDate(data.analyzedAt) : '방금 전'} 분석</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 17, fontWeight: 800 }}>ZIPT 종합 진단</span>
                <Badge tone={riskKey} solid icon={riskKey === 'safe' ? 'check' : 'alert'}>{r.label}</Badge>
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '15px 17px' }}>
                <RichText text={buildSummary(data)} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
                <Button icon="shield-check" onClick={() => insuranceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>보증보험 가능 여부 확인</Button>
                <Button variant="ghost" icon="download" onClick={handlePdf} disabled={pdfLoading}>{pdfLoading ? 'PDF 저장 중...' : 'PDF 저장'}</Button>
                <Button variant="ghost" icon="list" onClick={() => {
                                                          sessionStorage.setItem("mypage_active_tab", "deed");
                                                          navigate('/mypage');
                                                        }}>서류 분석 내역 보기</Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="analysis-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18, alignItems: 'start', marginBottom: 18 }}>
          {/* ── 좌측: 위험 요소 + LTV ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card>
              <div style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 4 }}>이것만은 꼭 확인하세요</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>AI가 추출한 위험 요소를 정리했어요.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {flags.length > 0
                  ? flags.map((f, i) => <FlagRow key={i} risk={f.risk} text={f.text} />)
                  : <FlagRow risk="safe" text="압류·가압류·신탁 등 치명적 위험 키워드는 없어요." />}
              </div>
            </Card>

            <DebtRatio data={data} />
          </div>

          {/* ── 우측: 갑구/을구 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Card>
              <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>갑</span>
                갑구 · 소유권
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <TrafficLight active="safe" size={9} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>소유권보존</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>
                    현재 소유자 {data.ownerName || '정보 없음'}{data.buildingYear ? ` · 건축 ${data.buildingYear}년` : ''}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>을</span>
                을구 · 채권
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.priorityBonds && data.priorityBonds.length > 0 ? (
                  data.priorityBonds.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                      <TrafficLight active="warn" size={9} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}><RichText text={b.type || '근저당권'} /></div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>
                          채권최고액 {fmtWon(b.amount)}{b.creditor ? ` (${b.creditor})` : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <TrafficLight active="safe" size={9} />
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>선순위 채권 없음</div>
                  </div>
                )}
              </div>
            </Card>

            <div style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5, padding: '0 4px' }}>
              ⓘ 본 분석은 참고용이며 법적 효력이 없어요. 최종 계약 전 전문가 상담을 권장해요.
            </div>
          </div>
        </div>

        {/* ── 전세보증보험 가입 요건 검증 (HUG 검증) ── */}
        <Card style={{ marginBottom: 18 }}>
          <div ref={insuranceRef} style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 16 }}>🛡 전세보증보험 반환 조건 (HUG 검증)</div>

          <div style={{ padding: 14, borderRadius: 'var(--r-md)', marginBottom: 16, background: data.insuranceEligible ? 'var(--safe-soft)' : 'var(--danger-soft)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: data.insuranceEligible ? 'var(--safe-600)' : 'var(--danger-600)' }}>
              {data.insuranceEligible ? '✅ HUG 전세보증보험 가입 요건 충족' : '🚫 HUG 전세보증보험 가입 불가 대상'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{insuranceRecommendation}</div>
          </div>

          <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>핵심 요건 검증 (HUG 3대 공식)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: condExtra.length ? 18 : 0 }}>
            {condCore.map((c, i) => (
              <ConditionCard key={i} {...c} ratio={conditionRatios[i]?.ratio} threshold={conditionRatios[i]?.threshold} />
            ))}
          </div>

          {condExtra.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px' }}>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>기타 행정 조건</span>
                <div style={{ flex: 1, borderTop: '1px dashed var(--line-2)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {condExtra.map((c, i) => {
                  const cr = RISK[c.passed ? 'safe' : 'danger'];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 'var(--r-md)', background: cr.soft }}>
                      <Icon name={c.passed ? 'check-circle' : 'x-circle'} size={15} color={cr.on} stroke={2.2} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{c.name}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--ink-3)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.actual}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: cr.on, flexShrink: 0 }}>{c.passed ? '합격' : '불합격'}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        {/* ── 최종 결론 ── */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{conTitle(scoreGrade)}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.8 }}>
            <p style={{ margin: '4px 0' }}>✓ LTV {ltvRatio}% — 시세 대비 보증금 비율 {ltvRatio <= 80 ? '안전' : '주의'}</p>
            <p style={{ margin: '4px 0' }}>{data.totalPriorityAmount > 0 ? `⚠️ 선순위 채권 ${fmtWon(data.totalPriorityAmount)} 존재` : '✓ 선순위 채권 없음 — 은행 대출 없는 매물'}</p>
            {data.insuranceEligible && <p style={{ margin: '4px 0' }}>✓ HUG 전세보증보험 가입 가능 — 보증금 보호</p>}
            <p style={{ margin: '4px 0', color: 'var(--ink-4)' }}>ℹ️ 계약 전 공인중개사 · 법무사 최종 확인 권장</p>
          </div>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, marginBottom: 12 }}>
        <Button variant="ghost" full icon="arrow-left" onClick={() => navigate('/analysis')}>다른 서류 분석하기</Button>
        <Button full icon="download" onClick={handlePdf} disabled={pdfLoading}>{pdfLoading ? 'PDF 저장 중...' : '분석 리포트 PDF 저장'}</Button>
      </div>

      <p style={{ fontSize: 13.5, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.75, margin: '4px 0 0', fontWeight: 700 }}>
        본 분석 결과는 공공데이터를 기반으로 생성된 참고용 데이터이며 법적 효력이 없습니다.<br />
        반드시 계약 전 HUG 공식 홈페이지(khug.or.kr)에서 최종 승인 여부를 조회하시기 바랍니다.
      </p>
    </div>
  );
}
