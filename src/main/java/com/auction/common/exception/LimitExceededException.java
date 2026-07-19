package com.auction.common.exception;

public class LimitExceededException extends BusinessException {
    public LimitExceededException(String message) { super(message); }
}
