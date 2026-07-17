package com.zipt.global.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client    s3Client;
    private final S3Presigner s3Presigner;

    @Value("${cloud.aws.s3.bucket-files}")
    private String bucket;

    /**
     * 파일 업로드
     * @param bytes       파일 바이트
     * @param key         S3 저장 경로 (예: pdf/1_report.pdf)
     * @param contentType 파일 타입 (예: application/pdf)
     */
    public void upload(byte[] bytes, String key, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .contentLength((long) bytes.length)
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(bytes));
        log.info("S3 업로드 완료 — bucket: {} key: {}", bucket, key);
    }

    /**
     * 파일 다운로드 스트림 조회
     * @param key S3 저장 경로
     * @return 파일 입력 스트림
     */
    public InputStream download(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        return s3Client.getObject(request);
    }

    /**
     * presigned URL 생성 (다운로드용 임시 URL)
     * @param key      S3 저장 경로
     * @param duration URL 유효 시간
     * @return presigned URL
     */
    public String generatePresignedUrl(String key, Duration duration) {
        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(p -> p
                .signatureDuration(duration)
                .getObjectRequest(g -> g
                        .bucket(bucket)
                        .key(key)
                )
        );
        return presigned.url().toString();
    }

    /**
     * 파일 삭제
     * @param key S3 저장 경로
     */
    public void delete(String key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
        log.info("S3 삭제 완료 — key: {}", key);
    }
}