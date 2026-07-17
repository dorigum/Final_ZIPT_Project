package com.zipt.global.exception;

import com.zipt.global.response.ApiResponse;
import io.sentry.Sentry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ZIPT 커스텀 예외
    @ExceptionHandler(ZiptException.class)
    public ResponseEntity<ApiResponse<Void>> handleZiptException(ZiptException e) {
        log.warn("ZiptException: {}", e.getMessage());
        Sentry.captureException(e);
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ApiResponse.fail(e.getMessage()));
    }

    // 파일 크기 초과
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileSizeExceeded() {
        return ResponseEntity.status(400)
                .body(ApiResponse.fail(ErrorCode.FILE_TOO_LARGE.getMessage()));
    }

    // Validation 실패 (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException e) {
        Sentry.captureException(e);
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(ApiResponse.fail(msg));
    }

    // 인증 없이 접근
//    @ExceptionHandler(AccessDeniedException.class)
//    public ResponseEntity<ApiResponse<Void>> handleAccessDenied() {
//        return ResponseEntity.status(403)
//                .body(ApiResponse.fail(ErrorCode.UNAUTHORIZED.getMessage()));
//    }

    // Security 인증 실패 (로그인 실패 등)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException e) {
        Sentry.captureException(e);
        log.warn("AuthenticationException: {}", e.getMessage());
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getStatus())
                .body(ApiResponse.fail(ErrorCode.UNAUTHORIZED.getMessage()));
    }

    // 그 외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAll(Exception e) {
        Sentry.captureException(e);
        log.error("Unhandled exception", e);
        return ResponseEntity.status(500)
                .body(ApiResponse.fail(ErrorCode.INTERNAL_ERROR.getMessage()));
    }
}