package com.gx.aggregator.service;

import org.springframework.stereotype.Service;

import com.gx.user.StockTradeRequest;
import com.gx.user.StockTradeResponse;
import com.gx.user.UserServiceGrpc;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TradeService {
    private final UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;
    private final StockPriceCache priceCache;

    public StockTradeResponse trade(StockTradeRequest request) {
        // Get price from cache instead of calling stock-service
        var currentPrice = this.priceCache.getPrice(request.getTicker());
        var tradeRequest = request.toBuilder()
                .setPrice(currentPrice)
                .build();
        return this.userServiceBlockingStub.tradeStock(tradeRequest);
    }
}
