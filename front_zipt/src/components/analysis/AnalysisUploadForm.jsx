import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistryAnalysis, useAnalysisHistory } from '../../hooks/useAnalysis';
import { normalizeAnalysisHistory, truncateFileName } from './normalizers';

/**
 * AnalysisUploadForm.jsx
 * 등기부등본 업로드 폼
 *
 * props
 *   onSuccess(data) : 분석 성공 시 AnalysisResponse 전달
 *
 * 백엔드 연결
 *   POST /api/analysis/analyze
 *   domain/analysis/controller/AnalysisController
 *   파라미터: registryImage(File), deposit(Long), propertyType(String)
 */
export default function AnalysisUploadForm({ onSuccess, onAnalyzeStart, onError }) {
  const navigate = useNavigate();
  const { data: rawHistory } = useAnalysisHistory();

  const recentReports = (() => {
    if (!rawHistory) return [];
    const normalized = normalizeAnalysisHistory(rawHistory).deeds;
    return normalized.slice(0, 3);
  })();

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const [file,         setFile]         = useState(null);
  const [deposit,      setDeposit]      = useState('');
  const [propertyType, setPropertyType] = useState('아파트');
  const [isDragging,   setIsDragging]   = useState(false);
  const [error,        setError]        = useState('');

  const fileInputRef = useRef(null);

  // POST /api/analysis/analyze
  // mutateAsync 사용 — onAnalyzeStart로 화면이 전환되어 UploadForm이 언마운트되더라도
  // (mutate의 콜백 옵션과 달리) await된 프로미스는 정상적으로 resolve/reject됨
  const { mutateAsync: analyze, isPending } = useRegistryAnalysis();

  // ── 파일 유효성 검사 + 저장 ──
  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      setError('JPG · PNG · PDF 파일만 업로드 가능합니다.');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('파일 크기는 20MB 이하여야 합니다.');
      return;
    }
    setFile(f);
    setError('');
  };

  // ── 드래그 앤 드롭 ──
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── 보증금 입력 — 숫자만 허용, 콤마 포맷 ──
  const handleDeposit = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setDeposit(raw);
  };

  // ── 보증금 미리보기 (억/만원) ──
  const depositPreview = () => {
    const n = Number(deposit);
    if (!n) return '';
    if (n >= 1e8) return `≈ ${(n / 1e8).toFixed(1)}억 원`;
    if (n >= 1e4) return `≈ ${Math.round(n / 1e4).toLocaleString()}만 원`;
    return '';
  };

  // ── 분석 요청 ──
  const handleSubmit = async () => {
    if (!file)    { setError('등기부등본 파일을 선택해주세요.'); return; }
    if (!deposit) { setError('전세보증금을 입력해주세요.'); return; }
    setError('');
    onAnalyzeStart?.();

    // POST /api/analysis/analyze
    // hooks/useAnalysis.js → useRegistryAnalysis()
    try {
      const data = await analyze({ file, deposit: Number(deposit), propertyType });
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || '분석 중 오류가 발생.');
      onError?.();
    }
  };

  return (
    <div style={{ maxWidth: isMobile ? 540 : 1000, margin: '0 auto', padding: 16 }}>
      <style>{`
        .zipt-card-hover {
          transition: all 0.35s cubic-bezier(.16,1,.3,1) !important;
          box-shadow: 0 2px 8px rgba(15,27,51,.05);
        }
        .zipt-card-hover:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(42, 107, 230, 0.35) !important;
          box-shadow: 0 16px 36px rgba(42, 107, 230, 0.12) !important;
        }
        .reveal-card-left {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .reveal-card-right-1 {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) 0.08s forwards;
        }
        .reveal-card-right-2 {
          opacity: 0;
          transform: translateY(32px) scale(0.97);
          animation: revealCard 0.7s cubic-bezier(.16,1,.3,1) 0.15s forwards;
        }
        .upload-dropzone {
          transition: all 0.3s ease !important;
        }
        .upload-dropzone:hover {
          border-color: var(--primary) !important;
          background: #f4f7ff !important;
        }
        .upload-dropzone:hover .upload-icon {
          animation: zipt-bounce 0.8s ease infinite;
        }
        .upload-dropzone:hover .upload-guide-text {
          color: var(--primary) !important;
          transform: scale(1.04);
        }
        .upload-hover-msg {
          opacity: 0;
          height: 0;
          transform: translateY(8px);
          transition: all 0.35s cubic-bezier(.16,1,.3,1);
          color: var(--primary);
          font-weight: 800;
          font-size: 13px;
          margin-top: 0;
          overflow: hidden;
        }
        .upload-dropzone:hover .upload-hover-msg {
          opacity: 1;
          height: 20px;
          transform: translateY(0);
          margin-top: 10px;
        }
      `}</style>

      {/* ── 타이틀 ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", color: "var(--primary)", marginBottom: 8 }}>ZIPT DEED</div>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', lineHeight: 1.3 }}>
          전세 계약 전<br />
          <span style={{
            background: "linear-gradient(135deg, var(--primary-700) 0%, var(--primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>위험도</span>를 먼저 확인하세요
        </h1>
        <p style={{ color: '#555', marginTop: 8, lineHeight: 1.7, fontSize: isMobile ? '14px' : '15px' }}>
          등기부등본 한 장으로 LTV 위험도 · 전세보증보험 가입 가능 여부 ·
          임대사업자 정보까지 즉시 분석해 드립니다.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px', alignItems: 'stretch' }}>

        {/* 좌측 컬럼: 업로드 및 입력 폼 */}
        <div style={{ flex: 1.2, width: '100%', display: 'flex' }}>
          <div className="reveal-card-left" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24, background: '#fff', width: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* 드래그 앤 드롭 영역 */}
            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#1A3260' : '#ccc'}`,
                borderRadius: 8,
                padding: 32,
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: 20,
                background: isDragging ? '#f0f4ff' : '#fafafa',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* 숨겨진 파일 input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="upload-icon" style={{ fontSize: 32, marginBottom: 8, display: 'inline-block' }}>📄</span>
                <p className="upload-guide-text" style={{ fontWeight: 700, marginBottom: 4, transition: 'all 0.3s ease', margin: 0 }}>등기부등본 업로드</p>
                <p style={{ fontSize: 12, color: 'gray', margin: '4px 0 0' }}>
                  클릭하거나 파일을 끌어다 놓으세요<br />
                  JPG · PNG · PDF / 최대 20MB
                </p>
                <div className="upload-hover-msg">파일을 업로드해주세요!</div>
              </div>
            </div>

            {/* ── 전세보증금 ── */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                전세보증금
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="text"
                  value={deposit ? Number(deposit).toLocaleString() : ''}
                  onChange={handleDeposit}
                  placeholder="예) 420,000,000"
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 15 }}
                />
                <span style={{ color: 'gray', fontSize: 13 }}>원</span>
              </div>
              {depositPreview() && (
                <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  {depositPreview()}
                </p>
              )}
            </div>

            {/* ── 매물 유형 ── */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>
                매물 유형
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['아파트', '빌라', '오피스텔', '단독주택'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPropertyType(type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1px solid #ddd',
                      background: propertyType === type ? '#1A3260' : '#fff',
                      color: propertyType === type ? '#fff' : '#555',
                      fontWeight: propertyType === type ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 선택한 파일 ── */}
            {file && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff' }}>
                <span aria-hidden={true}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 11, color: 'gray' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  aria-label={`${file.name} 삭제`}
                  onClick={() => setFile(null)}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#777', fontSize: 16 }}
                >
                  ×
                </button>
              </div>
            )}

            {/* ── 에러 메시지 ── */}
            {error && (
              <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>{error}</p>
            )}

            {/* ── 분석 버튼 ── */}
            <button
              onClick={handleSubmit}
              disabled={isPending}
              style={{
                width: '100%',
                padding: 14,
                background: isPending ? '#ccc' : '#1A3260',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                cursor: isPending ? 'not-allowed' : 'pointer',
                marginTop: 'auto',
              }}
            >
              {isPending ? 'ZIPT 분석 중...' : '위험도 분석하기'}
            </button>
          </div>
        </div>

        {/* 우측 컬럼: 최근 분석 내역 및 기능 소개 */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 최근 분석 내역 (제안 3번) */}
          {recentReports.length > 0 && (
            <div className="reveal-card-right-1" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A3260' }}>최근 등기부등본 분석 내역</h3>
                <button
                  onClick={() => {
                    sessionStorage.setItem("mypage_active_tab", "deed");
                    navigate('/mypage');
                  }}
                  style={{ background: 'none', border: 'none', color: '#1A3260', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  전체 보기 &gt;
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => navigate(`/analysis/${report.id}`)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: '#f8fafc',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.title}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        파일명: {truncateFileName(report.fileName)} · {report.analyzedAt}
                      </p>
                    </div>
                    <span style={{ fontSize: 11, color: '#1A3260', fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>조회 &gt;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 기능 3개 그리드 */}
          <div className="reveal-card-right-2" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : '1fr', gap: 12 }}>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>📊</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>LTV 위험도</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>선순위 채권 + 보증금 / 시세</p>
              </div>
            </div>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>🏦</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>보증보험 판별</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>HUG 3대 공식 자동 검증</p>
              </div>
            </div>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>등기 이상 탐지</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>가등기 · 가처분 · 임차권</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
