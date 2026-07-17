/* ZIPT mock data */
export const ziptData = {
  user: { name: "도연", tags: ["#뚜벅이", "#재택근무", "#반려동물"] },

  // active contract being tracked
  contract: {
    address: "서울 관악구 봉천동 1234-56",
    nickname: "봉천동 신축 빌라",
    type: "전세",
    deposit: 24000, // 만원 → 2.4억
    landlord: "김*수",
    buildingType: "다세대주택(빌라)",
    dday: 12, // days to 입주
    moveInDate: "2026.06.21",
    progress: 72,
    safetyScore: 58,
    steps: [
      { key: "landlord", label: "임대인 신원 확인", status: "done", desc: "등기부상 소유자와 계약 상대가 일치해요." },
      { key: "rights", label: "권리관계 확인", status: "done", desc: "등기부등본 분석을 완료했어요." },
      { key: "insurance", label: "보증보험 가능 여부", status: "warn", desc: "담보인정비율이 기준에 가까워요. 확인이 필요해요." },
      { key: "fixeddate", label: "확정일자 등록", status: "todo", desc: "입주 당일 주민센터에서 받아야 해요." },
      { key: "movein", label: "전입신고", status: "todo", desc: "입주 당일 14일 이내 필수예요." },
    ],
  },

  // 등기부 분석 리포트
  report: {
    fileName: "등기부등본_봉천동1234-56.pdf",
    analyzedAt: "방금 전",
    safetyScore: 58,
    appraisedValue: 26000, // HUG 인정 집값 (만원)
    deposit: 24000,
    seniorDebt: 4000, // 선순위 채권 (만원)
    summary: "이 집은 빌라(다세대)이고, 을구에 4,000만 원의 근저당권이 잡혀 있어요. 보증금까지 더하면 집값의 108%로 깡통전세 위험 구간이에요. 보증보험 가입이 어려울 수 있으니 특약과 시세를 꼭 확인하세요.",
    gabgu: [ // 갑구 — 소유권
      { keyword: "소유권보존", risk: "safe", text: "현재 소유자 김*수 (2024.03 취득)" },
      { keyword: "소유권 이전 반복", risk: "warn", text: "최근 1년 내 소유권이 2회 이전되었어요." },
    ],
    eulgu: [ // 을구 — 채권
      { keyword: "근저당권", risk: "warn", text: "채권최고액 4,000만 원 (국*은행)" },
    ],
    flags: [
      { risk: "danger", title: "깡통전세 위험", text: "보증금+대출이 집값의 108%로, HUG 기준(90%)을 초과해요." },
      { risk: "warn", title: "다세대주택", text: "다가구와 달리 호수별 등기는 있지만, 시세 확인이 까다로워요." },
      { risk: "warn", title: "잦은 소유권 이전", text: "최근 1년 내 소유권 이전이 반복돼 갭투자 가능성이 있어요." },
      { risk: "safe", title: "압류·신탁 없음", text: "갑구에 압류·가압류·신탁 등 치명적 위험 키워드는 없어요." },
    ],
  },

  // HUG 시뮬레이션
  hug: {
    appraisedValue: 26000,
    deposit: 24000,
    seniorDebt: 4000,
    ltvLimit: 90,
    seniorLimit: 60,
    get ltv() { return Math.round((this.deposit + this.seniorDebt) / this.appraisedValue * 100); },
    get seniorRatio() { return Math.round(this.seniorDebt / this.appraisedValue * 100); },
  },

  // D-day tasks
  tasks: [
    { date: "2026.06.21", dday: 0, label: "입주 당일", done: false, items: ["전입신고 하기", "확정일자 받기", "하자 사진 촬영"] },
    { date: "2026.06.19", dday: -2, label: "잔금 직전", done: false, items: ["등기부등본 재발급·재확인", "근저당 추가 여부 확인"] },
    { date: "2026.06.14", dday: -7, label: "이번 주", done: true, items: ["전세보증보험 가입 신청"] },
  ],

  // saved listings (수집.zip)
  listings: [
    { nick: "봉천동 신축 빌라", addr: "관악구 봉천동", type: "전세", deposit: 24000, score: 58, risk: "warn" },
    { nick: "역삼동 오피스텔", addr: "강남구 역삼동", type: "전세", deposit: 31000, score: 81, risk: "safe" },
    { nick: "성수동 구축 아파트", addr: "성동구 성수동", type: "전세", deposit: 28000, score: 34, risk: "danger" },
  ],

  // 초개인화 인프라 브리핑
  infra: {
    address: "서울 관악구 봉천동 1234-56",
    nickname: "봉천동 신축 빌라",
    home: { x: 50, y: 53 }, // % position on the styled map
    pois: [
      // 대중교통
      { id: "t1", cat: "transit", name: "봉천역", meta: "2호선", walk: 8, dist: "600m", x: 31, y: 30, hero: true },
      { id: "t2", cat: "transit", name: "서울대입구역", meta: "2호선", walk: 14, dist: "1.1km", x: 15, y: 16 },
      { id: "t3", cat: "transit", name: "봉천사거리 정류장", meta: "버스 5개 노선", walk: 2, dist: "160m", x: 58, y: 44 },
      { id: "t4", cat: "transit", name: "마을버스 02", meta: "배차 6분", walk: 1, dist: "90m", x: 45, y: 61 },
      // 병원·약국 (사람)
      { id: "m1", cat: "medical", name: "봉천제일내과", meta: "내과", walk: 4, dist: "300m", x: 65, y: 38 },
      { id: "m2", cat: "medical", name: "우리이비인후과", meta: "이비인후과", walk: 5, dist: "400m", x: 70, y: 59 },
      { id: "m3", cat: "medical", name: "온누리약국", meta: "24시", walk: 3, dist: "230m", x: 42, y: 45 },
      // 마트·편의점
      { id: "k1", cat: "market", name: "GS25 봉천점", meta: "편의점", walk: 1, dist: "70m", x: 54, y: 62 },
      { id: "k2", cat: "market", name: "봉천중앙시장", meta: "재래시장", walk: 12, dist: "950m", x: 75, y: 28 },
      { id: "k3", cat: "market", name: "이마트 봉천점", meta: "대형마트", walk: 18, dist: "1.4km", x: 87, y: 14, far: true },
      // 학교
      { id: "s1", cat: "school", schoolLevel: "primary_secondary", name: "서울봉천초등학교", meta: "초등학교", walk: 5, dist: "390m", x: 38, y: 28 },
      { id: "s2", cat: "school", schoolLevel: "primary_secondary", name: "봉천중학교", meta: "중학교", walk: 9, dist: "720m", x: 24, y: 48 },
      { id: "s3", cat: "school", schoolLevel: "university", name: "서울대학교 관악캠퍼스", meta: "대학교", walk: 15, dist: "1.2km", x: 78, y: 36 },
      // 공원·생활 편의
      { id: "g1", cat: "park", name: "봉천근린공원", meta: "공원", walk: 4, dist: "320m", x: 19, y: 19 },
      { id: "b1", cat: "bank", name: "우리은행 봉천점", meta: "은행", walk: 6, dist: "460m", x: 63, y: 66 },
      { id: "u1", cat: "public", name: "청룡동 주민센터", meta: "주민센터", walk: 10, dist: "790m", x: 82, y: 50 },
      { id: "pk1", cat: "parking", name: "봉천 공영주차장", meta: "공영주차장", walk: 7, dist: "540m", x: 72, y: 78 },
      // 반려동물
      { id: "p1", cat: "pet", name: "행복동물병원", meta: "24시 응급", walk: 6, dist: "480m", x: 35, y: 67 },
      { id: "p2", cat: "pet", name: "봉천 근린공원 산책로", meta: "산책로", walk: 4, dist: "320m", x: 19, y: 19 },
      { id: "p3", cat: "pet", name: "멍플레이 애견카페", meta: "애견동반", walk: 7, dist: "550m", x: 42, y: 73 },
      // 치안·안전
      { id: "sf1", cat: "safety", subCategory: "police", name: "봉천지구대", meta: "지구대", walk: 7, dist: "520m", x: 60, y: 22 },
      { id: "sf2", cat: "safety", subCategory: "safe_facility", name: "관악구 안심택배함", meta: "안심택배함", walk: 6, dist: "460m", x: 34, y: 74 },
      // 세탁·무인 편의
      { id: "la1", cat: "laundry", subCategory: "coin_laundry", name: "워시엔조이 봉천점", meta: "코인세탁소", walk: 4, dist: "300m", x: 48, y: 66 },
      { id: "la2", cat: "laundry", subCategory: "parcel", name: "봉천동 무인택배함", meta: "무인택배함", walk: 5, dist: "390m", x: 57, y: 69 },
      // 운동시설
      { id: "ex1", cat: "exercise", subCategory: "gym", name: "피트니스 봉천", meta: "헬스장", walk: 5, dist: "370m", x: 68, y: 45 },
      { id: "ex2", cat: "exercise", subCategory: "pilates_yoga", name: "라온 필라테스", meta: "필라테스", walk: 8, dist: "650m", x: 30, y: 58 },
      { id: "ex3", cat: "exercise", subCategory: "sports", name: "관악구민체육센터", meta: "체육센터", walk: 13, dist: "1.0km", x: 84, y: 60 },
      // 소음주의
      { id: "no1", cat: "noise", subCategory: "bar", name: "봉천 먹자골목", meta: "술집 밀집", walk: 6, dist: "470m", x: 62, y: 34 },
      { id: "no2", cat: "noise", subCategory: "karaoke", name: "코인노래연습장", meta: "노래방", walk: 5, dist: "410m", x: 66, y: 32 },
      // 문화시설
      { id: "cu1", cat: "culture", subCategory: "library", name: "관악문화도서관", meta: "도서관", walk: 11, dist: "880m", x: 18, y: 37 },
      { id: "cu2", cat: "culture", subCategory: "bookstore", name: "동네서점 책방", meta: "서점", walk: 9, dist: "700m", x: 41, y: 21 },
      { id: "cu3", cat: "culture", subCategory: "cinema", name: "작은영화관", meta: "영화관", walk: 16, dist: "1.3km", x: 90, y: 45 },
    ],
    categories: {
      food: { grade: "safe", gradeLabel: "풍부", objRank: 1, headline: "주변 음식점 탐색 중", summary: "다양한 식당이 위치해 있어요." },
      cafe: { grade: "safe", gradeLabel: "풍부", objRank: 2, headline: "주변 카페 탐색 중", summary: "다양한 카페가 위치해 있어요." },
      transit: {
        grade: "safe", gradeLabel: "우수", objRank: 1,
        headline: "지하철 2호선 도보 8분 · 버스 5개 노선 도보 2분",
        summary: "차 없이도 어디든 편하게 닿는 동네예요. 2호선 봉천역이 도보권이고 버스 노선도 촘촘해요.",
        weight: { "뚜벅이": 3, "재택근무": 2, "반려동물": 1 },
        personalLine: {
          "뚜벅이": "차 없이 다니는 도연님께 가장 중요한 항목이에요. 출퇴근·약속 모두 무난해요.",
          "재택근무": "외출이 잦지 않아도 외근·약속 때 이동이 편해요.",
          "반려동물": "반려동물과 함께 이동할 때 가까운 역·정류장이 편해요.",
          "_off": "객관적으로도 역세권에 가까운 입지예요.",
        },
      },
      medical: {
        grade: "safe", gradeLabel: "좋음", objRank: 2,
        headline: "내과·이비인후과 도보 4분 · 24시 약국 도보 3분",
        summary: "내과·이비인후과 등 1차 의료기관과 약국이 도보권에 충분해요.",
        weight: { "뚜벅이": 1, "재택근무": 2, "반려동물": 1 },
        personalLine: {
          "재택근무": "몸이 안 좋을 때 가볍게 다녀올 병원·약국이 가까워요.",
          "뚜벅이": "걸어서 갈 수 있는 병원이 많아 차가 없어도 걱정 없어요.",
          "반려동물": "사람 병원도 도보권이라 평소 생활이 편해요.",
          "_off": "1차 의료 접근성이 평균 이상인 지역이에요.",
        },
      },
      market: {
        grade: "warn", gradeLabel: "보통", objRank: 3,
        headline: "편의점 도보 1분 · 대형마트는 도보 18분",
        summary: "편의점·재래시장은 가깝지만, 대형마트는 도보권을 살짝 벗어나요. 큰 장보기는 배달·온라인을 함께 쓰는 걸 추천해요.",
        weight: { "뚜벅이": 2, "재택근무": 3, "반려동물": 1 },
        personalLine: {
          "재택근무": "하루 종일 집에 있는 도연님께 생활 편의가 중요한데, 큰 장보기는 살짝 멀어요.",
          "뚜벅이": "대형마트가 도보 18분이라 차 없는 도연님은 배달·장바구니 활용을 추천해요.",
          "반려동물": "사료·용품 대량 구매는 온라인이 더 편할 거예요.",
          "_off": "근거리 편의점은 풍부하나 대형마트는 다소 멀어요.",
        },
      },
      school: {
        grade: "safe", gradeLabel: "좋음", objRank: 4,
        headline: "초등학교 도보 5분 · 중학교 도보 9분 · 대학교 1.2km",
        summary: "초·중학교와 대학교 접근성을 함께 확인할 수 있어 통학 환경과 대학가 생활권을 나눠 보기 좋아요.",
        weight: { "뚜벅이": 1, "재택근무": 1, "반려동물": 0 },
        personalLine: {
          "_off": "학교 접근성이 괜찮은 동네예요.",
        },
      },
      park: {
        grade: "safe", gradeLabel: "좋음", objRank: 5,
        headline: "근린공원 도보 4분",
        summary: "가볍게 산책하거나 쉬어갈 수 있는 공원이 가까워요.",
        weight: { "뚜벅이": 1, "재택근무": 2, "반려동물": 3 },
        personalLine: {
          "_off": "공원 접근성이 좋은 편이에요.",
        },
      },
      bank: {
        grade: "safe", gradeLabel: "좋음", objRank: 6,
        headline: "은행 도보 6분",
        summary: "주요 금융 업무를 도보권에서 처리할 수 있어요.",
        weight: { "뚜벅이": 1, "재택근무": 1, "반려동물": 0 },
        personalLine: {
          "_off": "은행 접근성이 무난한 편이에요.",
        },
      },
      public: {
        grade: "warn", gradeLabel: "보통", objRank: 7,
        headline: "주민센터 도보 10분",
        summary: "전입신고나 행정 업무를 처리할 관공서가 가까운 편이에요.",
        weight: { "뚜벅이": 1, "재택근무": 1, "반려동물": 0 },
        personalLine: {
          "_off": "생활 행정 접근성이 무난해요.",
        },
      },
      parking: {
        grade: "safe", gradeLabel: "좋음", objRank: 8,
        headline: "공영주차장 도보 7분",
        summary: "차량 방문이나 임시 주차가 필요할 때 참고할 만한 주차장이 있어요.",
        weight: { "뚜벅이": 0, "재택근무": 1, "반려동물": 1 },
        personalLine: {
          "_off": "주차 편의시설도 함께 확인할 수 있어요.",
        },
      },
      pet: {
        grade: "safe", gradeLabel: "좋음", objRank: 4,
        headline: "24시 응급 동물병원 도보 6분 · 산책로 도보 4분",
        summary: "응급 동물병원이 도보권이고, 공원 산책로와 애견 동반 카페도 가까워 반려동물과 살기 좋아요.",
        weight: { "뚜벅이": 1, "재택근무": 1, "반려동물": 3 },
        personalLine: {
          "반려동물": "반려동물과 사는 도연님께 딱! 24시 응급 동물병원이 도보 6분, 산책로도 가까워요.",
          "재택근무": "집에 오래 머물는 만큼 산책로가 가까운 게 큰 장점이에요.",
          "뚜벅이": "동물 동반 이동 없이 걸어서 닿는 동물병원·산책로예요.",
          "_off": "반려동물 관련 인프라가 잘 갖춰진 동네예요.",
        },
      },
      safety: {
        grade: "safe", gradeLabel: "좋음", objRank: 9,
        headline: "지구대 도보 7분 · 안심택배함 도보 6분",
        summary: "늦은 귀가나 택배 수령처럼 혼자 살 때 체감되는 안전 요소를 함께 확인할 수 있어요.",
        weight: { "뚜벅이": 2, "재택근무": 2, "반려동물": 1 },
        personalLine: {
          "_off": "치안·안전 시설 접근성을 확인해볼 수 있어요.",
        },
      },
      laundry: {
        grade: "safe", gradeLabel: "좋음", objRank: 10,
        headline: "코인세탁소 도보 4분 · 무인택배함 도보 5분",
        summary: "세탁과 택배 수령처럼 자취 생활에서 자주 쓰는 편의시설이 가까운 편이에요.",
        weight: { "뚜벅이": 1, "재택근무": 3, "반려동물": 0 },
        personalLine: {
          "_off": "생활 편의시설을 더 세밀하게 확인할 수 있어요.",
        },
      },
      exercise: {
        grade: "warn", gradeLabel: "보통", objRank: 11,
        headline: "헬스장 도보 5분 · 필라테스 도보 8분",
        summary: "일상 운동 시설은 가까우며, 체육센터는 도보권을 살짝 벗어나요.",
        weight: { "뚜벅이": 1, "재택근무": 2, "반려동물": 1 },
        personalLine: {
          "_off": "운동시설 접근성을 함께 볼 수 있어요.",
        },
      },
      noise: {
        grade: "warn", gradeLabel: "주의", objRank: 12,
        headline: "먹자골목 도보 6분 · 노래방 도보 5분",
        summary: "편의시설이 많은 대신 야간 소음 가능성이 있는 생활권도 함께 확인하세요.",
        weight: { "뚜벅이": 1, "재택근무": 2, "반려동물": 1 },
        personalLine: {
          "_off": "야간 소음 가능성이 있는 시설을 따로 볼 수 있어요.",
        },
      },
      culture: {
        grade: "warn", gradeLabel: "보통", objRank: 13,
        headline: "서점 도보 9분 · 도서관 도보 11분",
        summary: "도서관과 서점은 이용 가능권이고, 영화관은 조금 더 이동이 필요해요.",
        weight: { "뚜벅이": 1, "재택근무": 2, "반려동물": 0 },
        personalLine: {
          "_off": "문화시설 접근성도 함께 확인할 수 있어요.",
        },
      },
    },
  },

  // 마이페이지 — 서류 분석 결과 보관함
  myReports: {
    deeds: [
      { id: "d1", nick: "봉천동 신축 빌라", addr: "서울 관악구 봉천동 1234-56", fileName: "등기부등본_봉천동1234-56.pdf",
        analyzedAt: "2026.06.09", type: "전세", deposit: 24000, score: 58, risk: "warn",
        headline: "근저당 4,000만원 · 보증금 합산 시 집값의 108%", flags: 3 },
      { id: "d2", nick: "역삼동 오피스텔", addr: "서울 강남구 역삼동 822-1", fileName: "등기부등본_역삼동822.pdf",
        analyzedAt: "2026.06.02", type: "전세", deposit: 31000, score: 81, risk: "safe",
        headline: "압류·신탁 없음 · 선순위 채권 비율 안전 구간", flags: 0 },
      { id: "d3", nick: "성수동 구축 아파트", addr: "서울 성동구 성수동2가 333", fileName: "등기부등본_성수동333.pdf",
        analyzedAt: "2026.05.28", type: "전세", deposit: 28000, score: 34, risk: "danger",
        headline: "소유권이 신탁회사로 이전된 상태 · 계약 주의", flags: 4 },
      { id: "d4", nick: "망원동 투룸", addr: "서울 마포구 망원동 411-9", fileName: "등기부등본_망원동411.pdf",
        analyzedAt: "2026.05.20", type: "월세", deposit: 5000, score: 76, risk: "safe",
        headline: "근저당 없음 · 소유자와 계약 상대 일치", flags: 1 },
    ],
    leases: [
      { id: "l1", nick: "봉천동 신축 빌라", addr: "서울 관악구 봉천동 1234-56", fileName: "임대차계약서_봉천동_초안.pdf",
        analyzedAt: "2026.06.10", type: "전세", deposit: 24000, risk: "danger", toxic: 2,
        headline: "'입주 당일 담보권 설정 용인' 독소조항 발견" },
      { id: "l2", nick: "역삼동 오피스텔", addr: "서울 강남구 역삼동 822-1", fileName: "임대차계약서_역삼동_최종.pdf",
        analyzedAt: "2026.06.03", type: "전세", deposit: 31000, risk: "safe", toxic: 0,
        headline: "특약 4건 모두 임차인에게 안전한 조항" },
      { id: "l3", nick: "망원동 투룸", addr: "서울 마포구 망원동 411-9", fileName: "임대차계약서_망원동.pdf",
        analyzedAt: "2026.05.21", type: "월세", deposit: 5000, risk: "warn", toxic: 1,
        headline: "원상복구 범위가 임차인에게 과도하게 넓음" },
    ],
  },
};
