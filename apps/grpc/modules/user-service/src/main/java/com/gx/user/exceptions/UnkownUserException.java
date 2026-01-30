package com.gx.user.exceptions;

public class UnkownUserException extends RuntimeException {
    private static final String MESSAGE = "User with id %d not found.";

    public UnkownUserException(Integer userId) {
        super(String.format(MESSAGE, userId));
    }

}
