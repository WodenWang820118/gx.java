package com.gx.aggregator.controller.advice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import io.grpc.Status;
import io.grpc.StatusRuntimeException;

@ControllerAdvice
public class ApplicationExceptionAdviceHandler {

    @ExceptionHandler(StatusRuntimeException.class)
    public ResponseEntity<String> handleStatusRumtimeException(StatusRuntimeException ex) {
        Status status = ex.getStatus();
        String message = status.getDescription();

        return switch (status.getCode()) {
            case INVALID_ARGUMENT, FAILED_PRECONDITION -> ResponseEntity.badRequest().body(message);
            case NOT_FOUND -> ResponseEntity.notFound().build();
            case null, default -> ResponseEntity.internalServerError().body(ex.getMessage());
        };
    }
}
