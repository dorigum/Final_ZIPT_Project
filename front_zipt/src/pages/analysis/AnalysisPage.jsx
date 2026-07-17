import { useState } from 'react';
import AnalysisUploadForm from '../../components/analysis/AnalysisUploadForm';
import AnalysisReport from '../../components/analysis/AnalysisReport';
import { Analyzing } from '../../components/common/index.jsx';
import { ANALYSIS_ANALYZING_STAGES } from './analysisAnalyzingStages';

/**
 * AnalysisPage.jsx
 * /analysis 라우트
 *
 * 상태 흐름
 *   isAnalyzing === true → 분석 진행 단계 애니메이션 표시
 *   reportData === null  → AnalysisUploadForm 표시
 *   reportData !== null  → AnalysisReport 표시
 *
 * 백엔드 연결
 *   AnalysisUploadForm    → POST /api/analysis/analyze
 *   AnalysisReport → props로 data 받음 (직접 호출 없음)
 */
export default function AnalysisPage() {
  // AnalysisResponse 또는 null
  const [reportData, setReportData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div>
      {isAnalyzing ? (
        /* 분석 진행 중 — 단계별 애니메이션 */
        <Analyzing
          stages={ANALYSIS_ANALYZING_STAGES}
          onFinished={() => setIsAnalyzing(false)}
        />
      ) : !reportData ? (
        /* 분석 전 — 업로드 폼 */
        <AnalysisUploadForm
          onAnalyzeStart={() => setIsAnalyzing(true)}
          onSuccess={(data) => { setReportData(data); setIsAnalyzing(false); }}
          onError={() => setIsAnalyzing(false)}
        />
      ) : (
        /* 분석 후 — 리포트 */
        <AnalysisReport
          data={reportData}
          onBack={() => setReportData(null)}
        />
      )}
    </div>
  );
}
