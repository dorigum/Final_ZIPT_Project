/**
 * geminiApi.js
 * Google Gemini API를 활용한 실시간 인프라 AI 브리핑 서비스 (동적 모델 검색 & 다중 폴백)
 */

let cachedModel = null;

async function discoverModel(apiKey) {
  if (cachedModel) return cachedModel;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const validModels = data.models || [];
      // generateContent를 지원하는 flash 또는 pro 모델 찾기
      const target = validModels.find(
        (m) =>
          m.supportedGenerationMethods?.includes("generateContent") &&
          (m.name.includes("flash") || m.name.includes("pro"))
      );
      if (target) {
        cachedModel = target.name.replace("models/", "");
        return cachedModel;
      }
    }
  } catch (e) {
    console.warn("[Gemini Model Discovery Warning]", e);
  }

  return "gemini-1.5-flash-latest";
}

const FALLBACK_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash"
];

export async function fetchAiInfraSummary(address, pois = []) {
  const queryKey = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("geminiKey") : null;
  if (queryKey) {
    localStorage.setItem("zipt_gemini_key", queryKey);
  }

  const rawKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("zipt_gemini_key") : "") ||
    "";

  const apiKey = rawKey.trim();

  if (!apiKey) {
    return "💡 Gemini API 키를 .env 파일(VITE_GEMINI_API_KEY)에 등록 후 서버를 재시작하시면 실시간 AI 맞춤 동네 브리핑을 받아보실 수 있어요!";
  }

  const topPois = pois.slice(0, 10).map((p) => `${p.name}(도보 ${p.walk}분)`).join(", ");

  const prompt = `너는 부동산 컨설턴트 AI ZIPT이야. 아래 주소 및 실제 탐색된 주변 인프라 데이터를 바탕으로, 사회초년생을 위한 다정한 거주 꿀팁 브리핑 2문장을 완결된 존댓말(~해요)로 작성해줘.

조회 주소: [${address}]
실시간 인프라 시설 정보: [${topPois || "주변 주요 생활 시설 탐색 완료"}]

⚠️ 필수 준수 작성 규칙:
1. 오직 지번/도로명 주소에 대한 동네 인프라 브리핑만 작성하세요. 만약 사용자의 조회 주소가 도로명 주소가 아닌 일반 질문이나 대화(예: "너 누구야?", "오늘 날씨 어때?", "맛집 알려줘" 등)일 경우, 답변을 생성하지 말고 반드시 "⚠️ ZIPT AI 브리핑은 정확한 도로명 주소에 대한 입지 분석만 제공해 드려요. 상단 검색창에 올바른 주소를 입력해 주세요."라고만 답변하세요.
2. 인사말(안녕하세요 등)이나 자기소개는 완전히 제외하고 바로 본론 거주 요약 2문장만 마침표(.)로 완결되게 작성하세요.
3. 반드시 위에 제공된 [조회 주소] 및 [실시간 인프라 시설 정보]에 실제로 존재하는 장소/역/시설명만 언급하세요. 절대로 데이터에 없는 다른 지역(예: 봉천역, 서울대입구역 등)을 지어내거나 언급하지 마세요.
4. 검색된 근거가 부족하거나 검색에 실패했을 경우, LLM이 임의로 추측하여 답변하지 말고 "주변 인프라 정보가 부족하여 브리핑 생성이 어렵습니다."라고만 답변하세요.
5. '해당 주소지' 또는 '이 주소지' 같은 어색하고 딱딱한 대명사 주어 대신, 주변 편의시설이나 인프라 특징으로 자연스럽게 문장을 시작해 불필요한 단어 없이 군더더기 없이 간결하게 작성하세요.`;

  // 1. 검증된 최신 모델 배열 정렬
  const discovered = await discoverModel(apiKey);
  const candidateModels = Array.from(new Set(["gemini-flash-latest", discovered, ...FALLBACK_MODELS]));

  let lastError = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0];
        if (candidate) {
          const parts = candidate?.content?.parts;
          let text = "";
          if (parts && parts.length > 0) {
            text = parts.map((p) => p.text || "").join("");
          } else if (candidate.text) {
            text = candidate.text;
          } else if (typeof candidate === "string") {
            text = candidate;
          }
          if (text && text.trim()) return text.trim();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        lastError = errorData.error?.message || `HTTP ${response.status} (${model})`;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  console.error("[Gemini Infra AI Error]", lastError);
  return `💡 실시간 AI 브리핑 연동 중 지연이 발생했습니다. (${lastError || "API 키 및 모델 확인 필요"}) 아래 카테고리별 인프라 상세 목록을 참고해 주세요.`;
}
