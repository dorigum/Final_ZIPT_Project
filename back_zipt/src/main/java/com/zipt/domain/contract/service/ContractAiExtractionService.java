package com.zipt.domain.contract.service;

import com.zipt.domain.contract.dto.ContractExtractionResponse;
import com.zipt.domain.contract.dto.ContractDocumentClassificationResponse;
import com.zipt.domain.contract.dto.ContractVisionExtractionResponse;
import com.zipt.domain.contract.util.PromptResourceLoader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.content.Media;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class ContractAiExtractionService {

    private final ChatClient chatClient;
    private final String extractionSystemPrompt;
    private final String extractionUserPrompt;
    private final String classificationSystemPrompt;
    private final String classificationUserPrompt;
    private final String visionSystemPrompt;
    private final String visionUserPrompt;

    public ContractAiExtractionService(
            ChatClient.Builder builder,
            PromptResourceLoader promptResourceLoader,
            @Value("classpath:prompts/lease-contract-extraction/lease-contract-extraction-system.txt") Resource systemPromptResource,
            @Value("classpath:prompts/lease-contract-extraction/lease-contract-extraction-user.txt") Resource userPromptResource,
            @Value("classpath:prompts/lease-contract-classification/lease-contract-classification-system.txt") Resource classificationSystemPromptResource,
            @Value("classpath:prompts/lease-contract-classification/lease-contract-classification-user.txt") Resource classificationUserPromptResource,
            @Value("classpath:prompts/lease-contract-vision/lease-contract-vision-system.txt") Resource visionSystemPromptResource,
            @Value("classpath:prompts/lease-contract-vision/lease-contract-vision-user.txt") Resource visionUserPromptResource
    ) {
        this.chatClient = builder.build();
        this.extractionSystemPrompt = promptResourceLoader.load(systemPromptResource);
        this.extractionUserPrompt = promptResourceLoader.load(userPromptResource);
        this.classificationSystemPrompt = promptResourceLoader.load(classificationSystemPromptResource);
        this.classificationUserPrompt = promptResourceLoader.load(classificationUserPromptResource);
        this.visionSystemPrompt = promptResourceLoader.load(visionSystemPromptResource);
        this.visionUserPrompt = promptResourceLoader.load(visionUserPromptResource);
    }

    public ContractDocumentClassificationResponse classifyDocument(String ocrText) {
        return chatClient.prompt()
                .system(classificationSystemPrompt)
                .user(u -> u.text(classificationUserPrompt)
                        .param("ocrText", ocrText != null ? ocrText : ""))
                .call()
                .entity(ContractDocumentClassificationResponse.class);
    }

    public ContractExtractionResponse extractContractResponse(String ocrText, String visionJson) {
        return chatClient.prompt()
                .system(extractionSystemPrompt)
                .user(u -> u.text(extractionUserPrompt)
                        .param("ocrText", ocrText)
                        .param("visionJson", visionJson != null ? visionJson : "{}"))
                .call()
                .entity(ContractExtractionResponse.class);
    }

    public ContractVisionExtractionResponse extractVision(List<MultipartFile> contractFiles) {
        try {
            List<Media> media = toCheckboxMedia(contractFiles);
            if (media.isEmpty()) {
                return null;
            }

            return chatClient.prompt()
                    .system(visionSystemPrompt)
                    .user(u -> u.text(visionUserPrompt)
                            .media(media.toArray(Media[]::new)))
                    .call()
                    .entity(ContractVisionExtractionResponse.class);
        } catch (Exception e) {
            log.warn("Vision extraction failed. Falling back to OCR-only extraction.", e);
            return null;
        }
    }

    private List<Media> toCheckboxMedia(List<MultipartFile> contractFiles) {
        List<Media> media = new ArrayList<>();
        if (contractFiles == null) {
            return media;
        }

        for (int index = 0; index < contractFiles.size(); index++) {
            MultipartFile file = contractFiles.get(index);
            MimeType mimeType = toMediaMimeType(file);
            if (mimeType == null) {
                continue;
            }

            try {
                media.add(Media.builder()
                        .mimeType(mimeType)
                        .data(new ByteArrayResource(file.getBytes()))
                        .name("contract-page-" + (index + 1))
                        .build());
            } catch (IOException e) {
                log.warn("Failed to read contract file for vision extraction. file={}", file.getOriginalFilename(), e);
            }
        }

        return media;
    }

    private MimeType toMediaMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            String normalized = contentType.toLowerCase();
            switch (normalized) {
                case "image/jpeg", "image/jpg" -> {
                    return Media.Format.IMAGE_JPEG;
                }
                case "image/png" -> {
                    return Media.Format.IMAGE_PNG;
                }
                case "image/webp" -> {
                    return Media.Format.IMAGE_WEBP;
                }
                case "application/pdf" -> {
                    return Media.Format.DOC_PDF;
                }
            }
        }

        String name = file.getOriginalFilename();
        if (name == null || !name.contains(".")) {
            return null;
        }

        String extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> Media.Format.IMAGE_JPEG;
            case "png" -> Media.Format.IMAGE_PNG;
            case "webp" -> Media.Format.IMAGE_WEBP;
            case "pdf" -> Media.Format.DOC_PDF;
            default -> null;
        };
    }
}
