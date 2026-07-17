package com.zipt.global.ocr;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.global.exception.ErrorCode;
import com.zipt.global.exception.ZiptException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Base64;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrTextExtractionService {
    // 혜진님이 작성하셨던 OcrService에서 Naver CLOVA OCR API를 호출하는 부분만 공통 기능으로 분리
    private static final Set<String> SUPPORTED_FORMATS = Set.of("jpg", "jpeg", "png", "pdf");

    @Value("${clova.ocr.url:}")
    private String ocrUrl;

    @Value("${clova.ocr.secret:}")
    private String ocrSecret;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public String extractText(MultipartFile file) {
        return extractText(List.of(file));
    }

    public String extractText(List<MultipartFile> files) {
        if (ocrUrl == null || ocrUrl.isBlank()) {
            throw new ZiptException(ErrorCode.OCR_CONFIG_MISSING);
        }

        if (ocrSecret == null || ocrSecret.isBlank()) {
            throw new ZiptException(ErrorCode.OCR_CONFIG_MISSING);
        }

        if (files == null || files.isEmpty() || files.stream().anyMatch(MultipartFile::isEmpty)) {
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }

        try {
            StringBuilder text = new StringBuilder();
            for (int index = 0; index < files.size(); index++) {
                text.append(requestOcr(files.get(index), index)).append(" ");
            }
            return text.toString().trim();
        } catch (ZiptException e) {
            throw e;
        } catch (WebClientResponseException e) {
            log.error("OCR request rejected. status={}, response={}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ZiptException(ErrorCode.OCR_FAILED);
        } catch (Exception e) {
            log.error("OCR failed", e);
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }
    }

    private String requestOcr(MultipartFile file, int index) throws Exception {
        Map<String, Object> body = Map.of(
                "version", "V2",
                "requestId", "ocr-" + System.currentTimeMillis() + "-" + (index + 1),
                "timestamp", System.currentTimeMillis(),
                "images", List.of(toOcrImage(file, index))
        );

        String response = webClient.post()
                .uri(ocrUrl)
                .header("X-OCR-SECRET", ocrSecret)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return parseOcrText(response);
    }

    private Map<String, Object> toOcrImage(MultipartFile file, int index) {
        try {
            return Map.of(
                    "format", getExtension(file),
                    "name", "document-" + (index + 1),
                    "data", Base64.getEncoder().encodeToString(file.getBytes())
            );
        } catch (ZiptException e) {
            throw e;
        } catch (Exception e) {
            throw new ZiptException(ErrorCode.OCR_FAILED);
        }
    }

    private String parseOcrText(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        StringBuilder sb = new StringBuilder();
        // OCR 응답 -> String 변환 로직 수정 - 260703 이정건
//        root.path("images").forEach(img ->
//                img.path("fields").forEach(f ->
//                        sb.append(f.path("inferText").asText()).append(" ")
//                )
//        );
        root.path("images").forEach(img -> {
            String layoutText = toLayoutAwareText(img.path("fields"));
            if (!layoutText.isBlank()) {
                sb.append(layoutText).append("\n\n");
            }
        });
        return sb.toString().trim();
    }

    private String toLayoutAwareText(JsonNode fieldsNode) {
        List<OcrField> fields = new ArrayList<>();

        fieldsNode.forEach(fieldNode -> {
            String text = fieldNode.path("inferText").asText("").trim();
            if (text.isBlank()) {
                return;
            }

            OcrField field = toOcrField(text, fieldNode);
            if (field != null) {
                fields.add(field);
            }
        });

        if (fields.isEmpty()) {
            return toPlainText(fieldsNode);
        }

        fields.sort(Comparator
                .comparingDouble(OcrField::centerY)
                .thenComparingDouble(OcrField::minX));

        double averageHeight = fields.stream()
                .mapToDouble(OcrField::height)
                .average()
                .orElse(16.0);
        double lineThreshold = Math.max(10.0, averageHeight * 0.65);

        List<List<OcrField>> lines = new ArrayList<>();
        for (OcrField field : fields) {
            List<OcrField> line = findNearestLine(lines, field, lineThreshold);
            if (line == null) {
                line = new ArrayList<>();
                lines.add(line);
            }
            line.add(field);
        }

        StringBuilder text = new StringBuilder();
        for (List<OcrField> line : lines) {
            line.sort(Comparator.comparingDouble(OcrField::minX));
            appendLine(text, line);
        }

        return text.toString().trim();
    }

    private OcrField toOcrField(String text, JsonNode fieldNode) {
        JsonNode vertices = fieldNode.path("boundingPoly").path("vertices");
        if (!vertices.isArray() || vertices.isEmpty()) {
            return null;
        }

        double minX = Double.MAX_VALUE;
        double minY = Double.MAX_VALUE;
        double maxX = Double.MIN_VALUE;
        double maxY = Double.MIN_VALUE;

        for (JsonNode vertex : vertices) {
            double x = vertex.path("x").asDouble(Double.NaN);
            double y = vertex.path("y").asDouble(Double.NaN);
            if (Double.isNaN(x) || Double.isNaN(y)) {
                continue;
            }
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }

        if (minX == Double.MAX_VALUE || minY == Double.MAX_VALUE) {
            return null;
        }

        return new OcrField(text, minX, minY, maxX, maxY);
    }

    private List<OcrField> findNearestLine(List<List<OcrField>> lines, OcrField field, double threshold) {
        List<OcrField> nearestLine = null;
        double nearestDistance = Double.MAX_VALUE;

        for (List<OcrField> line : lines) {
            double lineCenterY = line.stream()
                    .mapToDouble(OcrField::centerY)
                    .average()
                    .orElse(field.centerY());
            double distance = Math.abs(lineCenterY - field.centerY());
            if (distance <= threshold && distance < nearestDistance) {
                nearestLine = line;
                nearestDistance = distance;
            }
        }

        return nearestLine;
    }

    private void appendLine(StringBuilder text, List<OcrField> line) {
        if (line.isEmpty()) {
            return;
        }

        double averageWidth = line.stream()
                .mapToDouble(OcrField::width)
                .average()
                .orElse(24.0);
        double columnGapThreshold = Math.max(36.0, averageWidth * 1.8);

        OcrField previous = null;
        for (OcrField field : line) {
            if (previous != null) {
                double gap = field.minX() - previous.maxX();
                text.append(gap >= columnGapThreshold ? " | " : " ");
            }
            text.append(field.text());
            previous = field;
        }
        text.append("\n");
    }

    private String toPlainText(JsonNode fieldsNode) {
        StringBuilder sb = new StringBuilder();
        fieldsNode.forEach(f -> sb.append(f.path("inferText").asText()).append(" "));
        return sb.toString().trim();
    }

    private record OcrField(
            String text,
            double minX,
            double minY,
            double maxX,
            double maxY
    ) {
        double centerX() {
            return (minX + maxX) / 2.0;
        }

        double centerY() {
            return (minY + maxY) / 2.0;
        }

        double width() {
            return Math.max(1.0, maxX - minX);
        }

        double height() {
            return Math.max(1.0, maxY - minY);
        }
    }

    private String getExtension(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) {
            String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (SUPPORTED_FORMATS.contains(ext)) {
                return ext;
            }
        }

        String contentType = file.getContentType();
        if (contentType != null) {
            String ext = switch (contentType.toLowerCase(Locale.ROOT)) {
                case "image/jpeg" -> "jpg";
                case "image/png" -> "png";
                case "application/pdf" -> "pdf";
                default -> null;
            };
            if (ext != null) {
                return ext;
            }
        }

        throw new ZiptException(ErrorCode.UNSUPPORTED_FILE);
    }
}
