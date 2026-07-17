export const CATEGORY_META = {
  food: { label: "음식점", icon: "utensils", color: "#e65100", soft: "#fff3e0", on: "#bf360c" },
  cafe: { label: "카페", icon: "coffee", color: "#795548", soft: "#efebe9", on: "#4e342e" },
  transit: { label: "대중교통", icon: "train", color: "var(--primary)", soft: "var(--primary-soft)", on: "var(--primary-700)" },
  medical: { label: "병원·약국", icon: "cross", color: "var(--safe)", soft: "var(--safe-soft)", on: "var(--safe-600)" },
  market: { label: "마트·편의점", icon: "cart", color: "var(--warn)", soft: "var(--warn-soft)", on: "var(--warn-600)" },
  school: { label: "학교", icon: "book", color: "#8b5cf6", soft: "#f3e8ff", on: "#6d28d9" },
  pet: { label: "반려동물", icon: "heart", color: "#ec4899", soft: "#fce7f3", on: "#be185d" },
  park: { label: "공원", icon: "flag", color: "#6f8f12", soft: "#f3f8dd", on: "#526b0d" },
  safety: { label: "치안·안전", icon: "shield-check", color: "#0891b2", soft: "#e0f7fa", on: "#0e7490" },
  laundry: { label: "생활편의", icon: "inbox", color: "#14b8a6", soft: "#ccfbf1", on: "#0f766e" },
  exercise: { label: "운동시설", icon: "walk", color: "#f97316", soft: "#ffedd5", on: "#c2410c" },
  noise: { label: "소음주의", icon: "alert", color: "#ef4444", soft: "#fee2e2", on: "#b91c1c" },
  bank: { label: "은행", icon: "coins", color: "#0f766e", soft: "#e6f7f5", on: "#0b5f59" },
  public: { label: "관공서", icon: "building", color: "#475569", soft: "#eef2f7", on: "#334155" },
  parking: { label: "주차장", icon: "pin", color: "#64748b", soft: "#f1f5f9", on: "#475569" },
  culture: { label: "문화시설", icon: "book", color: "#6366f1", soft: "#e0e7ff", on: "#4338ca" },
};

export const PERSONA_META = {
  "뚜벅이": { tag: "#뚜벅이", icon: "walk", drives: "transit", desc: "차 없이 대중교통·도보" },
  "재택근무": { tag: "#재택근무", icon: "home", drives: "market", desc: "하루 종일 동네 안에서" },
  "반려동물": { tag: "#반려동물", icon: "heart", drives: "pet", desc: "동물병원·산책 환경" },
};
