package com.zipt.global.exception;

import lombok.Getter;

@Getter
public class ZiptException extends RuntimeException {
    private final ErrorCode errorCode;

    public ZiptException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}