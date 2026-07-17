package com.zipt.domain.rag.dto;

public record RagEmbedResponse (
        int totalFiles, // 처리한 파일 수
        int totalChunks, // 생성된 청크(문서 조각) 수
        String message
) { }
