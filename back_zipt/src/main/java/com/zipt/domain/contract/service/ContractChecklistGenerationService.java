package com.zipt.domain.contract.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.contract.dto.ChecklistGenerationResponse;
import com.zipt.domain.contract.entity.Contract;
import com.zipt.domain.contract.entity.ContractChecklistItem;
import com.zipt.domain.contract.entity.ContractSpecialTerm;
import com.zipt.domain.contract.mapper.ContractChecklistMapper;
import com.zipt.domain.contract.util.PromptResourceLoader;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContractChecklistGenerationService {

    private final ContractChecklistMapper contractChecklistMapper;
    private final ObjectMapper objectMapper;
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final String checklistSystemPrompt;
    private final String checklistUserPrompt;

    public ContractChecklistGenerationService(
            ContractChecklistMapper contractChecklistMapper,
            ObjectMapper objectMapper,
            ChatClient.Builder builder,
            VectorStore vectorStore,
            PromptResourceLoader promptResourceLoader,
            @Value("classpath:prompts/lease-contract-checklist/lease-contract-checklist-system.txt") Resource checklistSystemPromptResource,
            @Value("classpath:prompts/lease-contract-checklist/lease-contract-checklist-user.txt") Resource checklistUserPromptResource
    ) {
        this.contractChecklistMapper = contractChecklistMapper;
        this.objectMapper = objectMapper;
        this.chatClient = builder.build();
        this.vectorStore = vectorStore;
        this.checklistSystemPrompt = promptResourceLoader.load(checklistSystemPromptResource);
        this.checklistUserPrompt = promptResourceLoader.load(checklistUserPromptResource);
    }

    public List<ContractChecklistItem> generateChecklistItems(Contract contract) {
        String searchQuery = buildSearchQuery(contract);
        List<Document> ragDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(searchQuery)
                        .topK(3)
                        .build()
        );

        log.debug("Contract checklist RAG sources: {}",
                ragDocs.stream().map(doc -> doc.getMetadata().get("source")).toList());

        String ragContext = ragDocs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n---\n\n"));

        ChecklistGenerationResponse response = chatClient.prompt()
                .system(checklistSystemPrompt)
                .user(u -> u.text(checklistUserPrompt)
                        .param("contractJson", toContractJson(contract))
                        .param("ocrText", contract.getDocument().getExtractedText())
                        .param("ragContext", ragContext)
                )
                .call()
                .entity(ChecklistGenerationResponse.class);

        return contractChecklistMapper.toEntities(response);
    }

    private String buildSearchQuery(Contract contract) {
        StringBuilder query = new StringBuilder("주택임대차 계약 리스트 확인사항");
        if (contract.getContractType() != null) {
            query.append(contract.getContractType().name()).append(" ");
        }
        if (contract.getUnpaidTaxStatus() != null) {
            query.append("미납국세 ").append(contract.getUnpaidTaxStatus().name()).append(" ");
        }
        if (contract.getPriorityFixedDateStatus() != null) {
            query.append("선순위확정일자 ").append(contract.getPriorityFixedDateStatus().name()).append(" ");
        }
        if (contract.getSpecialTerms() != null && !contract.getSpecialTerms().isEmpty()) {
            query.append("특약사항 확인");
        }
        return query.toString().trim();
    }

    private String toContractJson(Contract contract) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", contract.getId());
        payload.put("memberId", contract.getMember().getId());
        payload.put("contractType", contract.getContractType());
        payload.put("contractKind", contract.getContractKind());
        payload.put("propertyAddress", contract.getPropertyAddress());
        payload.put("buildingStructure", contract.getBuildingStructure());
        payload.put("buildingPurpose", contract.getBuildingPurpose());
        payload.put("leasedPart", contract.getLeasedPart());
        payload.put("depositAmount", contract.getDepositAmount());
        payload.put("contractAmount", contract.getContractAmount());
        payload.put("intermediateAmount", contract.getIntermediateAmount());
        payload.put("intermediatePaymentDate", contract.getIntermediatePaymentDate());
        payload.put("balanceAmount", contract.getBalanceAmount());
        payload.put("balancePaymentDate", contract.getBalancePaymentDate());
        payload.put("monthlyRent", contract.getMonthlyRent());
        payload.put("monthlyRentPaymentDay", contract.getMonthlyRentPaymentDay());
        payload.put("maintenanceFeeType", contract.getMaintenanceFeeType());
        payload.put("maintenanceFeeAmount", contract.getMaintenanceFeeAmount());
        payload.put("maintenanceFeeCalculationMethod", contract.getMaintenanceFeeCalculationMethod());
        payload.put("deliveryDate", contract.getDeliveryDate());
        payload.put("endDate", contract.getEndDate());
        payload.put("unpaidTaxStatus", contract.getUnpaidTaxStatus());
        payload.put("unpaidTaxDescription", contract.getUnpaidTaxDescription());
        payload.put("priorityFixedDateStatus", contract.getPriorityFixedDateStatus());
        payload.put("priorityFixedDateDescription", contract.getPriorityFixedDateDescription());
        payload.put("repairNeededStatus", contract.getRepairNeededStatus());
        payload.put("repairContent", contract.getRepairContent());
        payload.put("repairCompletionDate", contract.getRepairCompletionDate());
        payload.put("repairDefaultHandling", contract.getRepairDefaultHandling());
        payload.put("extractionConfidence", contract.getExtractionConfidence());
        payload.put("extractionWarnings", contract.getExtractionWarnings());
        payload.put("missingFields", contract.getMissingFields());
        payload.put("specialTerms", toSpecialTermsPayload(contract));

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize contract for checklist prompt", e);
        }
    }

    private Map<String, Object> toSpecialTermPayload(ContractSpecialTerm specialTerm) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("content", specialTerm.getContent());
        payload.put("termType", specialTerm.getTermType());
        payload.put("tenantProtective", specialTerm.getTenantProtective());
        payload.put("needsReview", specialTerm.getNeedsReview());
        payload.put("displayOrder", specialTerm.getDisplayOrder());
        return payload;
    }

    private List<Map<String, Object>> toSpecialTermsPayload(Contract contract) {
        if (contract.getSpecialTerms() == null || !Hibernate.isInitialized(contract.getSpecialTerms())) {
            return List.of();
        }

        return contract.getSpecialTerms().stream()
                .map(this::toSpecialTermPayload)
                .toList();
    }
}
