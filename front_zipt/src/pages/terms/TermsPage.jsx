import { useState, useEffect, useMemo } from "react";
import {
  Badge,
  Icon,
  RISK,
  SortMenu,
} from "../../components/common/index.jsx";
import { useTerms } from "./useTerms.js";
import styles from "./TermsPage.module.scss";
import { toCssVariable } from "../../utils/toCssVariable.js";

/* ───────────────────────── 용어 사전 (terms.json 기반) ───────────────────────── */
const CAT_META = {
  "보증금 안전·위험 예방": {
    icon: "shield",
    color: "var(--danger)",
    soft: "var(--danger-soft)",
  },
  "계약·계약서": {
    icon: "doc",
    color: "var(--primary)",
    soft: "var(--primary-soft)",
  },
  "주거 형태·주택 구조": {
    icon: "home",
    color: "var(--navy)",
    soft: "#e6ecf8",
  },
  "면적·가격·정책": {
    icon: "coins",
    color: "var(--safe-600)",
    soft: "var(--safe-soft)",
  },
  기타: { icon: "info", color: "var(--ink-3)", soft: "var(--surface-3)" },
};
const RISK_LABEL = {
  safe: "안전 개념",
  warn: "주의 용어",
  danger: "위험 신호",
};
const SORT_OPTIONS = [
  { value: "asc", label: "오름차순(ㄱ-ㅎ)" },
  { value: "desc", label: "내림차순(ㅎ-ㄱ)" },
];

function TermCard({ t }) {
  const [open, setOpen] = useState(false);
  const z = t.zipt || {};
  const cm = CAT_META[t.category] || CAT_META["기타"];
  const r = z.risk && z.risk !== "neutral" ? RISK[z.risk] : null;
  const lead = z.easy || (t.official && t.official.definition) || "";
  return (
    <div
      onClick={() => setOpen((o) => !o)}
      className={styles.statePanel01}
      style={{
        "--state-panel01-box-shadow": toCssVariable(
          open ? "var(--sh-md)" : "var(--sh-sm)",
        ),
        "--state-panel01-border-color": toCssVariable(
          open ? "var(--primary-soft-2)" : "var(--line)",
        ),
      }}
    >
      <div className={styles.row05}>
        <div className={styles.div07}>
          <div className={styles.row06}>
            <span className={styles.text02}>{t.term}</span>
            {t.aliases && t.aliases.length > 0 && (
              <span className={styles.text03}>{t.aliases.join(" · ")}</span>
            )}
          </div>
          <div className={styles.row07}>
            <span
              className={styles.stateText01}
              style={{
                "--state-text01-color": toCssVariable(cm.color),
                "--state-text01-background": toCssVariable(cm.soft),
              }}
            >
              <Icon name={cm.icon} size={12} stroke={2.2} /> {t.category}
            </span>
            {r && (
              <Badge tone={r.key} size="sm">
                {RISK_LABEL[z.risk]}
              </Badge>
            )}
          </div>
        </div>
        <Icon
          name="chevron-down"
          size={18}
          color="var(--ink-4)"
          className={styles.stateComponent01}
          style={{
            "--state-component01-transform": toCssVariable(
              open ? "rotate(180deg)" : "none",
            ),
          }}
        />
      </div>

      {/* 쉬운말 우선 노출 */}
      <div className={styles.div08}>{lead}</div>

      {open && (
        <div className={styles.div09}>
          {/* 임차인 행동 지침 (ZIPT 큐레이션) */}
          {z.tip && (
            <div className={styles.div10}>
              <div className={styles.row08}>
                <Icon name="flag" size={14} stroke={2.4} /> 임차인 행동 지침
              </div>
              <div className={styles.panel05}>{z.tip}</div>
            </div>
          )}

          {/* 표준 정의 + 출처표시 */}
          <div>
            <div className={styles.row09}>
              <Icon name="book" size={14} stroke={2.2} /> 공식·표준 정의
            </div>
            {t.official ? (
              <div className={styles.panel06}>
                <div className={styles.div11}>{t.official.definition}</div>
                {(t.official.source ||
                  t.official.license ||
                  t.official.sourceUrl) && (
                  <div className={styles.row10}>
                    <Icon name="info" size={12} stroke={2} />
                    {t.official.source && <>출처: {t.official.source}</>}
                    {t.official.license && <> · {t.official.license}</>}
                    {t.official.sourceUrl && (
                      <a
                        href={t.official.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={styles.a01}
                      >
                        원문 ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.panel07}>
                공공 표준 정의는 데이터 연동 후 출처와 함께 제공돼요.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TermsPage() {
  const {
    source,
    isFetching,
    category: cat,
    setCategory: setCat,
    query: q,
    setQuery: setQ,
    categories: CATS,
    filteredTerms: filtered,
    countByCategory: counts,
  } = useTerms();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc — 용어명 가나다순
  const itemsPerPage = 10; // 한 페이지에 10개씩 표시

  // 카테고리나 검색어가 바뀌면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [cat, q]);

  const sortedTerms = useMemo(() => {
    const sorted = [...filtered].sort((a, b) =>
      String(a.term || "").localeCompare(String(b.term || ""), "ko"),
    );
    return sortOrder === "desc" ? sorted.reverse() : sorted;
  }, [filtered, sortOrder]);

  const totalPages = Math.ceil(sortedTerms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTerms = sortedTerms.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.div12} style={{ animation: "zipt-fade .3s ease" }}>
      {/* 헤더 */}
      <header className={styles.pageHeader} style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", color: "var(--primary)" }}>ZIPT TERMS</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", margin: "8px 0 0", color: "var(--ink)" }}>용어 정리ZIP</h1>
        <p style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "9px 0 0", lineHeight: 1.6 }}>
          어려운 부동산 용어, ZIPT가 쉬운 문장으로 알려드려요.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
            <Icon name="book" size={13} color="var(--primary)" stroke={2.2} /> 부동산 용어 사전 ({counts("전체")}개)
          </div>
          {isFetching && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
              <Icon name="shield-check" size={13} color="var(--warn-600)" stroke={2.2} /> API 확인 중
            </div>
          )}
          {source === "s3" && !isFetching && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
              <Icon name="shield-check" size={13} color="var(--primary)" stroke={2.2} /> S3 데이터
            </div>
          )}
          {source === "local" && !isFetching && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
              <Icon name="shield-check" size={13} color="var(--warn-600)" stroke={2.2} /> 로컬 데이터
            </div>
          )}
          {source === "api" && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
              <Icon name="shield-check" size={13} color="var(--safe-600)" stroke={2.2} /> API 연결됨
            </div>
          )}
        </div>
      </header>

      {/* 카테고리 탭 */}
      <div className={styles.row12}>
        <div className={styles.row13}>
          {CATS.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={styles.stateButton02}
                style={{
                  "--state-button02-border-color": toCssVariable(
                    on ? "var(--primary)" : "var(--line-2)",
                  ),
                  "--state-button02-background": toCssVariable(
                    on ? "var(--primary)" : "var(--surface)",
                  ),
                  "--state-button02-color": toCssVariable(
                    on ? "#fff" : "var(--ink-2)",
                  ),
                }}
              >
                {c !== "전체" && (
                  <Icon
                    name={(CAT_META[c] || CAT_META["기타"]).icon}
                    size={14}
                    stroke={2.2}
                    color={
                      on ? "#fff" : (CAT_META[c] || CAT_META["기타"]).color
                    }
                  />
                )}
                {c}
                <span
                  className={`tnum ${styles.stateText02}`}
                  style={{
                    "--state-text02-color": toCssVariable(
                      on ? "rgba(255,255,255,.7)" : "var(--ink-4)",
                    ),
                  }}
                >
                  {counts(c)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 결과 카운트 및 검색/정렬 */}
      <div className={styles.resultsRow} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 6px", borderBottom: "2px solid var(--ink)", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "var(--ink-2)" }}>총 <b className="tnum" style={{ color: "var(--ink)" }}>{filtered.length}</b>개의 용어</div>

        <div className={styles.resultsControls} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* 용어 검색 */}
          <div className={styles.row14} style={{ padding: "6px 12px", minWidth: 160, maxWidth: 220 }}>
            <Icon name="search" size={15} color="var(--ink-4)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="용어 검색"
              className={styles.panel08}
              style={{ fontSize: 12.5 }}
            />
          </div>

          <SortMenu
            value={sortOrder}
            options={SORT_OPTIONS}
            onChange={setSortOrder}
            ariaLabel="용어 정렬 선택"
          />
        </div>
      </div>

      <div className={styles.grid01}>
        {paginatedTerms.map((t, i) => (
          <TermCard key={t.id || i} t={t} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className={styles.div17}>검색 결과가 없어요.</div>
      )}

      {/* 페이지네이션 버튼 영역 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={styles.pageBtn}
            aria-label="이전 페이지"
          >
            <Icon name="arrow-left" size={15} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ""}`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className={styles.pageBtn}
            aria-label="다음 페이지"
          >
            <Icon name="arrow" size={15} />
          </button>
        </div>
      )}

      {/* 데이터 출처 안내 */}
      <div className={styles.row15}>
        <Icon name="info" size={14} stroke={2} />
        공식·표준 정의는 각 용어에 표시된 기관 자료를 바탕으로 제공하며, 쉬운말
        풀이·행동 지침은 ZIPT가 별도로 구성해요.
      </div>
    </div>
  );
}
