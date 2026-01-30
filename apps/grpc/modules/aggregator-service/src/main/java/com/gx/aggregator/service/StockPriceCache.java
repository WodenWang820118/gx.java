package com.gx.aggregator.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.gx.common.Ticker;

@Service
public class StockPriceCache {
    private final Map<String, Integer> priceCache = new ConcurrentHashMap<>();

    public void updatePrice(String ticker, Integer price) {
        priceCache.put(ticker, price);
    }

    public Integer getPrice(String ticker) {
        return priceCache.getOrDefault(ticker, 100); // Default price of 100 if not found
    }

    public Integer getPrice(Ticker ticker) {
        return getPrice(ticker.name());
    }
}
