package com.zipt.domain.rag.service;

import com.zipt.domain.rag.dto.RagEmbedResponse;
import com.zipt.global.ocr.OcrTextExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagService {
    private final VectorStore vectorStore;
    private final OcrTextExtractionService ocrTextExtractionService;

    // 청크 하나의 최대 토큰 수
    private static final int CHUNK_SIZE = 500;
    // 청크 간 겹치는 토큰 수
    private static final int CHUNK_OVERLAP = 200;

    public RagEmbedResponse embed(List<MultipartFile> files) {
        int totalChunks = 0;
        for(MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            log.info("RAG 문서 임베딩 시작: {}", fileName);

            // OCR로 텍스트 추출
            String text = ocrTextExtractionService.extractText(file);

            log.info("OCR 결과 (앞 200자): {}", text.length() > 200 ? text.substring(0, 200) : text);

            // 추출된 텍스트를 청크 단위로 분할
            TokenTextSplitter splitter =
                    new TokenTextSplitter(
                            CHUNK_SIZE,
                            CHUNK_OVERLAP,
                            10,
                            10000,
                            true,
                            List.of('.', '。', '!', '?', '\n', ')', ']'));
            List<Document> chunks = splitter.split(
                    List.of(new Document(text, Map.of("source", fileName)))
            ).stream()
             .map(chunk -> new Document(chunk.getText(), Map.of("source", fileName)))
             .toList();
            log.info("청크 텍스트: {}", chunks.get(0).getText());

            // 청크별로 Titan 임베딩 후 PostgreSQL vector_store 테이블에 저장
            vectorStore.add(chunks);
            totalChunks += chunks.size();
            log.info("RAG 문서 임베딩 완료: {} -> {}개 청크", fileName, chunks.size());

        }

        return new RagEmbedResponse(files.size(), totalChunks, "임베딩 완료");
    }

}
