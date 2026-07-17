package com.zipt.domain.analysis.service;

import com.zipt.domain.analysis.dto.RegistryData;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import com.zipt.global.ocr.OcrTextExtractionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OcrServiceTest {

    private OcrTextExtractionService ocrTextExtractionService;
    private OcrService ocrService;
    private MockMultipartFile file;

    @BeforeEach
    void setUp() {
        ocrTextExtractionService = mock(OcrTextExtractionService.class);
        ocrService = new OcrService(ocrTextExtractionService);
        file = new MockMultipartFile("registryImage", "registry.png", "image/png", "test".getBytes());
    }

    @Test
    void rejectsRealEstateGuideTextWithoutRegistryDocumentStructure() {
        String guideText = """
                부동산 계약 가이드
                등기부등본은 표제부, 갑구, 을구를 확인해야 합니다.
                서울특별시 강남구 역삼동 123번지 101호 계약 전 체크리스트입니다.
                """;
        when(ocrTextExtractionService.extractText(file)).thenReturn(guideText);

        assertThatThrownBy(() -> ocrService.extract(file))
                .isInstanceOf(ZiptException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_REGISTRY_DOCUMENT);
    }

    @Test
    void acceptsTextWithRegistryDocumentStructure() {
        String registryText = """
                등기사항전부증명서
                표제부
                부동산의 표시
                서울특별시 강남구 역삼동 123번지 101호
                갑구
                소유자 홍길동
                을구
                채권최고액 금 100,000,000 원
                """;
        when(ocrTextExtractionService.extractText(file)).thenReturn(registryText);

        RegistryData result = ocrService.extract(file);

        assertThat(result.getAddress()).contains("서울특별시 강남구 역삼동 123번지 101호");
        assertThat(result.getOwnerName()).isEqualTo("홍길동");
        assertThat(result.getTotalPriorityAmount()).isEqualTo(100_000_000L);
    }
}
