import { useEffect, useState, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useAnalysisHistory } from "../../hooks/useAnalysis.js";
import { useContractHistory } from "../../hooks/useContract.js";
import { ziptData } from "../../mocks/ziptData.js";
import { normalizeAnalysisHistory, normalizeContractHistory } from "../analysis/normalizers.js";
import { deleteAnalysis } from "../../api/analysisApi.js";
import { deleteContract, getContract } from "../../api/contractApi.js";

const MOCK_DATA = ziptData.myReports;

const getHistoryItemId = (item) => item?.analysisId ?? item?.contractId ?? item?.id;
const unwrapApiData = (response) => response?.data ?? response;

// 공백만 제거하는 최소 정규화 — 동/호수까지 완전히 일치할 때만 같은 매물로 판단
const normalizeAddressForMatch = (addr) => (addr || "").replace(/\s+/g, "");

const normalizeHistoryItems = (data, keys) => {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const filterHistoryCache = (cachedData, targetIds) => {
  const targetSet = new Set(targetIds);
  const filterItems = (items) => items.filter((item) => !targetSet.has(getHistoryItemId(item)));

  if (Array.isArray(cachedData)) return filterItems(cachedData);
  if (Array.isArray(cachedData?.data)) return { ...cachedData, data: filterItems(cachedData.data) };
  if (Array.isArray(cachedData?.data?.content)) {
    return { ...cachedData, data: { ...cachedData.data, content: filterItems(cachedData.data.content) } };
  }
  if (Array.isArray(cachedData?.data?.contracts)) {
    return { ...cachedData, data: { ...cachedData.data, contracts: filterItems(cachedData.data.contracts) } };
  }
  if (Array.isArray(cachedData?.content)) return { ...cachedData, content: filterItems(cachedData.content) };
  if (Array.isArray(cachedData?.contracts)) return { ...cachedData, contracts: filterItems(cachedData.contracts) };
  return cachedData;
};

export function useReportLibrary() {
  const queryClient = useQueryClient();
  // ── 서버 상태: 분석 이력 query (등기부 및 계약서) ──
  const deedHistoryQuery = useAnalysisHistory();
  const leaseHistoryQuery = useContractHistory();

  const deedApiData = deedHistoryQuery.data;
  const leaseApiData = leaseHistoryQuery.data;
  const hasDeedApiData = deedHistoryQuery.isSuccess;
  const hasLeaseApiData = leaseHistoryQuery.isSuccess;
  const leaseHistoryItems = useMemo(() => {
    return leaseApiData ? normalizeHistoryItems(leaseApiData, ["content", "contracts"]) : [];
  }, [leaseApiData]);
  const leaseDetailQueries = useQueries({
    queries: leaseHistoryItems.map((item) => {
      const contractId = getHistoryItemId(item);
      const status = String(item?.processingStatus || "").toUpperCase();
      return {
        queryKey: ["contracts", contractId],
        queryFn: () => getContract(contractId),
        enabled: hasLeaseApiData && contractId != null && status !== "FAILED",
        staleTime: 30_000,
      };
    }),
  });
  const leaseDetailDataKey = leaseDetailQueries.map((query) => {
    const detail = unwrapApiData(query.data);
    const detailId = getHistoryItemId(detail) ?? "";
    const checklistItems = Array.isArray(detail?.checklistItems) ? detail.checklistItems : [];
    const checklistKey = checklistItems
      .map((item) => `${item?.id ?? ""}:${item?.riskLevel ?? ""}:${item?.checked ?? ""}`)
      .join(",");
    return `${detailId}:${detail?.updatedAt ?? detail?.createdAt ?? ""}:${checklistKey}`;
  }).join("|");
  const isLeaseDetailsLoading = hasLeaseApiData && leaseDetailQueries.some((query) => query.isLoading);

  // API 데이터 정규화 (useMemo로 메모이제이션하여 렌더링 무한 루프 방지)
  const normalizedDeeds = useMemo(() => {
    return deedApiData ? normalizeAnalysisHistory(deedApiData).deeds : [];
  }, [deedApiData]);

  const normalizedLeases = useMemo(() => {
    if (!leaseApiData) return [];

    const detailById = new Map();
    leaseDetailQueries.forEach((query) => {
      const detail = unwrapApiData(query.data);
      const detailId = getHistoryItemId(detail);
      if (detailId != null) detailById.set(String(detailId), detail);
    });

    const enrichedItems = leaseHistoryItems.map((item) => {
      const itemId = getHistoryItemId(item);
      const detail = detailById.get(String(itemId));
      if (!detail) return item;

      return {
        ...item,
        ...detail,
        id: detail.id ?? item.id,
        contractId: detail.contractId ?? item.contractId ?? item.id,
        originalFileName: item.originalFileName ?? detail.originalFileName,
        createdAt: item.createdAt ?? detail.createdAt,
      };
    });

    return normalizeContractHistory(enrichedItems);
  }, [leaseApiData, leaseHistoryItems, leaseDetailDataKey]);

  const source = (hasDeedApiData || hasLeaseApiData) ? "api" : "local";
  const original = {
    deeds: hasDeedApiData ? normalizedDeeds : MOCK_DATA.deeds,
    leases: hasLeaseApiData ? normalizedLeases : MOCK_DATA.leases,
  };

  // ── 로컬 UI 상태: 탭·선택·삭제·실행취소 ──
  const [tab, setTab] = useState(() => sessionStorage.getItem("mypage_active_tab") || "deed");
  const [deeds, setDeeds] = useState(() => original.deeds.slice());
  const [leases, setLeases] = useState(() => original.leases.slice());
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [undo, setUndo] = useState(null);
  const [notice, setNotice] = useState(null);

  // 등기부 API 데이터 반영
  useEffect(() => {
    if (hasDeedApiData) {
      setDeeds(normalizedDeeds.slice());
    } else {
      setDeeds(MOCK_DATA.deeds.slice());
    }
  }, [normalizedDeeds, hasDeedApiData]);

  // 계약서 API 데이터 반영
  useEffect(() => {
    if (hasLeaseApiData) {
      setLeases(normalizedLeases.slice());
    } else {
      setLeases(MOCK_DATA.leases.slice());
    }
  }, [normalizedLeases, hasLeaseApiData]);

  const isDeed = tab === "deed";
  const list = isDeed ? deeds : leases;
  const setList = isDeed ? setDeeds : setLeases;
  const allSelected = list.length > 0 && selectedIds.length === list.length;

  // 등기부등본-임대차계약서 매물 매칭: 주소(동/호수 포함)가 정규화 후 완전히 동일한 경우만 묶음
  const matchedGroups = useMemo(() => {
    const usedLeaseIds = new Set();
    const groups = [];

    deeds.forEach((deed) => {
      const deedAddr = normalizeAddressForMatch(deed.addr);
      if (!deedAddr) return;

      const matchedLease = leases.find(
        (lease) => !usedLeaseIds.has(lease.id) && normalizeAddressForMatch(lease.addr) === deedAddr
      );
      if (matchedLease) {
        usedLeaseIds.add(matchedLease.id);
        groups.push({ key: `${deed.id}-${matchedLease.id}`, addr: deed.addr, deed, lease: matchedLease });
      }
    });

    return groups;
  }, [deeds, leases]);

  const resetSelection = () => { setSelectMode(false); setSelectedIds([]); };
  const switchTab = (nextTab) => { 
    setTab(nextTab); 
    sessionStorage.setItem("mypage_active_tab", nextTab);
    resetSelection(); 
  };
  const toggleId = (id) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  const toggleAll = () => setSelectedIds(allSelected ? [] : list.map((item) => item.id));
  const askDelete = (ids) => setConfirm({ ids, kind: tab });
  const doDelete = async () => {
    if (!confirm) return;
    const targetIds = confirm.ids;
    const targetKind = confirm.kind;

    try {
      if (targetKind === "deed") {
        await Promise.all(
          targetIds.map((id) => (typeof id === "string" && id.startsWith("d") ? Promise.resolve() : deleteAnalysis(id)))
        );
        setDeeds((prev) => prev.filter((item) => !targetIds.includes(item.id)));
        queryClient.setQueryData(["analysis", "history"], (cachedData) => filterHistoryCache(cachedData, targetIds));
        deedHistoryQuery.refetch();
      } else {
        await Promise.all(
          targetIds.map((id) => (typeof id === "string" && id.startsWith("l") ? Promise.resolve() : deleteContract(id)))
        );
        setLeases((prev) => prev.filter((item) => !targetIds.includes(item.id)));
        queryClient.setQueryData(["contracts", "history"], (cachedData) => filterHistoryCache(cachedData, targetIds));
        leaseHistoryQuery.refetch();
      }
      setConfirm(null);
      resetSelection();
      setUndo(null);
      setNotice({ count: targetIds.length });
    } catch (error) {
      setConfirm(null);
      setNotice({ count: 0, error: error.response?.data?.message || error.message || "삭제에 실패했습니다." });
    }
  };
  const doUndo = () => {
    if (!undo) return;
    const target = undo.kind === "deed" ? setDeeds : setLeases;
    const base = undo.kind === "deed" ? deeds : leases;
    const refOrder = (original[undo.kind === "deed" ? "deeds" : "leases"] ?? []).map((item) => item.id);
    target([...base, ...undo.items].sort((a, b) => refOrder.indexOf(a.id) - refOrder.indexOf(b.id)));
    setUndo(null);
  };

  return {
    // 쿼리 메타
    isLoading: deedHistoryQuery.isLoading || leaseHistoryQuery.isLoading || isLeaseDetailsLoading,
    isError: deedHistoryQuery.isError || leaseHistoryQuery.isError,
    error: deedHistoryQuery.error || leaseHistoryQuery.error,
    source,
    // UI 상태
    tab, deeds, leases, matchedGroups, isDeed, list, selectMode, setSelectMode, selectedIds,
    confirm, setConfirm, undo, setUndo, notice, setNotice, allSelected, resetSelection, switchTab,
    toggleId, toggleAll, askDelete, doDelete, doUndo,
  };
}

