package com.gx.user.service.advice;

import org.springframework.stereotype.Component;
import org.springframework.grpc.server.GlobalServerInterceptor;

import com.gx.user.exceptions.InsufficientBalanceException;
import com.gx.user.exceptions.InsufficientHoldingsException;
import com.gx.user.exceptions.HoldingNotFoundException;
import com.gx.user.exceptions.UnkownTickerException;
import com.gx.user.exceptions.UnkownUserException;

import io.grpc.ForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;

@Component
@GlobalServerInterceptor
public class GrpcExceptionAdviceHandler implements ServerInterceptor {

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call, Metadata headers, ServerCallHandler<ReqT, RespT> next) {

        ServerCall.Listener<ReqT> listener = next.startCall(call, headers);
        return new ForwardingServerCallListener.SimpleForwardingServerCallListener<>(listener) {
            @Override
            public void onHalfClose() {
                try {
                    super.onHalfClose();
                } catch (Exception ex) {
                    handleException(call, ex);
                }
            }

            @Override
            public void onMessage(ReqT message) {
                try {
                    super.onMessage(message);
                } catch (Exception ex) {
                    handleException(call, ex);
                }
            }

            @Override
            public void onReady() {
                try {
                    super.onReady();
                } catch (Exception ex) {
                    handleException(call, ex);
                }
            }
        };
    }

    private void handleException(ServerCall<?, ?> call, Exception ex) {
        Status status;

        if (ex instanceof IllegalArgumentException) {
            status = Status.INVALID_ARGUMENT.withDescription(ex.getMessage());
        } else if (ex instanceof UnkownUserException) {
            status = Status.NOT_FOUND.withDescription(ex.getMessage());
        } else if (ex instanceof UnkownTickerException) {
            status = Status.NOT_FOUND.withDescription(ex.getMessage());
        } else if (ex instanceof HoldingNotFoundException) {
            status = Status.NOT_FOUND.withDescription(ex.getMessage());
        } else if (ex instanceof InsufficientHoldingsException) {
            status = Status.FAILED_PRECONDITION.withDescription(ex.getMessage());
        } else if (ex instanceof InsufficientBalanceException) {
            status = Status.FAILED_PRECONDITION.withDescription(ex.getMessage());
        } else {
            status = Status.INTERNAL.withDescription("Error: " + ex.getMessage());
        }

        call.close(status, new Metadata());
    }

}
