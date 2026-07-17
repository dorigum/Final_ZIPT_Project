import { useMutation, useQuery } from '@tanstack/react-query';
import {
  analyzeRegistry,
  getAnalysisHistory,
  getAnalysisDetail,
  uploadPdf,               // ← 이게 있는지 확인
} from '../api/analysisApi';

/**
 * useRegistryAnalysis
 * POST /api/analysis/analyze
 * domain/analysis/controller/AnalysisController → analyze()
 *
 * AnalysisUploadForm.jsx 에서 사용
 * const { mutate: analyze, isPending } = useRegistryAnalysis();
 */

//QueryClient 기본값보다 우선 적용
export function useRegistryAnalysis() {
  return useMutation({
    mutationFn: analyzeRegistry,
    retry: false,   // 파일 업로드는 재시도 없음  
  });
}

/**
 * useAnalysisHistory
 * GET /api/analysis/history
 * domain/analysis/controller/AnalysisController → history()
 *
 * AnalysisHistoryPage.jsx 에서 사용
 */
export function useAnalysisHistory() {
  return useQuery({
    queryKey: ['analysis', 'history'],
    queryFn:  getAnalysisHistory,
  });
}

/**
 * useAnalysisDetail
 * GET /api/analysis/{id}
 * domain/analysis/controller/AnalysisController → detail()
 *
 * AnalysisHistoryPage.jsx 에서 카드 클릭 시 사용
 */
export function useAnalysisDetail(id) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn:  () => getAnalysisDetail(id),
    enabled:  !!id,   // id 있을 때만 호출
  });
}
///////////S3 추가
/**
 * useUploadPdf
 * POST /api/analysis/{id}/pdf/upload
 * html2canvas + jsPDF → Blob → 백엔드 → S3
 */
export function useUploadPdf() {
  return useMutation({
    mutationFn: uploadPdf,
    retry: false,
  });
}
