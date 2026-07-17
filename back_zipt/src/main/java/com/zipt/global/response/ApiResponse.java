package com.zipt.global.response;

import lombok.Builder;
import lombok.Getter;

    @Getter
    @Builder
    public class ApiResponse<T> {
        private final boolean success;
        private final String  message;
        private final T       data;

        public static <T> ApiResponse<T> ok(T data) {
            return ApiResponse.<T>builder()
                    .success(true).message("OK").data(data).build();
        }
        public static <T> ApiResponse<T> fail(String message) {
            return ApiResponse.<T>builder()
                    .success(false).message(message).data(null).build();
        }
    }

