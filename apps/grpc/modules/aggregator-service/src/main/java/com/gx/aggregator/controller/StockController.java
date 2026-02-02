package com.gx.aggregator.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.gx.aggregator.service.PriceUpdateListener;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("stock")
@RequiredArgsConstructor
public class StockController {

    private final PriceUpdateListener priceUpdateListener;

    @GetMapping(value = "updates", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter priceUpdates() {
        return this.priceUpdateListener.createEmitter();
    }

}
