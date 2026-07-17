import instance from './instance';

const FAILED_STATUSES = new Set(['FAILED', 'FAIL', 'ERROR']);

const getResponsePayload = (responseBody) => responseBody?.data ?? responseBody;

const isFailedAnalysisPayload = (payload) => {
  const status = String(payload?.processingStatus ?? payload?.status ?? payload?.analysisStatus ?? '').toUpperCase();
  return FAILED_STATUSES.has(status) || payload?.success === false || Boolean(payload?.processingErrorMessage);
};

const normalizeFailedAnalysisPayload = (payload, fallbackMessage) => ({
  ...(payload && typeof payload === 'object' ? payload : {}),
  processingStatus: 'FAILED',
  processingErrorMessage:
    payload?.processingErrorMessage
    || payload?.errorMessage
    || payload?.message
    || fallbackMessage
    || '업로드한 파일에서 등기부등본 정보를 확인하지 못했습니다.',
});

/**
 * analyzeRegistry
 * POST /api/analysis/analyze
 * domain/analysis/controller/AnalysisController → analyze()
 *
 * @param {File}   file         등기부등본 파일
 * @param {number} deposit      전세보증금 (원)
 * @param {string} propertyType 매물 유형 (아파트/빌라/오피스텔/단독주택)
 * @returns AnalysisResponse
 */
export const analyzeRegistry = async ({ file, deposit, propertyType }) => {
  const form = new FormData();
  form.append('registryImage', file);
  form.append('deposit', deposit);
  form.append('propertyType', propertyType);

  try {
    const { data } = await instance.post('/analysis/analyze', form);
    const payload = getResponsePayload(data);

    if (isFailedAnalysisPayload(payload)) {
      return normalizeFailedAnalysisPayload(payload, data?.message);
    }

    return payload;   // ApiResponse.data → AnalysisResponse
  } catch (error) {
    const responseBody = error.response?.data;
    const failedAnalysis = getResponsePayload(responseBody);
    const fallbackMessage = responseBody?.message || error.message;

    // 백엔드가 "서류 분석 실패" 결과를 저장한 뒤 422로 내려주면,
    // 업로드 폼 에러가 아니라 AnalysisReport의 실패 화면으로 이동하도록 실패 데이터를 반환합니다.
    if (isFailedAnalysisPayload(failedAnalysis) || [400, 415, 422].includes(error.response?.status)) {
      return normalizeFailedAnalysisPayload(failedAnalysis, fallbackMessage);
    }

    throw error;
  }
};

/**
 * getAnalysisHistory
 * GET /api/analysis/history
 * domain/analysis/controller/AnalysisController → history()
 *
 * @returns AnalysisHistoryResponse[]
 */

//history일단 주석하고 개발하고  테스트
export const getAnalysisHistory = async () => {
  const { data } = await instance.get('/analysis/history');
  return data.data;
};

/**
 * getAnalysisDetail
 * GET /api/analysis/{id}
 * domain/analysis/controller/AnalysisController → detail()
 *
 * @param {number} id 분석 결과 id
 * @returns AnalysisResponse
 */
export const getAnalysisDetail = async (id) => {
  const { data } = await instance.get(`/analysis/${id}`);
  return data.data;
};

/**
 * uploadPdf
 * POST /api/analysis/{id}/pdf/upload
 * 프론트에서 생성한 PDF Blob → 백엔드 → S3 업로드 → presigned URL 반환
 *
 * @param {number} id      분석 결과 id
 * @param {Blob}   pdfBlob html2canvas + jsPDF로 생성한 PDF
 * @returns presigned URL (string)
 */
export const uploadPdf = async ({ id, pdfBlob }) => {
  const form = new FormData();
  form.append('pdf', pdfBlob, `zipt-report-${id}.pdf`);
 
  const { data } = await instance.post(`/analysis/${id}/pdf/upload`, form);
  return data.data;  // S3 presigned URL
};

//삭제 api 추가
export const deleteAnalysis = async (id) => {
  const { data } = await instance.delete(`/analysis/${id}`);
  return data;
};
