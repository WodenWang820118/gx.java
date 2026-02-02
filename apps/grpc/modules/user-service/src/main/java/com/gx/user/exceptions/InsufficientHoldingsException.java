package com.gx.user.exceptions;

public class InsufficientHoldingsException extends RuntimeException {
    public InsufficientHoldingsException(Integer userId, String ticker) {
        super("Insufficient holdings for user with ID: " + userId + " and ticker: " + ticker);
    }
}
