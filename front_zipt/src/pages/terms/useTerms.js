import { useMemo, useState } from "react";
import termsData from "../../mocks/terms.json";

const LOCAL_TERMS = termsData || { terms: [], categories: [] };

export function useTerms() {
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");

  const data = LOCAL_TERMS;
  const source = "s3"; // S3 기반 동기화 데이터 사용
  const terms = data.terms || [];

  const categories = useMemo(() => [
    "전체",
    ...(data.categories || []).filter((item) => terms.some((term) => term.category === item)),
  ], [data.categories, terms]);

  const filteredTerms = useMemo(() => terms.filter((term) => {
    const categoryMatches = category === "전체" || term.category === category;
    const queryMatches = query === ""
      || term.term.includes(query)
      || (term.aliases || []).some((alias) => alias.includes(query))
      || term.zipt?.easy?.includes(query);
    return categoryMatches && queryMatches;
  }), [category, query, terms]);

  const countByCategory = (item) => item === "전체"
    ? terms.length
    : terms.filter((term) => term.category === item).length;

  return {
    source,
    isFetching: false,
    error: null,
    refetch: () => {},
    category,
    setCategory,
    query,
    setQuery,
    categories,
    filteredTerms,
    countByCategory,
  };
}
