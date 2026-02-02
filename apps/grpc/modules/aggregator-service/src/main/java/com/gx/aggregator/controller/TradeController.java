package com.gx.aggregator.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gx.aggregator.service.TradeService;
import com.gx.user.StockTradeRequest;
import com.gx.user.StockTradeResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("trade")
@RequiredArgsConstructor
public class TradeController {
    private final TradeService tradeService;

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public StockTradeResponse trade(@RequestBody StockTradeRequest request) {
        return this.tradeService.trade(request);
    }
}
