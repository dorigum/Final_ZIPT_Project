import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useContractDelete,
  useContractDetail,
  useUploadContractPdf,
  useChecklistRegenerate,
  useChecklistItemCheckedUpdate,
  useContractTrackingUpdate,
} from '../../hooks/useContract';
import { AnalysisFailedState, Analyzing, Button } from '../../components/common/index.jsx';
import ContractReport from '../../components/contract/ContractReport.jsx';
import { CONTRACT_ANALYZING_STAGES } from './contractAnalyzingStages';

const IN_PROGRESS_STATUSES = new Set([
  'PROCESSING',
  'OCR_EXTRACTING',
  'AI_EXTRACTING',
  'CHECKLIST_GENERATING',
]);

const normalizeContract = (response) => response?.data ?? response ?? {};

const isChecklistItemChecked = (item) => item?.checked === true || item?.checked === 'true';

export default function ContractDetailPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const {
    data: contractResponse,
    isLoading,
    isError,
    error,
    refetch: loadContract,
  } = useContractDetail(contractId);
  
  const { mutate: uploadContractPdf, isPending: pdfLoading } = useUploadContractPdf();
  const { mutate: deleteContract, isPending: isDeleting } = useContractDelete();
  const { mutate: regenerateChecklist, isPending: isRegenerating } = useChecklistRegenerate(contractId);
  const {
    mutate: updateChecklistItemChecked,
    variables: checkingVariables,
    isPending: isChecklistChecking,
  } = useChecklistItemCheckedUpdate();
  const { mutate: updateContractTracking, isPending: isTrackingUpdating } = useContractTrackingUpdate();
  const [isReanalysisActive, setIsReanalysisActive] = useState(false);
  const [terminalProcessingEvent, setTerminalProcessingEvent] = useState(null);

  const contract = normalizeContract(contractResponse);
  const normalizedStatus = String(contract?.processingStatus ?? '').toUpperCase();
  const isPdfAvailable = normalizedStatus === 'COMPLETED';
  const errorMessage = !contractId
    ? '계약서 ID가 없습니다.'
    : error?.response?.data?.message || '계약서 상세 내용을 불러오지 못했습니다.';

  useEffect(() => {
    setTerminalProcessingEvent(null);
    setIsReanalysisActive(false);
  }, [contractId]);

  const handleAnalyzingFinished = useCallback(() => {
    setTerminalProcessingEvent('COMPLETED');
    setIsReanalysisActive(false);
    loadContract();
  }, [loadContract]);

  const handleAnalyzingFailed = useCallback(() => {
    setTerminalProcessingEvent('FAILED');
    setIsReanalysisActive(false);
    loadContract();
  }, [loadContract]);

  const handlePdfSave = async () => {
    if (!reportRef.current || !contractId) return;

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(reportRef.current, { scale: 1.2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

      const pdfBlob = pdf.output('blob');
      const fileName = `zipt-contract-${contract?.id ?? contractId}.pdf`;

      uploadContractPdf(
        { contractId, pdfBlob },
        {
          onSuccess: () => pdf.save(fileName),
          onError: () => alert('PDF 저장 실패'),
        }
      );
    } catch {
      alert('PDF 생성 실패');
    }
  };

  const handleReanalysis = () => {
    if (!contractId || isRegenerating) return;

    regenerateChecklist(contractId, {
      onSuccess: () => {
        setTerminalProcessingEvent(null);
        setIsReanalysisActive(true);
      },
      onError: () => {
        setIsReanalysisActive(false);
        alert('재분석 요청 실패');
      },
    });
  };

  const handleDeleteAndUpload = () => {
    if (!contractId || isDeleting) return;

    deleteContract(contractId, {
      onSuccess: () => navigate('/contract', { replace: true }),
      onError: (deleteError) => {
        alert(deleteError?.response?.data?.message || '계약 삭제에 실패했습니다.');
      },
    });
  };

  const handleToggleTracking = (nextEnabled) => {
    if (!contractId || isTrackingUpdating) return;

    updateContractTracking({ contractId, trackingEnabled: nextEnabled }, {
      onError: () => {
        alert('일정 알림 설정을 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  const handleToggleChecklistItem = (item) => {
    const checklistItemId = item?.id ?? item?.checklistItemId ?? item?.checklistId;
    if (!contractId || !checklistItemId) {
      alert('체크리스트 항목 ID가 없어 상태를 변경할 수 없습니다.');
      return;
    }

    updateChecklistItemChecked({
      contractId,
      checklistItemId,
      checked: !isChecklistItemChecked(item),
    }, {
      onError: () => {
        alert('체크 상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  if (isLoading) {
    return <div style={{ padding: 64, textAlign: 'center', color: 'var(--ink-3)' }}>계약서 상세 내용을 불러오는 중입니다...</div>;
  }

  if (!contractId || isError) {
    return (
      <div role="alert" style={{ maxWidth: 760, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 16px', color: 'var(--danger-600)' }}>{errorMessage}</p>
        <Button variant="ghost" onClick={() => loadContract()}>다시 불러오기</Button>
      </div>
    );
  }

  const shouldShowAnalyzing = !terminalProcessingEvent && (
    isReanalysisActive || IN_PROGRESS_STATUSES.has(normalizedStatus)
  );

  if (shouldShowAnalyzing) {
    return (
      <Analyzing
        stages={CONTRACT_ANALYZING_STAGES}
        contractId={contractId}
        title="ZIPT가 계약서를 분석하고 있어요"
        subtitle="완료되면 이 화면에 자동으로 결과가 표시돼요"
        onFinished={handleAnalyzingFinished}
        onFailed={handleAnalyzingFailed}
      />
    );
  }

  if (normalizedStatus === 'FAILED' || terminalProcessingEvent === 'FAILED') {
    return (
      <AnalysisFailedState
        title="계약서를 분석할 수 없어요"
        message={contract?.processingErrorMessage || '업로드한 파일에서 임대차계약서 정보를 확인하지 못했어요. 계약서 형식의 PDF 또는 선명한 이미지 파일로 다시 시도해 주세요.'}
        reasons={[
          '임대차계약서가 아닌 다른 문서예요.',
          '계약서 이미지가 흐리거나 일부 페이지가 잘렸어요.',
          'PDF가 암호화되어 있거나 텍스트 추출이 어려워요.',
        ]}
        primaryAction={contract.isReanalyzable ? {
          label: isRegenerating ? '재분석 요청 중...' : '재분석',
          icon: 'undo',
          onClick: handleReanalysis,
          disabled: isRegenerating,
        } : {
          label: isDeleting ? '삭제 중...' : '삭제하고 다시 업로드',
          icon: 'upload',
          onClick: handleDeleteAndUpload,
          disabled: isDeleting,
        }}
        secondaryAction={{
          label: '분석 내역 보기',
          icon: 'list',
          onClick: () => {
            sessionStorage.setItem('mypage_active_tab', 'contract');
            navigate('/mypage');
          },
        }}
      />
    );
  }

  return (
    <ContractReport
      contract={contract}
      reportRef={reportRef}
      isPdfAvailable={isPdfAvailable}
      pdfLoading={pdfLoading}
      isRegenerating={isRegenerating}
      isChecklistChecking={isChecklistChecking}
      checkingChecklistItemId={checkingVariables?.checklistItemId}
      onBackToHistory={() => navigate('/mypage')}
      onPdfSave={handlePdfSave}
      onReanalysis={handleReanalysis}
      onToggleChecklistItem={handleToggleChecklistItem}
      onToggleTracking={handleToggleTracking}
      isTrackingUpdating={isTrackingUpdating}
    />
  );
}
