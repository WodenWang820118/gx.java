package com.gx.user.exceptions;

public class HoldingNotFoundException extends RuntimeException {
    public HoldingNotFoundException(Integer userId, String ticker) {
        super("Holding not found for user with ID: " + userId + " and ticker: " + ticker);
    }
}
