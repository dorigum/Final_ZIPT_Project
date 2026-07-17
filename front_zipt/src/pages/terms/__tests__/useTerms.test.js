import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { useTerms } from "../useTerms.js";

// terms.json 및 API 클라이언트 mock
vi.mock("../../../../../zipt/terms.json", () => ({
  default: {
    terms: [
      { id: "1", term: "전세", category: "계약·계약서", aliases: ["전세계약"], zipt: { easy: "집을 통째로 빌리는 방식" } },
      { id: "2", term: "근저당", category: "보증금 안전·위험 예방", aliases: [], zipt: { easy: "은행 담보 설정" } },
      { id: "3", term: "보증금", category: "계약·계약서", aliases: ["임차보증금"], zipt: {} },
    ],
    categories: ["보증금 안전·위험 예방", "계약·계약서"],
  },
}));

vi.mock("../../terms/queries.js", () => ({
  termsListQueryOptions: () => ({
    queryKey: ["terms", "list", {}],
    queryFn: () => Promise.reject(new Error("API 미연결")),
  }),
}));

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }) => createElement(QueryClientProvider, { client }, children);
}

describe("useTerms", () => {
  it("초기 상태: 카테고리에 '전체'가 포함된다", async () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    expect(result.current.categories[0]).toBe("전체");
  });

  it("초기 상태: 전체 용어가 필터링 없이 반환된다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    expect(result.current.filteredTerms).toHaveLength(3);
  });

  it("카테고리 필터 적용 시 해당 카테고리 용어만 반환된다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    act(() => result.current.setCategory("계약·계약서"));
    expect(result.current.filteredTerms.every((t) => t.category === "계약·계약서")).toBe(true);
  });

  it("검색어 입력 시 term 이름으로 필터링된다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    act(() => result.current.setQuery("근저당"));
    expect(result.current.filteredTerms).toHaveLength(1);
    expect(result.current.filteredTerms[0].term).toBe("근저당");
  });

  it("aliases로도 검색된다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    act(() => result.current.setQuery("임차보증금"));
    expect(result.current.filteredTerms[0].term).toBe("보증금");
  });

  it("countByCategory('전체') 는 전체 용어 수를 반환한다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    expect(result.current.countByCategory("전체")).toBe(3);
  });

  it("countByCategory(특정카테고리) 는 해당 카테고리 수를 반환한다", () => {
    const { result } = renderHook(() => useTerms(), { wrapper: makeWrapper() });
    expect(result.current.countByCategory("계약·계약서")).toBe(2);
  });
});
