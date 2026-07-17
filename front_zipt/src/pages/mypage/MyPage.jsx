import { useEffect as useMyEffect, useMemo as useMyMemo, useState as useMy } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, PageError, PageLoading } from "../../components/common/index.jsx";
import { useReportLibrary } from "../../components/mypage/useReportLibrary.js";
import { useAuthStore } from "../../store/useAuthStore";
import { logout as logoutApi } from "../../api/authApi";
import styles from "./MyPage.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";
import { truncateFileName } from "../../components/analysis/normalizers.js";
import { formatDday } from "../../utils/format.js";
import profile1 from "../../assets/profiles/profile_1.png?w=120&format=webp";
import profile2 from "../../assets/profiles/profile_2.png?w=120&format=webp";
import profile3 from "../../assets/profiles/profile_3.png?w=120&format=webp";

const PROVIDER_META = {
  kakao: { label: "카카오 로그인", color: "#e0a800", background: "rgba(224,168,0,.14)" },
  google: { label: "구글 로그인", color: "#4285f4", background: "rgba(66,133,244,.14)" },
  naver: { label: "네이버 로그인", color: "#8bc34a", background: "rgba(139,195,74,.16)" },
};
const DEFAULT_PROVIDER_META = { label: "이메일 로그인", color: "#7a89a4", background: "rgba(122, 137, 164, 0.14)" };

const PAGE_SIZE = 5;

const getProfileImage = (username) => {
  if (!username) return profile1;
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;
  return [profile1, profile2, profile3][index];
};

function useAppOutletFallback() {
  const navigate = useNavigate();
  const t = {};
  const onGo = (key, param) => {
    if ((key === "contract" || key === "contractDetail") && param !== undefined && param !== null) {
      if (typeof param === "string" && param.startsWith("l")) {
        navigate("/contract");
      } else {
        navigate(`/contract/${param}`);
      }
      return;
    }
    if (key === "analysisDetail" && param) {
      navigate(`/analysis/${param}`);
      return;
    }
    const paths = {
      home: "/",
      upload: "/analysis",
      hug: "/insurance",
      terms: "/terms",
      infra: "/map",
      compare: "/compare",
      mypage: "/mypage",
    };
    navigate(paths[key] || "/");
  };
  return { t, onGo };
}

/* 계약 일정 알림이 켜진 항목의 가장 임박한(아직 안 지난) 날짜 하나를 골라 D-day로 보여준다 */
function getUpcomingSchedule(item) {
  if (!item?.trackingEnabled) return null;

  const candidates = [
    item.deliveryDate && { label: "인도일", date: item.deliveryDate },
    item.endDate && { label: "계약종료", date: item.endDate },
  ].filter(Boolean);

  const upcoming = candidates
    .map((c) => ({ ...c, dday: formatDday(c.date) }))
    .filter((c) => c.dday && !c.dday.startsWith("D+"))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return upcoming[0] || null;
}

/* 만원 단위 → "2.4억 / 5,000만원" 표기 */
function fmtDeposit(man) {
  if (man >= 10000) {
    const eok = man / 10000;
    return (Number.isInteger(eok) ? eok : eok.toFixed(1)) + "억";
  }
  return man.toLocaleString() + "만원";
}

/* ───────────────────────── 프로필 헤더 ───────────────────────── */
function ProfileHeader() {
  const member = useAuthStore((state) => state.member);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const beginLogout = useAuthStore((state) => state.beginLogout);
  const finishLogout = useAuthStore((state) => state.finishLogout);

  const name = member?.name || member?.nickname || "사용자";
  const email = member?.email || "";
  const providerMeta = PROVIDER_META[member?.provider] || DEFAULT_PROVIDER_META;
  const profileImg = getProfileImage(name);

  const handleLogout = async () => {
    beginLogout();
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    }
    logout();
    navigate("/", { replace: true });
    finishLogout();
  };

  return (
    <Card pad={0} className={styles.component01}>
      <div className={styles.row01}>
        <img 
          src={profileImg} 
          alt="프로필 캐릭터" 
          className={styles.row02} 
          style={{ objectFit: "cover", border: "2px solid rgba(255,255,255,.25)" }}
        />
        <div className={styles.div01}>
          <div className={styles.row03}>
            <span className={styles.text01}>{name}님</span>
            <span
              className={styles.text02}
              style={{
                "--state-text02-color": toCssVariable(providerMeta.color),
                "--state-text02-background": toCssVariable(providerMeta.background),
              }}
            >
              <Icon name="sparkle" size={12} stroke={2.4} /> {providerMeta.label}
            </span>
          </div>
          {email && (
            <div 
              style={{ 
                fontSize: "13px", 
                color: "rgba(255,255,255,0.7)", 
                marginTop: "5px",
                fontWeight: 500
              }}
            >
              {email}
            </div>
          )}
        </div>
        <button onClick={handleLogout} className={styles.button01}>
          <Icon name="logout" size={15} stroke={2.1} /> 로그아웃
        </button>
      </div>
    </Card>
  );
}

/* ───────────────────────── 분석 결과 행(카드) ───────────────────────── */
function ReportRow({ kind, item, selectMode, selected, onToggle, onView, onDelete }) {
  const [h, setH] = useMy(false);
  const isDeed = kind === "deed";
  const isCompleted = item.processingStatus === "completed";

  const riskMeta = {
    safe: { label: '안전', background: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
    warn: { label: '주의', background: '#fef3c7', color: '#b45309', border: '#fde68a' },
    danger: { label: '위험', background: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  }[item.risk] ?? { label: '확인 필요', background: '#e0e7ff', color: '#1d4ed8', border: '#c7d2fe' };

  const statusMeta = {
    completed: { label: '처리완료', background: '#dcfce7', color: '#15803d' },
    processing: { label: '처리중', background: '#fef3c7', color: '#b45309' },
    failed: { label: '처리실패', background: '#fee2e2', color: '#b91c1c' },
  }[item.processingStatus] ?? { label: '처리완료', background: '#dcfce7', color: '#15803d' };

  const fileIcon = isDeed ? "📋" : "📄";
  const rowTitle = item.title;
  const truncatedName = truncateFileName(item.fileName);
  const metaText = isDeed
    ? `파일명: ${truncatedName} · ${item.analyzedAt}`
    : `파일명: ${truncatedName} · ${item.analyzedAt}${item.type ? ` · ${item.type}` : ''}`;
  const schedule = !isDeed ? getUpcomingSchedule(item) : null;

  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => selectMode ? onToggle() : onView()}
      className={styles.stateRow03}
      style={{
        "--state-row03-border-color": toCssVariable(selected ? "var(--primary)" : (h ? "var(--line-2)" : "var(--line)")),
        "--state-row03-box-shadow": toCssVariable(h ? "var(--sh-md)" : "var(--sh-sm)"),
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        cursor: 'pointer'
      }}
    >
      {/* 체크박스 (선택 모드) */}
      {selectMode && (
        <span className={styles.stateRow04} style={{ "--state-row04-border-color": toCssVariable(selected ? "var(--primary)" : "var(--line-2)"), "--state-row04-background": toCssVariable(selected ? "var(--primary)" : "transparent"), marginRight: '4px' }}>
          {selected && <Icon name="check" size={14} color="#fff" stroke={3} />}
        </span>
      )}

      {/* 파일 아이콘 */}
      <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 10, background: '#eff6ff', fontSize: 20 }}>
        {fileIcon}
      </div>

      {/* 본문 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, color: '#1e293b', fontWeight: 700, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {rowTitle}
        </p>
        <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {metaText}
        </p>
      </div>

      {/* 처리 상태 배지 + 액션 (조회 / 삭제 / 이동화살표) */}
      <div className={styles.reportRowActions}>
        <div className={styles.reportRowBadges}>
          {isCompleted && isDeed ? (
            <>
              <span style={{ padding: '5px 9px', borderRadius: 999, background: '#eef4ff', color: 'var(--primary-700)', border: '1px solid #dbe7ff', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
                점수 <b className="tnum">{item.score ?? 0}</b>점
              </span>
              <span style={{ padding: '5px 9px', borderRadius: 999, background: riskMeta.background, color: riskMeta.color, border: `1px solid ${riskMeta.border}`, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {riskMeta.label}
              </span>
            </>
          ) : isCompleted ? (
            <span style={{ padding: '5px 9px', borderRadius: 999, background: riskMeta.background, color: riskMeta.color, border: `1px solid ${riskMeta.border}`, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
              {riskMeta.label}
            </span>
          ) : null}
          {schedule && (
            <span title={`${schedule.label} ${schedule.date}`} style={{ padding: '5px 9px', borderRadius: 999, background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
              <Icon name="bell" size={11} stroke={2.4} style={{ verticalAlign: -1, marginRight: 3 }} />
              {schedule.label} {schedule.dday}
            </span>
          )}
        </div>
        <span style={{ padding: '5px 9px', borderRadius: 999, background: statusMeta.background, color: statusMeta.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {statusMeta.label}
        </span>

        {!selectMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
            <Button size="sm" variant="soft" icon="eye" onClick={(e) => { e.stopPropagation(); onView(); }}>조회</Button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="삭제"
              className={styles.stateButton01}>
              <Icon name="trash" size={17} stroke={2} />
            </button>
            <span aria-hidden={true} style={{ color: '#94a3b8', fontSize: 20 }}>›</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── 빈 상태 ───────────────────────── */
function EmptyState({ kind, onGo }) {
  const isDeed = kind === "deed";
  return (
    <div className={styles.column01}>
      <span className={styles.row09}>
        <Icon name="inbox" size={28} color="var(--ink-4)" stroke={1.7} />
      </span>
      <div className={styles.div07}>아직 분석한 {isDeed ? "등기부등본이" : "임대차계약서가"} 없어요</div>
      <div className={styles.div08}>
        {isDeed ? "등기부등본을 올리면 깡통전세·근저당 위험을 분석해 드려요." : "계약서를 올리면 숨은 독소조항을 찾아 쉬운 말로 풀어 드려요."}
      </div>
      <div className={styles.div09}>
        <Button icon="upload" onClick={() => onGo("upload")}>{isDeed ? "등기부등본 분석하기" : "계약서 분석하기"}</Button>
      </div>
    </div>
  );
}

/* ───────────────────────── 삭제 확인 모달 ───────────────────────── */
function ConfirmModal({ count, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} className={styles.row10}>
      <div onClick={(e) => e.stopPropagation()} className={styles.panel01}>
        <span className={styles.text07}>
          <Icon name="trash" size={25} color="var(--danger-600)" stroke={2} />
        </span>
        <div className={styles.div10}>분석 결과를 삭제할까요?</div>
        <div className={styles.div11}>
          선택한 <b className={`tnum ${styles.text08}`} >{count}건</b>의 분석 결과가 보관함에서 삭제돼요.<br />삭제 후 목록에서 바로 제거됩니다.
        </div>
        <div className={styles.row11}>
          <Button variant="ghost" full onClick={onCancel}>취소</Button>
          <Button variant="danger" full icon="trash" onClick={onConfirm}>삭제</Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 삭제 결과 모달 ───────────────────────── */
function DeleteNoticeModal({ notice, onClose }) {
  const failed = Boolean(notice?.error);
  return (
    <div onClick={onClose} className={styles.row10}>
      <div onClick={(e) => e.stopPropagation()} className={styles.panel01}>
        <span className={styles.text07} style={{ background: failed ? 'var(--danger-soft)' : 'var(--safe-soft)' }}>
          <Icon name={failed ? "alert-circle" : "check-circle"} size={25} color={failed ? "var(--danger-600)" : "var(--safe-600)"} stroke={2} />
        </span>
        <div className={styles.div10}>{failed ? "삭제에 실패했어요" : "삭제되었습니다."}</div>
        <div className={styles.div11}>
          {failed ? notice.error : <><b className="tnum">{notice.count}건</b>의 분석 결과가 목록에서 제거됐어요.</>}
        </div>
        <div className={styles.row11}>
          <Button full onClick={onClose}>확인</Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── 실행취소 토스트 ───────────────────────── */
function UndoToast({ count, onUndo, onClose }) {
  useMyEffect(() => {
    const id = setTimeout(onClose, 5000);
    return () => clearTimeout(id);
  }, [count]);
  return (
    <div className={styles.row12}>
      <span className={styles.text09}>
        <Icon name="check-circle" size={17} color="#7ee0b0" stroke={2.2} />
        {count}건을 삭제했어요
      </span>
      <button onClick={onUndo} className={styles.button02}>
        <Icon name="undo" size={15} stroke={2.2} /> 실행취소
      </button>
    </div>
  );
}

/* ───────────────────────── 마이페이지 메인 ───────────────────────── */
function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="분석 이력 페이지">
      <button
        type="button"
        className={styles.paginationNav}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
      >
        <Icon name="arrow-left" size={15} stroke={2.1} />
      </button>
      <div className={styles.paginationPages}>
        {Array.from({ length: pageCount }, (_, index) => {
          const pageNumber = index + 1;
          const active = pageNumber === page;
          return (
            <button
              key={pageNumber}
              type="button"
              className={styles.paginationPage}
              data-active={active ? "true" : "false"}
              onClick={() => onPageChange(pageNumber)}
              aria-current={active ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.paginationNav}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="다음 페이지"
      >
        <Icon name="chevron" size={15} stroke={2.1} />
      </button>
    </nav>
  );
}

/* ───────────────────────── 대시보드 요약 섹션 ───────────────────────── */
function DashboardSection({ deeds, leases, upcomingSchedules, onGo }) {
  const totalCount = deeds.length + leases.length;
  
  // 위험 건수 (risk === 'danger')
  const dangerCount = [...deeds, ...leases].filter(item => item.risk === "danger").length;
  
  // 이번 달 분석 건수
  const now = new Date();
  const thisYearMonth = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCount = [...deeds, ...leases].filter(item => {
    const dateStr = item.analyzedAt || item.createdAt || "";
    return dateStr.includes(thisYearMonth);
  }).length;

  // 1) 등기부등본 완료 항목 및 분포 계산
  const completedDeeds = deeds.filter(item => item.processingStatus === "completed");
  const totalDeeds = completedDeeds.length;
  const safeDeedsCount = completedDeeds.filter(item => item.risk === "safe").length;
  const warnDeedsCount = completedDeeds.filter(item => item.risk === "warn").length;
  const dangerDeedsCount = completedDeeds.filter(item => item.risk === "danger").length;

  const safeDeedsPercent = totalDeeds > 0 ? Math.round((safeDeedsCount / totalDeeds) * 100) : 0;
  const warnDeedsPercent = totalDeeds > 0 ? Math.round((warnDeedsCount / totalDeeds) * 100) : 0;
  const dangerDeedsPercent = totalDeeds > 0 ? Math.max(0, 100 - safeDeedsPercent - warnDeedsPercent) : 0;

  // 2) 임대차계약서 완료 항목 및 분포 계산
  const completedLeases = leases.filter(item => item.processingStatus === "completed");
  const totalLeases = completedLeases.length;
  const safeLeasesCount = completedLeases.filter(item => item.risk === "safe").length;
  const warnLeasesCount = completedLeases.filter(item => item.risk === "warn").length;
  const dangerLeasesCount = completedLeases.filter(item => item.risk === "danger").length;

  const safeLeasesPercent = totalLeases > 0 ? Math.round((safeLeasesCount / totalLeases) * 100) : 0;
  const warnLeasesPercent = totalLeases > 0 ? Math.round((warnLeasesCount / totalLeases) * 100) : 0;
  const dangerLeasesPercent = totalLeases > 0 ? Math.max(0, 100 - safeLeasesPercent - warnLeasesPercent) : 0;

  return (
    <div className={styles.dashboardGrid}>
      {/* 좌측: 내 분석 위험도 분포 */}
      <Card className={styles.statCard} pad={20}>
        <div className={styles.dashboardHeader}>
          <Icon name="sparkle" size={17} color="var(--primary)" stroke={2.1} />
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>내 분석 위험도 분포</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
          {/* 1. 등기부등본 스펙트럼 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>등기부등본</span>
              {totalDeeds > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)" }}>완료된 {totalDeeds}건 기준</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)" }}>분석 내역 없음</span>
              )}
            </div>
            
            {totalDeeds > 0 ? (
              <div>
                <div className={styles.spectrumBar}>
                  {safeDeedsPercent > 0 && (
                    <div style={{ width: `${safeDeedsPercent}%`, background: "var(--safe)" }} title={`안전: ${safeDeedsCount}건 (${safeDeedsPercent}%)`} />
                  )}
                  {warnDeedsPercent > 0 && (
                    <div style={{ width: `${warnDeedsPercent}%`, background: "var(--warn)" }} title={`주의: ${warnDeedsCount}건 (${warnDeedsPercent}%)`} />
                  )}
                  {dangerDeedsPercent > 0 && (
                    <div style={{ width: `${dangerDeedsPercent}%`, background: "var(--danger)" }} title={`위험: ${dangerDeedsCount}건 (${dangerDeedsPercent}%)`} />
                  )}
                </div>
                <div className={styles.spectrumLabels}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--safe)", display: "inline-block" }} />
                    <span>안전 <span className="tnum" style={{ fontWeight: 700 }}>{safeDeedsPercent}%</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)", display: "inline-block" }} />
                    <span>주의 <span className="tnum" style={{ fontWeight: 700 }}>{warnDeedsPercent}%</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
                    <span>위험 <span className="tnum" style={{ fontWeight: 700 }}>{dangerDeedsPercent}%</span></span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--ink-4)", background: "var(--surface-1)", padding: "10px 12px", borderRadius: 8, border: "1px dashed var(--line)", textAlign: "center" }}>
                분석 완료된 등기부등본 문서가 없습니다.
              </div>
            )}
          </div>

          {/* 2. 임대차계약서 스펙트럼 */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>임대차계약서</span>
              {totalLeases > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)" }}>완료된 {totalLeases}건 기준</span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)" }}>분석 내역 없음</span>
              )}
            </div>
            
            {totalLeases > 0 ? (
              <div>
                <div className={styles.spectrumBar}>
                  {safeLeasesPercent > 0 && (
                    <div style={{ width: `${safeLeasesPercent}%`, background: "var(--safe)" }} title={`안전: ${safeLeasesCount}건 (${safeLeasesPercent}%)`} />
                  )}
                  {warnLeasesPercent > 0 && (
                    <div style={{ width: `${warnLeasesPercent}%`, background: "var(--warn)" }} title={`주의: ${warnLeasesCount}건 (${warnLeasesPercent}%)`} />
                  )}
                  {dangerLeasesPercent > 0 && (
                    <div style={{ width: `${dangerLeasesPercent}%`, background: "var(--danger)" }} title={`위험: ${dangerLeasesCount}건 (${dangerLeasesPercent}%)`} />
                  )}
                </div>
                <div className={styles.spectrumLabels}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--safe)", display: "inline-block" }} />
                    <span>안전 <span className="tnum" style={{ fontWeight: 700 }}>{safeLeasesPercent}%</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warn)", display: "inline-block" }} />
                    <span>주의 <span className="tnum" style={{ fontWeight: 700 }}>{warnLeasesPercent}%</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
                    <span>위험 <span className="tnum" style={{ fontWeight: 700 }}>{dangerLeasesPercent}%</span></span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "var(--ink-4)", background: "var(--surface-1)", padding: "10px 12px", borderRadius: 8, border: "1px dashed var(--line)", textAlign: "center" }}>
                분석 완료된 임대차계약서 문서가 없습니다.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 우측: 분석 통계 및 D-day 일정 */}
      <Card className={styles.reminderCard} pad={20}>
        <div className={styles.dashboardHeader}>
          <Icon name="bell" size={17} color="#4338ca" stroke={2.1} />
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>계약 일정 및 분석 통계</span>
        </div>

        {/* 1층: 통계 배너 */}
        <div className={styles.metricsWrapper} style={{ marginBottom: 16 }}>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>총 분석 서류</div>
            <div className={styles.metricValue} style={{ color: "var(--primary)" }}>
              <span className="tnum">{totalCount}</span><span className={styles.metricUnit}>건</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>이번 달 분석</div>
            <div className={styles.metricValue} style={{ color: "var(--navy)" }}>
              <span className="tnum">{thisMonthCount}</span><span className={styles.metricUnit}>건</span>
            </div>
          </div>
          <div className={styles.metricItem}>
            <div className={styles.metricLabel}>위험 진단</div>
            <div className={styles.metricValue} style={{ color: "var(--danger-600)" }}>
              <span className="tnum">{dangerCount}</span><span className={styles.metricUnit}>건</span>
            </div>
          </div>
        </div>

        {/* 2층: 다가오는 일정 목록 */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>다가오는 계약 일정</div>
          
          <div className={styles.reminderContent} style={{ minHeight: "auto" }}>
            {upcomingSchedules.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingSchedules.map(sch => (
                  <div key={sch.id + sch.label} className={styles.reminderItem} onClick={() => onGo("contractDetail", sch.id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.reminderTitle}>{sch.title}</div>
                      <div className={styles.reminderMeta}>{sch.label}: {sch.date}</div>
                    </div>
                    <span className={`tnum ${styles.reminderDday}`}>
                      {sch.dday}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyReminder} style={{ padding: "12px 8px" }}>
                <Icon name="bell-off" size={20} color="var(--ink-4)" stroke={1.7} />
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginTop: 6 }}>예약된 계약 일정이 없어요</div>
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2, textAlign: "center" }}>
                  임대차 보증함에서 일정 알림을 켜두시면 D-day가 노출됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ───────────────────────── 같은 매물 묶음 섹션 ───────────────────────── */
/* 등기부등본과 임대차계약서의 주소(동/호수 포함)가 완전히 일치할 때만 하나의 매물로 묶어 보여준다 */
function MatchedPropertySection({ groups, onGo }) {
  if (!groups || groups.length === 0) return null;

  return (
    <Card pad={20} style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Icon name="home" size={17} color="var(--primary)" stroke={2.1} />
        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>같은 매물로 묶인 서류</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)" }}>
          주소가 동/호수까지 정확히 일치하는 등기부등본·임대차계약서만 함께 보여드려요
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {groups.map(({ key, addr, deed, lease }) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid var(--line)",
              background: "var(--surface-1)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-4)", marginBottom: 3 }}>매물 주소</div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {addr}
              </div>
            </div>
            <Button size="sm" variant="soft" icon="file-text" onClick={() => onGo("analysisDetail", deed.id)}>
              등기부등본 조회
            </Button>
            <Button size="sm" variant="soft" icon="file-signature" onClick={() => onGo("contractDetail", lease.id)}>
              임대차계약서 조회
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function MyPage() {
  const { onGo } = useAppOutletFallback();
  const {
    isLoading, isError, error,
    tab, deeds, leases, matchedGroups, isDeed, list, selectMode, setSelectMode, selectedIds,
    confirm, setConfirm, undo, setUndo, notice, setNotice, allSelected, resetSelection, switchTab,
    toggleId, toggleAll, askDelete, doDelete, doUndo,
  } = useReportLibrary();
  const [page, setPage] = useMy(1);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedList = useMyMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }, [list, currentPage]);

  const upcomingSchedules = useMyMemo(() => {
    const list = [];
    leases.forEach(item => {
      const schedule = getUpcomingSchedule(item);
      if (schedule) {
        list.push({
          id: item.id,
          title: item.title,
          label: schedule.label,
          date: schedule.date,
          dday: schedule.dday
        });
      }
    });
    return list
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 2);
  }, [leases]);

  useMyEffect(() => {
    setPage(1);
  }, [tab]);

  useMyEffect(() => {
    setPage((prev) => Math.min(prev, pageCount));
  }, [pageCount]);

  const handleSwitchTab = (nextTab) => {
    setPage(1);
    switchTab(nextTab);
  };

  const handlePageChange = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), pageCount));
    resetSelection();
  };

  if (isLoading) return <PageLoading message="분석 이력을 불러오는 중이에요…" />;
  if (isError) return <PageError message={error?.message} onRetry={() => window.location.reload()} />;

  const TABS = [
    { key: "deed", label: "등기부등본 분석", icon: "file-text", count: deeds.length },
    { key: "lease", label: "임대차계약서 분석", icon: "file-signature", count: leases.length },
  ];

  return (
    <div className={styles.div12}>
      <div className={styles.div13}>
        <div className={styles.div14}>마이페이지</div>
        <div className={styles.div15}>내가 분석한 서류를 한곳에서 다시 보고 관리하세요.</div>
      </div>

      <ProfileHeader />

      <DashboardSection deeds={deeds} leases={leases} upcomingSchedules={upcomingSchedules} onGo={onGo} />

      <MatchedPropertySection groups={matchedGroups} onGo={onGo} />

      {/* 탭 */}
      <div className={styles.row13}>
        {TABS.map(t => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => handleSwitchTab(t.key)}
              className={styles.stateButton02} style={{ "--state-button02-font-weight": on ? 800 : 600, "--state-button02-color": toCssVariable(on ? "var(--primary-700)" : "var(--ink-3)"), "--state-button02-border-bottom": toCssVariable(on ? "2.5px solid var(--primary)" : "2.5px solid transparent") }}>
              <Icon name={t.icon} size={18} stroke={on ? 2.1 : 1.9} />
              {t.label}
              <span className={`tnum ${styles.stateText01}`} style={{ "--state-text01-color": toCssVariable(on ? "#fff" : "var(--ink-4)"), "--state-text01-background": toCssVariable(on ? "var(--primary)" : "var(--surface-3)") }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* 리스트 헤더 — 정렬/선택 */}
      {list.length > 0 && (
        <div className={styles.row14}>
          <div className={styles.div16}>
            {selectMode ? <span><b className={styles.text10}>{selectedIds.length}</b>건 선택됨</span> : <span>최근 분석순 · 총 {list.length}건</span>}
          </div>
          <div className={styles.row15}>
            {selectMode ? (
              <>
                <button onClick={toggleAll} className={styles.button03}>
                  <span className={styles.stateRow06} style={{ "--state-row06-border-color": toCssVariable(allSelected ? "var(--primary)" : "var(--line-2)"), "--state-row06-background": toCssVariable(allSelected ? "var(--primary)" : "transparent") }}>
                    {allSelected && <Icon name="check" size={12} color="#fff" stroke={3} />}
                  </span>
                  전체선택
                </button>
                <Button size="sm" variant="danger" icon="trash" disabled={selectedIds.length === 0}
                  onClick={() => askDelete(selectedIds)}>삭제 ({selectedIds.length})</Button>
                <Button size="sm" variant="ghost" onClick={resetSelection}>완료</Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" icon="check-circle" onClick={() => setSelectMode(true)}>선택</Button>
            )}
          </div>
        </div>
      )}

      {/* 리스트 / 빈 상태 */}
      {list.length === 0 ? (
        <EmptyState kind={tab} onGo={onGo} />
      ) : (
        <div className={styles.column02}>
          {pagedList.map(item => (
            <ReportRow key={item.id} kind={tab} item={item} selectMode={selectMode}
              selected={selectedIds.includes(item.id)} onToggle={() => toggleId(item.id)}
              onView={() => onGo(isDeed ? "analysisDetail" : "contractDetail", item.id)} onDelete={() => askDelete([item.id])} />
          ))}
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={handlePageChange} />
        </div>
      )}

      {confirm && <ConfirmModal count={confirm.ids.length} onCancel={() => setConfirm(null)} onConfirm={doDelete} />}
      {notice && <DeleteNoticeModal notice={notice} onClose={() => setNotice(null)} />}
      {undo && <UndoToast count={undo.items.length} onUndo={doUndo} onClose={() => setUndo(null)} />}
    </div>
  );
}
