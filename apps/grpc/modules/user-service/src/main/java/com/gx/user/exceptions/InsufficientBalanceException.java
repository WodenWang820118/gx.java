package com.gx.user.exceptions;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(Integer userId) {
        super("Insufficient balance for user with ID: " + userId);
    }

}
