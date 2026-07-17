import instance from './instance';
import { useAuthStore } from '../store/useAuthStore';

const getApiBaseUrl = () => {
    const configuredUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    return import.meta.env.DEV ? '/api' : (configuredUrl || '/api');
};

const parseSseMessage = (message) => {
  const event = { event: 'message', data: '' };

  message.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith(':')) return;

    const separatorIndex = line.indexOf(':');
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
    const value = separatorIndex === -1 ? '' : line.slice(separatorIndex + 1).trimStart();

    if (field === 'event') {
      event.event = value;
    }

    if (field === 'data') {
      event.data += event.data ? `\n${value}` : value;
    }
  });

  return event;
};

const emitSseMessages = (buffer, onEvent) => {
  const normalized = buffer.replace(/\r\n/g, '\n');
  const messages = normalized.split('\n\n');
  const nextBuffer = messages.pop() ?? '';

  messages.forEach((message) => {
    const parsed = parseSseMessage(message);
    if (!parsed.data) return;

    try {
      onEvent({
        event: parsed.event,
        data: JSON.parse(parsed.data),
      });
    } catch {
      onEvent({
        event: parsed.event,
        data: parsed.data,
      });
    }
  });

  return nextBuffer;
};

/**
 * uploadContractAndGenerateChecklists
 * POST /api/contract
 * domain/contract/controller/ContractController → uploadAndGenerateChecklists()
 *
 * @param {File[]}   contractFiles
 * @returns ContractUploadResponse
 */
export const uploadContractAndGenerateChecklists = async ({ contractFiles }) => {
    const form = new FormData();

	// contractFiles를 백엔드에서 List<File>로 받기 위해 appendMultiFile 사용
    contractFiles.forEach((file) => {
        form.append('contractFiles', file);
    });

    const { data } = await instance.post('/contracts', form);
    return data;
};

/**
 * getContractHistory
 * GET /api/contracts/history
 * domain/contract/controller/ContractController → getMyContracts()
 * 
 * @returns ContractHistoryResponse[]
 */
export const getContractHistory = async () => {
    try {
        const { data } = await instance.get('/contracts/history');
        return data;
    } catch (error) {
        // 백엔드에서 계약서 목록이 비어있을 때 404 Not Found를 반환하므로,
        // 프론트엔드가 중단되지 않도록 빈 데이터 규격으로 복구하여 리턴합니다.
        if (error?.response?.status === 404) {
            return { success: true, data: [] };
        }
        throw error;
    }
};

/**
 * getContract
 * GET /api/contracts/{contractId}
 * domain/contract/controller/ContractController → getContract()
 * 
 * @param {number} contractId   
 * @returns ContractResponse
 */
export const getContract = async (contractId) => {
    const { data } = await instance.get(`/contracts/${contractId}`);
    return data;
};

/**
 * streamContractProcessingEvents
 * GET /api/contracts/{contractId}/processing-events
 *
 * EventSource cannot attach Authorization headers, so this reads the SSE stream
 * with fetch while keeping the same bearer token/cookie auth used by axios.
 *
 * @param {number} contractId
 * @param {(event: { event: string, data: object|string }) => void} onEvent
 * @param {AbortSignal} signal
 */
export const streamContractProcessingEvents = async ({ contractId, onEvent, signal }) => {
    const accessToken = useAuthStore.getState().accessToken;
    const headers = {
        Accept: 'text/event-stream',
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${getApiBaseUrl()}/contracts/${contractId}/processing-events`, {
        method: 'GET',
        headers,
        credentials: 'include',
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to subscribe contract processing events. status=${response.status}`);
    }

    if (!response.body) {
        throw new Error('This browser does not support readable SSE streams.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            buffer = emitSseMessages(buffer + decoder.decode(), onEvent);
            break;
        }

        buffer = emitSseMessages(buffer + decoder.decode(value, { stream: true }), onEvent);
    }
};

/**
 * deleteContract
 * DELETE /api/contracts/{contractId}
 * domain/contract/controller/ContractController → deleteContract()
 * 
 * @param {number} contractId   
 * @returns
 */
export const deleteContract = async (contractId) => {
    const { data } = await instance.delete(`/contracts/${contractId}`);
    return data;
};

/**
 * regenerateChecklist
 * POST /api/contracts/{contractId}/regenerate
 * domain/contract/controller/ContractController → regenerateChecklist()
 * 
 * @param {number} contractId   
 * @returns ContractUploadResponse
 */
export const regenerateChecklist = async (contractId) => {
    const { data } = await instance.post(`/contracts/${contractId}/regenerate`);
    return data;
};

/**
 * updateChecklistItemChecked
 * PATCH /api/contracts/{contractId}/checklist-items/{checklistItemId}/checked
 * domain/contract/controller/ContractController → updateChecklistItemChecked()
 *
 * @param {number} contractId
 * @param {number} checklistItemId
 * @param {boolean} checked
 * @returns ContractChecklistItemResponse
 */
export const updateChecklistItemChecked = async ({ contractId, checklistItemId, checked }) => {
  const { data } = await instance.patch(
    `/contracts/${contractId}/checklist-items/${checklistItemId}/checked`,
    { checked }
  );
  return data;
};

/**
 * updateContractTracking
 * PATCH /api/contracts/{contractId}/tracking
 * domain/contract/controller/ContractController → updateTrackingEnabled()
 *
 * 마이페이지 D-day 알림 노출 여부를 사용자가 직접 켜고 끄는 토글
 *
 * @param {number} contractId
 * @param {boolean} trackingEnabled
 * @returns ContractHistoryResponse
 */
export const updateContractTracking = async ({ contractId, trackingEnabled }) => {
  const { data } = await instance.patch(
    `/contracts/${contractId}/tracking`,
    { trackingEnabled }
  );
  return data;
};

/**
 * uploadPdf
 * POST /api/contracts/{contractId}/pdf/upload
 * 프론트에서 생성한 PDF Blob → 백엔드 → S3 업로드 → presigned URL 반환
 *
 * @param {number} contractId      분석 결과 id
 * @param {Blob}   pdfBlob html2canvas + jsPDF로 생성한 PDF
 * @returns presigned URL (string)
 */
export const uploadContractPdf = async ({ contractId, pdfBlob }) => {
  const form = new FormData();
  form.append('pdf', pdfBlob, `zipt-contract-${contractId}.pdf`);
 
  const { data } = await instance.post(`/contracts/${contractId}/pdf/upload`, form);
  return data.data;  // S3 presigned URL
};
