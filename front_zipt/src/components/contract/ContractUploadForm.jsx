import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadContract, useContractHistory } from '../../hooks/useContract';
import { normalizeContractHistory, truncateFileName } from '../analysis/normalizers';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function ContractUploadForm({ onSuccess, onAnalyzeStart, onError }) {
  const navigate = useNavigate();
  const { data: rawHistory } = useContractHistory();

  const recentReports = (() => {
    if (!rawHistory) return [];
    const normalized = normalizeContractHistory(rawHistory);
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

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { mutateAsync: uploadContract, isPending: isUploading } = useUploadContract();

  const addFiles = (selectedFiles) => {
    const nextFiles = Array.from(selectedFiles ?? []);
    if (!nextFiles.length) return;

    const invalidType = nextFiles.find((file) => !ALLOWED_FILE_TYPES.includes(file.type));
    if (invalidType) {
      setError(`${invalidType.name}: JPG, PNG, PDF 파일만 업로드할 수 있습니다.`);
      return;
    }

    const oversizedFile = nextFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      setError(`${oversizedFile.name}: 파일 크기는 20MB 이하여야 합니다.`);
      return;
    }

    setFiles((currentFiles) => {
      const existingKeys = new Set(currentFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
      const uniqueFiles = nextFiles.filter((file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`));
      return [...currentFiles, ...uniqueFiles];
    });
    setError('');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError('계약서 파일을 한 개 이상 선택해 주세요.');
      return;
    }

    setError('');
    onAnalyzeStart?.();
    try {
      const data = await uploadContract({ contractFiles: files });
      onSuccess?.(data?.data ?? data);
    } catch (uploadError) {
      setError(
        uploadError.response?.data?.message || '분석 중 오류가 발생했습니다.'
      );
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
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".05em", color: "var(--primary)", marginBottom: 8 }}>ZIPT CONTRACT</div>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', lineHeight: 1.3 }}>
          계약서를 올리고<br />
          <span style={{
            background: "linear-gradient(135deg, var(--primary-700) 0%, var(--primary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>필수 체크리스트</span>를 확인하세요
        </h1>
        <p style={{ color: '#555', marginTop: 8, lineHeight: 1.7, fontSize: isMobile ? '14px' : '15px' }}>
          계약서 파일을 여러 개 올리면 주요 조항과 확인할 내용을 한 번에 분석해 드립니다.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px', alignItems: 'stretch' }}>

        {/* 좌측 컬럼: 업로드 박스 및 파일 선택 폼 */}
        <div style={{ flex: 1.2, width: '100%', display: 'flex' }}>
          <div className="reveal-card-left" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24, background: '#fff', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
              className="upload-dropzone"
              role={'button'}
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#1A3260' : '#ccc'}`,
                borderRadius: 8,
                padding: 32,
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: files.length ? 16 : 20,
                background: isDragging ? '#f0f4ff' : '#fafafa',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <input
                ref={fileInputRef}
                type={'file'}
                multiple
                accept={'.jpg,.jpeg,.png,.pdf'}
                style={{ display: 'none' }}
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = '';
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="upload-icon" style={{ fontSize: 32, marginBottom: 8, display: 'inline-block' }}>📄</span>
                <p className="upload-guide-text" style={{ fontWeight: 700, marginBottom: 4, transition: 'all 0.3s ease', margin: 0 }}>계약서 파일 업로드</p>
                <p style={{ fontSize: 12, color: 'gray', lineHeight: 1.6, margin: '4px 0 0' }}>
                  클릭하거나 여러 파일을 이곳에 끌어다 놓으세요<br />
                  JPG · PNG · PDF / 파일당 최대 20MB
                </p>
                <div className="upload-hover-msg">파일을 업로드해주세요!</div>
              </div>
            </div>

            {files.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>선택한 파일 {files.length}개</p>
                  <button type={'button'} onClick={() => setFiles([])} style={{ border: 0, background: 'transparent', color: '#666', cursor: 'pointer', fontSize: 12 }}>
                    전체 삭제
                  </button>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {files.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${file.lastModified}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff' }}>
                      <span aria-hidden={true}>📎</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'gray' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type={'button'} aria-label={`${file.name} 삭제`} onClick={() => setFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index))} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#777', fontSize: 16 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p role={'alert'} style={{ color: '#d32f2f', fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button type={'button'} onClick={handleSubmit} disabled={isUploading} style={{ width: '100%', padding: 14, background: isUploading ? '#ccc' : '#1A3260', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: isUploading ? 'not-allowed' : 'pointer', marginTop: 'auto' }}>
              {isUploading ? 'ZIPT 분석 중...' : '계약서 분석하기'}
            </button>
          </div>
        </div>

        {/* 우측 컬럼: 최근 분석 내역 및 기능 소개 */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 최근 분석 내역 */}
          {recentReports.length > 0 && (
            <div className="reveal-card-right-1" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24, background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1A3260' }}>최근 임대차계약서 분석 내역</h3>
                <button
                  onClick={() => {
                    sessionStorage.setItem("mypage_active_tab", "lease");
                    navigate('/mypage');
                  }}
                  style={{ background: 'none', border: 'none', color: '#1A3260', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  전체 보기 &gt;
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentReports.map((report) => {
                  const goDetail = () => {
                    const isMockId = typeof report.id === 'string' && report.id.startsWith('l');
                    if (isMockId) {
                      navigate('/contract');
                    } else {
                      navigate(`/contract/${report.id}`);
                    }
                  };

                  return (
                    <div
                      key={report.id}
                      onClick={goDetail}
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
                          파일명: {truncateFileName(report.fileName)} · {report.analyzedAt}{report.type ? ` · ${report.type}` : ''}
                        </p>
                      </div>
                      <span style={{ fontSize: 11, color: '#1A3260', fontWeight: 700, marginLeft: 8, whiteSpace: 'nowrap' }}>조회 &gt;</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 기능 3개 그리드 */}
          <div className="reveal-card-right-2" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : '1fr', gap: 12 }}>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>특약 조항 분석</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>불리한 독소 조항 실시간 감지</p>
              </div>
            </div>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>📑</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>대항력 검증</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>확정일자 효력 발생 시점 안내</p>
              </div>
            </div>
            <div className="zipt-card-hover" style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? 6 : 12, background: '#fff' }}>
              <span style={{ fontSize: 24 }}>📝</span>
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>필수 기재사항</p>
                <p style={{ fontSize: 11, color: 'gray', margin: '2px 0 0' }}>계약 주요 조건 누락 여부 대조</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
