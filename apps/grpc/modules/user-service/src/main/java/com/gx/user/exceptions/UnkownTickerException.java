package com.gx.user.exceptions;

public class UnkownTickerException extends RuntimeException {
    private static final String MESSAGE = "Ticker %s not found in user's portfolio.";

    public UnkownTickerException(String ticker) {
        super(String.format(MESSAGE, ticker));
    }

}
