import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractUploadForm from '../../components/contract/ContractUploadForm';
import { Analyzing } from '../../components/common/index.jsx';
import { CONTRACT_ANALYZING_STAGES } from './contractAnalyzingStages.js';

const unwrapContract = (response) => response?.data ?? response ?? {};
const getContractId = (contract) => contract?.contractId ?? contract?.id;
const isFailedContract = (contract) => String(contract?.processingStatus ?? contract?.status ?? '').toUpperCase() === 'FAILED';

export default function ContractPage() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [contractId, setContractId] = useState(null);

  const goContractDetail = (targetContractId) => {
    if (!targetContractId) return;
    navigate(`/contract/${targetContractId}`);
  };

  if (isAnalyzing) {
    // 업로드 응답으로 contractId를 받은 뒤에도 상세 API가 COMPLETED/FAILED가 될 때까지
    // 같은 단계별 로딩 화면을 유지한다.
    return (
      <Analyzing
        stages={CONTRACT_ANALYZING_STAGES}
        contractId={contractId}
        onFinished={() => goContractDetail(contractId)}
        onFailed={() => goContractDetail(contractId)}
      />
    );
  }

  return (
    <ContractUploadForm
      onAnalyzeStart={() => { setContractId(null); setIsAnalyzing(true); }}
      onSuccess={(data) => {
        const contract = unwrapContract(data);
        const nextContractId = getContractId(contract);
        setContractId(nextContractId);

        if (isFailedContract(contract)) {
          goContractDetail(nextContractId);
        }
      }}
      onError={() => setIsAnalyzing(false)}
    />
  );
}
