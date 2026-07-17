import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getContract,
  getContractHistory,
  deleteContract,
  uploadContractAndGenerateChecklists,
  uploadContractPdf,
  regenerateChecklist,
  updateChecklistItemChecked,
  updateContractTracking,
} from '../api/contractApi';

const unwrapApiData = (response) => response?.data ?? response;

const updateChecklistItemInContract = (cachedData, checklistItemId, updater) => {
  if (!cachedData) return cachedData;

  const contract = unwrapApiData(cachedData);
  if (!contract || !Array.isArray(contract.checklistItems)) return cachedData;

  const nextContract = {
    ...contract,
    checklistItems: contract.checklistItems.map((item) => {
      if (String(item?.id) !== String(checklistItemId)) return item;
      return typeof updater === 'function' ? updater(item) : { ...item, ...updater };
    }),
  };

  if (cachedData?.data === contract) {
    return { ...cachedData, data: nextContract };
  }

  return nextContract;
};

/**
 * useUploadContract
 * POST /api/contracts
 * ContractUploadForm.jsx에서 사용
 */
export function useUploadContract() {
  return useMutation({
    mutationFn: uploadContractAndGenerateChecklists,
    retry: false,
  });
}

/**
 * useContractHistory
 * GET /api/contracts/history
 * ContractHistoryPage.jsx에서 사용
 */
export function useContractHistory() {
  return useQuery({
    queryKey: ['contracts', 'history'],
    queryFn: getContractHistory,
  });
}

/**
 * useContractDetail
 * GET /api/contracts/{contractId}
 * ContractDetailPage.jsx에서 사용
 */
export function useContractDetail(contractId) {
  const numericId = contractId ? Number(contractId) : null;
  return useQuery({
    queryKey: ['contracts', numericId],
    queryFn: () => getContract(numericId),
    enabled: !!numericId,
  });
}

export function useContractDelete() {
  return useMutation({
    mutationFn: deleteContract,
  });
}

export function useChecklistRegenerate(contractId) {
  const numericId = contractId ? Number(contractId) : null;
  return useMutation({
    mutationFn: (targetContractId = numericId) => regenerateChecklist(Number(targetContractId)),
    retry: false,
  });
}

export function useChecklistItemCheckedUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChecklistItemChecked,
    onMutate: async ({ contractId, checklistItemId, checked }) => {
      const numericId = Number(contractId);
      const detailQueryKey = ['contracts', numericId];
      await queryClient.cancelQueries({ queryKey: detailQueryKey });

      const previousContract = queryClient.getQueryData(detailQueryKey);
      queryClient.setQueryData(detailQueryKey, (cachedData) => (
        updateChecklistItemInContract(cachedData, checklistItemId, { checked })
      ));

      return { previousContract };
    },
    onError: (_error, { contractId }, context) => {
      const numericId = Number(contractId);
      if (context?.previousContract !== undefined) {
        queryClient.setQueryData(['contracts', numericId], context.previousContract);
      }
    },
    onSuccess: (response, { contractId, checklistItemId }) => {
      const numericId = Number(contractId);
      const updatedItem = unwrapApiData(response);
      if (updatedItem) {
        queryClient.setQueryData(['contracts', numericId], (cachedData) => (
          updateChecklistItemInContract(cachedData, checklistItemId, updatedItem)
        ));
      }
    },
    onSettled: (_data, _error, variables) => {
      const numericId = Number(variables.contractId);
      queryClient.invalidateQueries({ queryKey: ['contracts', numericId] });
    },
    retry: false,
  });
}

export function useUploadContractPdf() {
  return useMutation({
    mutationFn: uploadContractPdf,
    retry: false,
  });
}

/**
 * useContractTrackingUpdate
 * PATCH /api/contracts/{contractId}/tracking
 * ContractDetailPage.jsx에서 "일정 알림 켜기/끄기" 토글에 사용
 */
export function useContractTrackingUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContractTracking,
    onMutate: async ({ contractId, trackingEnabled }) => {
      const numericId = Number(contractId);
      const detailQueryKey = ['contracts', numericId];
      await queryClient.cancelQueries({ queryKey: detailQueryKey });

      const previousContract = queryClient.getQueryData(detailQueryKey);
      queryClient.setQueryData(detailQueryKey, (cachedData) => {
        if (!cachedData) return cachedData;
        const contract = unwrapApiData(cachedData);
        if (!contract) return cachedData;
        const nextContract = { ...contract, trackingEnabled };
        return cachedData?.data === contract ? { ...cachedData, data: nextContract } : nextContract;
      });

      return { previousContract };
    },
    onError: (_error, { contractId }, context) => {
      const numericId = Number(contractId);
      if (context?.previousContract !== undefined) {
        queryClient.setQueryData(['contracts', numericId], context.previousContract);
      }
    },
    onSettled: (_data, _error, variables) => {
      const numericId = Number(variables.contractId);
      queryClient.invalidateQueries({ queryKey: ['contracts', numericId] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'history'] });
    },
    retry: false,
  });
}
