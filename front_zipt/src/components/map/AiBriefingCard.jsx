import { useState, useEffect, useRef } from "react";
import { fetchAiInfraSummary } from "../../api/geminiApi.js";
import { Badge, Icon } from "../common/index.jsx";
import styles from "./AiBriefingCard.module.scss";

export default function AiBriefingCard({ address, pois }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const lastFetchedKey = useRef("");

  const loadBriefing = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const result = await fetchAiInfraSummary(address, pois || []);
      setSummary(result);
    } catch (err) {
      setSummary("실시간 AI 분석 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address) {
      setLoading(false);
      setSummary("💡 상단 검색창에 원하시는 동네 주소를 입력하고 [주소 검색] 버튼을 누르시면, ZIPT AI가 실시간 맞춤 입지 브리핑을 분석해 드려요!");
      lastFetchedKey.current = "";
      return;
    }

    // 카카오맵 실시간 POI가 도착할 때까지 스켈레톤 로더 표시 후 Gemini 분석 호출
    if (pois && pois.length > 0) {
      const currentKey = `${address}_${pois.map(p => p.id).join(",")}`;
      if (lastFetchedKey.current !== currentKey) {
        lastFetchedKey.current = currentKey;
        loadBriefing();
      }
    } else {
      setLoading(true);
    }
  }, [address, pois]);

  return (
    <div className={styles.aiCardShell}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.aiBadge}>
            <Icon name="sparkle" size={16} color="#fff" stroke={2.2} />
          </div>
          <span className={styles.cardTitle}>ZIPT AI 실시간 동네 브리핑</span>
          <Badge tone="primary" size="sm">Gemini 1.5 Flash</Badge>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={loadBriefing}
          disabled={loading}
          title="AI 브리핑 다시 불러오기"
        >
          <Icon name="undo" size={14} stroke={2.2} />
          <span>다시 분석</span>
        </button>
      </div>

      <div className={styles.contentBox}>
        {loading ? (
          <div className={styles.loadingSkeleton}>
            <span className={styles.spinnerIcon}>🤖</span>
            <span>AI가 {address} 주변의 실시간 인프라 데이터를 분석하여 요약 브리핑을 생성하고 있어요...</span>
          </div>
        ) : (
          <p className={styles.summaryText}>{summary}</p>
        )}
      </div>
    </div>
  );
}
