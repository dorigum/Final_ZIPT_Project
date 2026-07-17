package com.zipt.domain.contract.service;

import com.zipt.domain.contract.entity.ContractProcessingStatus;
import com.zipt.domain.contract.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContractProcessingStatusService {

    private final ContractRepository contractRepository;
    private final ContractProcessingNotifier contractProcessingNotifier;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStatus(Long contractId, Long memberId, ContractProcessingStatus status, String errorMessage) {
        contractRepository.findByIdAndMemberId(contractId, memberId).ifPresent(contract -> {
            contract.updateProcessingStatus(status, errorMessage);
            contractRepository.save(contract);
            try {
                contractProcessingNotifier.publish(contract.getId(), status, errorMessage);
            } catch (Exception e) {
                log.debug("SSE publish failed. contractId={}, status={}", contract.getId(), status, e);
            }
        });
    }
}
