package com.gx.aggregator.service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.gx.aggregator.controller.dto.PriceUpdateDto;
import com.gx.stock.PriceUpdate;

import io.grpc.stub.StreamObserver;

@Service
public class PriceUpdateListener implements StreamObserver<PriceUpdate> {

    private static final Logger logger = Logger.getLogger(PriceUpdateListener.class.getName());
    private final Set<SseEmitter> emitters = Collections.synchronizedSet(new HashSet<>());
    private final StockPriceCache priceCache;

    @Value("${sse.timeout:300000}")
    private long sseTimeout;

    public PriceUpdateListener(StockPriceCache priceCache) {
        this.priceCache = priceCache;
    }

    public SseEmitter createEmitter() {
        var emitter = new SseEmitter(this.sseTimeout);
        this.emitters.add(emitter);
        // emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        emitter.onError(e -> this.emitters.remove(emitter));
        return emitter;
    }

    @Override
    public void onNext(PriceUpdate value) {
        var dto = PriceUpdateDto.builder()
                .ticker(String.valueOf(value.getTicker()))
                .price(value.getPrice())
                .build();
        // Update the price cache
        this.priceCache.updatePrice(String.valueOf(value.getTicker()), value.getPrice());
        this.emitters.removeIf(emitter -> !send(emitter, dto));
    }

    @Override
    public void onError(Throwable t) {
        logger.severe("streaming error: " + t.getMessage());
        this.emitters.forEach(e -> e.completeWithError(t));
        this.emitters.clear();
    }

    @Override
    public void onCompleted() {
        // Handle stream completion
    }

    public void sendPriceUpdate(PriceUpdateDto dto) {
        // Update the price cache
        this.priceCache.updatePrice(dto.getTicker(), dto.getPrice());
        this.emitters.removeIf(emitter -> !send(emitter, dto));
    }

    private boolean send(SseEmitter emitter, PriceUpdateDto dto) {
        try {
            emitter.send(dto);
            return true;
        } catch (Exception e) {
            logger.warning("Failed to send SSE: " + e.getMessage());
            return false;
        }
    }

}
