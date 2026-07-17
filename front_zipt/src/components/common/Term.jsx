import { useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import styles from "./Term.module.scss";

export const TERMS = {
  "근저당권": { easy: "집을 담보로 집주인이 은행에서 빌린 돈이에요.", tip: "이 금액 + 내 보증금이 집값의 70%를 넘으면 위험해요. 특약에 '잔금 시 대출 말소' 조건을 넣어보세요." },
  "신탁": { easy: "집의 소유권이 신탁회사로 넘어가 있는 상태예요.", tip: "실제 집주인이 아닌 신탁회사의 동의서 없이 계약하면 불법 점유자가 될 수 있어요. 극도로 주의하세요!" },
  "선순위 채권": { easy: "내 보증금보다 먼저 돈을 돌려받을 권리가 있는 빚이에요.", tip: "보통 은행 대출이에요. 집값의 60%를 넘으면 보증보험 가입이 어려워요." },
  "담보인정비율": { easy: "집값 대비 (은행 대출 + 내 보증금)의 비율이에요.", tip: "90%를 넘으면 '깡통전세'로 보고 HUG 보증보험 가입이 거절돼요." },
  "확정일자": { easy: "계약서에 도장처럼 찍는 날짜 도장이에요.", tip: "전입신고와 함께 받아야 보증금을 돌려받을 우선순위가 생겨요. 입주 당일 꼭 받으세요!" },
  "대항력": { easy: "새 집주인에게도 '나 여기 살아요'라고 주장할 수 있는 힘이에요.", tip: "전입신고 다음 날 0시부터 생겨요. 그래서 이사 당일 대출을 조심해야 해요." },
  "전세보증보험": { easy: "집주인이 보증금을 안 돌려주면 나라(HUG)가 대신 돌려주는 보험이에요.", tip: "가입만 되면 전 재산을 지킬 수 있어요. 계약 전에 가입 가능 여부를 꼭 확인하세요." },
  "가압류": { easy: "집주인이 빚을 안 갚아서 재산을 묶어둔 상태예요.", tip: "소유권에 문제가 있다는 강한 신호예요. 이런 집은 계약을 피하는 게 좋아요." },
};

export function Term({ children }) {
  const word = typeof children === "string" ? children : "";
  const data = TERMS[word];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  if (!data) return <span>{children}</span>;

  return (
    <span ref={ref} className={styles.term} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClick={() => setOpen((value) => !value)}>
      <span className={styles.word}>{children}</span>
      {open && (
        <span className={styles.tooltip}>
          <span className={styles.heading}><Icon name="sparkle" size={13} stroke={2.4} /> ZIPT 3초 번역</span>
          <span className={styles.easy}>{data.easy}</span>
          <span className={styles.tip}>💡 {data.tip}</span>
          <span className={styles.arrow} />
        </span>
      )}
    </span>
  );
}

export function RichText({ text, style }) {
  const keys = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  const parts = text.split(new RegExp(`(${keys.join("|")})`, "g"));
  return <span style={style}>{parts.map((part, index) => TERMS[part] ? <Term key={index}>{part}</Term> : <span key={index}>{part}</span>)}</span>;
}
