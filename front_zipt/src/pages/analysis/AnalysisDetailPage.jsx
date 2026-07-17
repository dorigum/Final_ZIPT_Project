import { useParams, useNavigate } from 'react-router-dom';
import { useAnalysisDetail } from '../../hooks/useAnalysis';
import AnalysisReport from '../../components/analysis/AnalysisReport';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: analysisResponse, isLoading, error } = useAnalysisDetail(id);
  const analysis = analysisResponse?.data || analysisResponse;


  if (isLoading) {
    return (
      <div style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '40px 20px', 
        textAlign: 'center',
        color: '#64748b'
      }}>
        분석 리포트를 불러오는 중입니다...
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#dc2626', marginBottom: 16 }}>
          분석 리포트를 불러오지 못했습니다.
        </p>
        <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
          {error?.response?.data?.message || error?.message || '알 수 없는 에러가 발생했습니다.'}
        </p>
        <button
          onClick={() => navigate('/mypage')}
          style={{
            padding: '8px 16px',
            background: '#1A3260',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 데이터 없음
  if (!analysis) {
    return (
      <div style={{ 
        maxWidth: 900, 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#334155', marginBottom: 16 }}>
          분석 데이터를 찾을 수 없습니다.
        </p>
        <button
          onClick={() => navigate('/mypage')}
          style={{
            padding: '8px 16px',
            background: '#1A3260',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  //
  return (
    <div style={{ paddingBottom: 40 }}>
      <AnalysisReport 
        data={analysis} 
        onBack={() => navigate('/mypage')}
      />
    </div>
  );
}