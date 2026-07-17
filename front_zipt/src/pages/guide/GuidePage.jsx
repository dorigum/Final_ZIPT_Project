// ─────────────────────────────────────────────────────────────
// 부동산 계약 가이드 — 리스트형 + 우측 읽기 패널
// data: GET /api/guides (백엔드 com.zipt.domain.guide)
//  · 카테고리 탭(건수) + 검색은 백엔드 쿼리 파라미터(category, q)로 위임
//  · 본문(content) 마크다운(**굵게**, *"인용"*, 번호/불릿) 파싱 → 서식화
//  · 읽기 패널에 출처(source) + 법령·판례 근거(sourceNote) 노출
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useState } from "react";
import { listGuides } from "../../api/guideApi";
import { Icon, SortMenu } from "../../components/common/index.jsx";

// 카테고리 키 → 표시명/색상
const CAT = {
  contract: { name: "계약·절차", color: "#2a6be6", soft: "#e8f0fd" },
  rights: { name: "권리관계·등기부", color: "#5b53c9", soft: "#ecebfa" },
  process: { name: "등기·신고·세금", color: "#0f8a59", soft: "#e2f6ee" },
  case: { name: "부동산 판례", color: "#c87b1e", soft: "#fbf1e1" },
};
const catMeta = (key) => CAT[key] ?? { name: key, color: "#45526e", soft: "#eef2f8" };

const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "contract", label: "계약·절차" },
  { key: "rights", label: "권리관계·등기부" },
  { key: "process", label: "등기·신고·세금" },
  { key: "case", label: "부동산 판례" },
];

const SORT_OPTIONS = [
  { value: "reg-asc", label: "등록순(오름차순)" },
  { value: "reg-desc", label: "등록순(내림차순)" },
  { value: "name-asc", label: "오름차순(ㄱ-ㅎ)" },
  { value: "name-desc", label: "내림차순(ㅎ-ㄱ)" },
];

// ── 본문 마크다운 파싱 ───────────────────────────────────────────
function parseBullet(raw) {
  let s = raw.trim();
  let label = null;
  let isQuote = false;
  let m = s.match(/^\*\*(.+?)\*\*\s*:\s*([\s\S]*)$/);
  if (m) { label = m[1]; s = m[2]; }
  else {
    const m2 = s.match(/^\*(.+?)\*\s*:\s*([\s\S]*)$/);
    if (m2) { label = m2[1]; s = m2[2]; }
  }
  const q = s.match(/^\*?"([\s\S]*?)"\*?$/);
  if (q) { isQuote = true; s = q[1]; }
  const body = s.replace(/\*\*/g, "").replace(/\*/g, "").trim();
  return { label, body, isQuote, plain: !isQuote, hasLabel: !!label };
}

function parseContent(raw) {
  const lines = String(raw || "").split("\n");
  const intro = [];
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const sec = t.match(/^(\d+)\.\s*(.*)$/);
    const bul = t.match(/^-\s*(.*)$/);
    if (sec) {
      cur = { num: sec[1], heading: sec[2].replace(/\*\*/g, "").replace(/\*/g, "").trim(), bullets: [] };
      sections.push(cur);
    } else if (bul && cur) {
      cur.bullets.push(parseBullet(bul[1]));
    } else if (!cur) {
      intro.push(t.replace(/\*\*/g, "").replace(/\*/g, "").trim());
    } else if (cur.bullets.length) {
      cur.bullets[cur.bullets.length - 1].body += " " + t.replace(/\*\*/g, "").replace(/\*/g, "").trim();
    }
  }
  return { intro: intro.length ? [intro.join(" ")] : [], sections };
}

// ── URL 자동 링크 변환 ────────────────────────────────────────────
// 텍스트 안의 www.xxx 또는 http(s):// 패턴을 찾아 클릭 가능한 <a> 태그로 변환
function linkifyText(text) {
  const urlRegex = /(https?:\/\/[^\s)\]>,]+|www\.[^\s)\]>,]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part) || part.startsWith('www.')) {
      const href = part.startsWith('http') ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: 'var(--primary)',
            fontWeight: 700,
            textDecoration: 'underline',
            wordBreak: 'break-all',
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// ── 우측 읽기 패널 ───────────────────────────────────────────────
function ReadingPanel({ post, onClose }) {
  const meta = catMeta(post.category);
  const { intro, sections } = useMemo(() => parseContent(post.content), [post.content]);
  const tags = Array.isArray(post.tags) ? post.tags : [];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,27,51,.45)", zIndex: 1000, display: "flex", justifyContent: "flex-end", animation: "guide-fadein .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(660px, 94vw)", height: "100vh", background: "#fff", overflowY: "auto", boxShadow: "-10px 0 40px rgba(15,27,51,.2)", animation: "guide-slidein .28s cubic-bezier(.16,1,.3,1)" }}>
        {/* 헤더 */}
        <div style={{ position: "sticky", top: 0, background: "rgba(255,255,255,.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: meta.color, background: meta.soft, padding: "5px 11px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>{meta.name}</span>
          <button onClick={onClose} aria-label="닫기" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--surface-2)", color: "var(--ink-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="x" size={18} stroke={2.4} />
          </button>
        </div>

        <div style={{ padding: "26px 32px 60px" }}>
          <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.4, margin: 0, color: "var(--ink)" }}>{post.title}</h2>
          {post.source && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
              <Icon name="shield-check" size={14} color="var(--safe-600)" stroke={2.2} /> 출처 · {post.source}
            </div>
          )}

          {/* 도입부 */}
          <div style={{ marginTop: 22, padding: "18px 20px", background: "var(--surface-2)", borderRadius: 14, borderLeft: "3px solid var(--primary)" }}>
            {intro.map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: "var(--ink-2)", margin: 0 }}>{p}</p>
            ))}
          </div>

          {/* 번호 섹션 */}
          {sections.map((s) => {
            const headingText = s.heading || "";
            const colonIndex = headingText.indexOf(":");
            let titlePart = headingText;
            let descPart = "";
            if (colonIndex !== -1) {
              titlePart = headingText.substring(0, colonIndex).trim();
              descPart = headingText.substring(colonIndex + 1).trim();
            }

            return (
              <div key={s.num} style={{ marginTop: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: descPart ? 6 : 14 }}>
                  <span className="tnum" style={{ width: 30, height: 30, borderRadius: 9, background: "var(--ink)", color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.num}</span>
                  <h3 style={{ fontSize: 16.5, fontWeight: 800, color: "var(--ink)", margin: 0, lineHeight: 1.4 }}>
                    {linkifyText(titlePart)}
                  </h3>
                </div>
                {descPart && (
                  <div style={{ paddingLeft: 41, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)", marginBottom: 14 }}>
                    {linkifyText(descPart)}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 11, paddingLeft: 41 }}>
                {s.bullets.map((b, i) => (
                  b.isQuote ? (
                    <div key={i} style={{ background: "#eef5ff", border: "1px solid #d7e5fb", borderRadius: 12, padding: "14px 16px" }}>
                      {b.label && <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--primary-700)", marginBottom: 6 }}>📝 {b.label}</div>}
                      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink)", fontStyle: "italic" }}>“{b.body}”</div>
                    </div>
                  ) : (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ink-4)", marginTop: 9, flexShrink: 0 }} />
                      <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
                        {b.hasLabel && <b style={{ color: "var(--ink)" }}>{b.label} · </b>}{linkifyText(b.body)}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          );
        })}

          {/* 법령·판례 근거 */}
          {post.sourceNote && (
            <div style={{ marginTop: 28, background: "#fbfaf4", border: "1px solid #f0ead6", borderRadius: 12, padding: "15px 17px" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--warn-600)", marginBottom: 5 }}>📚 법령·판례 근거</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6 }}>{post.sourceNote}</div>
            </div>
          )}

          {/* 태그 */}
          <div style={{ display: "flex", gap: 6, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", flexWrap: "wrap" }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", background: "var(--surface-3)", borderRadius: 6, padding: "4px 10px" }}>#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────────
export default function GuidePage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openPost, setOpenPost] = useState(null);
  const [guides, setGuides] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [sortOrder, setSortOrder] = useState("reg-asc"); // reg-asc | reg-desc | name-asc | name-desc — 등록순/가나다순 정렬
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 5개씩 노출

  // 카테고리 탭 건수는 필터와 무관하게 항상 전체 기준으로 보여준다.
  useEffect(() => {
    let active = true;
    listGuides().then((all) => {
      if (!active) return;
      const next = { all: all.length };
      for (const c of CATEGORIES) {
        if (c.key === "all") continue;
        next[c.key] = all.filter((g) => g.category === c.key).length;
      }
      setCounts(next);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    listGuides({ category, q: query.trim() || undefined })
      .then((data) => {
        if (!active) return;
        setGuides([...data].sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)));
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });
    return () => { active = false; };
  }, [category, query]);

  // 카테고리나 검색어가 바뀌면 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [category, query]);

  const countOf = useCallback((key) => counts[key] ?? 0, [counts]);
  const handleCategoryChange = useCallback((key) => setCategory(key), []);
  const handleQueryChange = useCallback((e) => setQuery(e.target.value), []);
  const handleSortOrderChange = useCallback((nextValue) => setSortOrder(nextValue), []);
  const handleClearFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
  }, []);
  const handleClosePost = useCallback(() => setOpenPost(null), []);
  const handleOpenPost = useCallback((post) => setOpenPost(post), []);

  // 정렬 연산 (등록순 / 가나다순)
  const sortedGuides = useMemo(() => {
    const sorted = [...guides];
    if (sortOrder === "reg-asc") {
      sorted.sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    } else if (sortOrder === "reg-desc") {
      sorted.sort((a, b) => (b.displayOrder ?? 9999) - (a.displayOrder ?? 9999));
    } else if (sortOrder === "name-asc") {
      sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ko"));
    } else if (sortOrder === "name-desc") {
      sorted.sort((a, b) => String(b.title || "").localeCompare(String(a.title || ""), "ko"));
    }
    return sorted;
  }, [guides, sortOrder]);

  // 페이징 연산
  const totalPages = Math.ceil(sortedGuides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGuides = useMemo(() => {
    return sortedGuides.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedGuides, startIndex, itemsPerPage]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 80px", animation: "zipt-fade .3s ease" }}>
      <style>{`
        @keyframes guide-slidein { from { transform: translateX(40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        @keyframes guide-fadein { from { opacity: 0 } to { opacity: 1 } }
        .guide-row { transition: background .15s }
        .guide-row:hover { background: var(--surface-2) }
        .guide-row:hover .guide-title { color: var(--primary-700) }
        .guide-filter-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .guide-search-wrapper {
          position: relative;
          margin-left: auto;
          flex: 1;
          min-width: 240px;
          max-width: 320px;
        }
        .guide-count-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px 6px;
          border-bottom: 2px solid var(--ink);
        }
        .guide-count-text {
          font-size: 13px;
          color: var(--ink-2);
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .guide-filter-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .guide-search-wrapper {
            margin-left: 0;
            max-width: none;
            width: 100%;
          }
          .guide-count-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding-bottom: 10px;
          }
          .guide-category-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 2px;
            min-width: 0;
            flex: 1 1 100%;
          }
          .guide-category-tabs::-webkit-scrollbar {
            display: none;
          }
          .guide-category-tabs > button {
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* 헤더 */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", color: "var(--primary)" }}>ZIPT GUIDE</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.02em", margin: "8px 0 0", color: "var(--ink)" }}>부동산 계약 가이드</h1>
        <p style={{ fontSize: 14.5, color: "var(--ink-2)", margin: "9px 0 0", lineHeight: 1.6 }}>
          법령·판례에 근거한 부동산 거래 유의사항을 사회초년생도 이해하기 쉽게 정리했어요.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
            <Icon name="shield-check" size={13} color="var(--safe-600)" stroke={2.2} /> 법제처 찾기 쉬운 생활법령정보
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", background: "#fff", border: "1px solid var(--line)", padding: "6px 11px", borderRadius: 999 }}>
            <Icon name="shield-check" size={13} color="var(--safe-600)" stroke={2.2} /> 국토교통부 · 대전광역시
          </div>
        </div>
      </header>

      {/* 카테고리 탭 + 검색 */}
      <div className="guide-filter-row">
        <div className="guide-category-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button key={c.key} onClick={() => handleCategoryChange(c.key)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 15px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
                  border: active ? "1px solid var(--navy)" : "1px solid var(--line)", background: active ? "var(--navy)" : "#fff", color: active ? "#fff" : "var(--ink-2)" }}>
                {c.label}
                <span className="tnum" style={{ fontSize: 11, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: active ? "rgba(255,255,255,.2)" : "var(--surface-3)", color: active ? "#fff" : "var(--ink-4)" }}>{countOf(c.key)}</span>
              </button>
            );
          })}
        </div>
        <div className="guide-search-wrapper">
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", display: "flex" }}>
            <Icon name="search" size={17} stroke={2.2} />
          </span>
          <input value={query} onChange={handleQueryChange} placeholder="제목·태그 검색"
            style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px 11px 38px", border: "1px solid var(--line)", borderRadius: 999, fontSize: 13.5, fontFamily: "inherit", color: "var(--ink)", background: "#fff", outline: "none" }} />
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="guide-count-row">
        <div className="guide-count-text">총 <b className="tnum" style={{ color: "var(--ink)" }}>{guides.length}</b>개의 가이드</div>
        <SortMenu
          value={sortOrder}
          options={SORT_OPTIONS}
          onChange={handleSortOrderChange}
          ariaLabel="가이드 정렬 선택"
        />
      </div>

      {/* 리스트 */}
      {status === "error" ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-2)" }}>가이드를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</div>
        </div>
      ) : status === "loading" ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>불러오는 중...</div>
      ) : paginatedGuides.length > 0 ? (
        <div>
          {paginatedGuides.map((post) => {
            const meta = catMeta(post.category);
            const tags = Array.isArray(post.tags) ? post.tags : [];
            const displayOrder = post.displayOrder ?? post.id ?? 0;
            return (
              <div key={post.id} className="guide-row" onClick={() => handleOpenPost(post)}
                style={{ display: "flex", gap: 20, alignItems: "flex-start", padding: "22px 8px", borderBottom: "1px solid var(--line)", cursor: "pointer" }}>
                <div className="tnum" style={{ fontSize: 21, fontWeight: 800, color: "#cdd6e6", minWidth: 30, paddingTop: 2 }}>{String(displayOrder).padStart(2, "0")}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, background: meta.soft, padding: "4px 10px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0 }}>{meta.name}</span>
                    {post.source && <span style={{ fontSize: 12, color: "var(--ink-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{post.source}</span>}
                  </div>
                  <h3 className="guide-title" style={{ fontSize: 17.5, fontWeight: 800, color: "var(--ink)", margin: 0, letterSpacing: "-.01em", lineHeight: 1.4, transition: "color .15s" }}>{post.title}</h3>
                  <p style={{ fontSize: 13.5, color: "var(--ink-3)", lineHeight: 1.6, margin: "7px 0 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.summary}</p>
                  <div style={{ display: "flex", gap: 6, marginTop: 11, flexWrap: "wrap" }}>
                    {tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", background: "var(--surface-3)", borderRadius: 6, padding: "3px 8px" }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ alignSelf: "center", flexShrink: 0, color: "#cdd6e6", display: "flex" }}>
                  <Icon name="chevron" size={20} stroke={2.4} />
                </div>
              </div>
            );
          })}

          {/* 페이지네이션 컨트롤러 */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 32 }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "#fff",
                  color: "var(--ink-2)",
                  cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0
                }}
              >
                <Icon name="arrow-left" size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                const active = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: active ? "1px solid var(--primary)" : "1px solid var(--line)",
                      background: active ? "var(--primary)" : "#fff",
                      color: active ? "#fff" : "var(--ink-2)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  background: "#fff",
                  color: "var(--ink-2)",
                  cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0
                }}
              >
                <Icon name="chevron" size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink-2)" }}>검색 결과에 맞는 가이드가 없어요</div>
          <button onClick={handleClearFilters}
            style={{ marginTop: 14, background: "#fff", border: "1px solid var(--line)", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, color: "var(--ink-2)", cursor: "pointer", fontFamily: "inherit" }}>
            필터 초기화
          </button>
        </div>
      )}

      {/* 읽기 패널 */}
      {openPost && <ReadingPanel post={openPost} onClose={handleClosePost} />}
    </div>
  );
}
