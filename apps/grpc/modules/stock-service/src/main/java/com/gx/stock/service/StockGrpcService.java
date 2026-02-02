package com.gx.stock.service;

import org.springframework.grpc.server.service.GrpcService;

import com.gx.common.Ticker;
import com.gx.stock.PriceUpdate;
import com.gx.stock.StockPriceRequest;
import com.gx.stock.StockPriceResponse;
import com.gx.stock.StockServiceGrpc;
import com.google.protobuf.Empty;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;

@GrpcService
@RequiredArgsConstructor
public class StockGrpcService extends StockServiceGrpc.StockServiceImplBase {

    private final StockPriceEngine stockPriceEngine;

    @Override
    public void getStockPrice(StockPriceRequest request, StreamObserver<StockPriceResponse> responseObserver) {
        Ticker ticker = request.getTicker();
        int price = stockPriceEngine.getCurrentPrice(ticker);

        var response = StockPriceResponse.newBuilder()
                .setTicker(ticker)
                .setPrice(price)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getPriceUpdates(Empty request, StreamObserver<PriceUpdate> responseObserver) {
        stockPriceEngine.registerSubscriber(responseObserver);
        // Keep stream open; client cancellation is handled in StockPriceEngine.
    }
}
