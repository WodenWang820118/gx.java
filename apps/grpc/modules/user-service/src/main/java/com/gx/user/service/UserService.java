package com.gx.user.service;

import org.springframework.grpc.server.service.GrpcService;
import com.gx.user.UserServiceGrpc;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;

import com.gx.user.UserInformationRequest;
import com.gx.user.UserInformation;
import com.gx.user.StockTradeRequest;
import com.gx.user.StockTradeResponse;
import com.gx.user.TradeAction;

@GrpcService
@RequiredArgsConstructor
public class UserService extends UserServiceGrpc.UserServiceImplBase {
    private final UserInformationRequestHandler userInformationRequestHandler;
    private final StockTradeRequestHandler stockTradeRequestHandler;

    @Override
    public void getUserInformation(UserInformationRequest request, StreamObserver<UserInformation> responseObserver) {
        var response = userInformationRequestHandler.getUserInformation(request);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void tradeStock(StockTradeRequest request, StreamObserver<StockTradeResponse> responseObserver) {
        var response = switch (request.getAction()) {
            case BUY -> stockTradeRequestHandler.buyStock(request);
            case SELL -> stockTradeRequestHandler.sellStock(request);
            case UNRECOGNIZED ->
                throw new IllegalArgumentException("Unrecognized trade action: " + request.getAction());
        };
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
