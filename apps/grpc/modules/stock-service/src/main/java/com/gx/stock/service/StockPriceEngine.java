package com.gx.stock.service;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

import org.springframework.stereotype.Service;

import com.gx.common.Ticker;
import com.gx.stock.PriceUpdate;

import io.grpc.stub.ServerCallStreamObserver;
import io.grpc.stub.StreamObserver;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class StockPriceEngine {
    private static final Logger logger = Logger.getLogger(StockPriceEngine.class.getName());

    private final ScheduledExecutorService scheduler;

    private final Map<Ticker, AtomicInteger> currentPrices = new ConcurrentHashMap<>();

    private final Set<ServerCallStreamObserver<PriceUpdate>> subscribers = ConcurrentHashMap.newKeySet();

    public StockPriceEngine() {
        ThreadFactory tf = runnable -> {
            Thread t = new Thread(runnable);
            t.setName("stock-price-engine");
            t.setDaemon(true);
            return t;
        };
        this.scheduler = Executors.newSingleThreadScheduledExecutor(tf);
    }

    @PostConstruct
    void start() {
        // Seed initial prices
        this.currentPrices.put(Ticker.APPLE, new AtomicInteger(150));
        this.currentPrices.put(Ticker.AMAZON, new AtomicInteger(160));
        this.currentPrices.put(Ticker.GOOGLE, new AtomicInteger(140));
        this.currentPrices.put(Ticker.MICROSOFT, new AtomicInteger(180));

        this.scheduler.scheduleAtFixedRate(this::tickAndBroadcast, 0, 2, TimeUnit.SECONDS);
        logger.info("StockPriceEngine started");
    }

    @PreDestroy
    void stop() {
        this.scheduler.shutdownNow();
    }

    public int getCurrentPrice(Ticker ticker) {
        var price = this.currentPrices.get(ticker);
        return price == null ? 100 : price.get();
    }

    public void registerSubscriber(StreamObserver<PriceUpdate> responseObserver) {
        if (!(responseObserver instanceof ServerCallStreamObserver<?> raw)) {
            // Should not happen in server context; keep it safe.
            logger.warning("StreamObserver is not ServerCallStreamObserver; streaming cancellation won't be handled");
            return;
        }

        @SuppressWarnings("unchecked")
        var serverObserver = (ServerCallStreamObserver<PriceUpdate>) raw;

        this.subscribers.add(serverObserver);
        serverObserver.setOnCancelHandler(() -> this.subscribers.remove(serverObserver));

        // Send an initial snapshot so the consumer can warm cache.
        for (Ticker ticker : seededTickers()) {
            if (serverObserver.isCancelled()) {
                this.subscribers.remove(serverObserver);
                return;
            }
            serverObserver.onNext(buildUpdate(ticker, getCurrentPrice(ticker)));
        }
    }

    private void tickAndBroadcast() {
        for (Ticker ticker : seededTickers()) {
            int nextPrice = mutatePrice(this.currentPrices.computeIfAbsent(ticker, t -> new AtomicInteger(100)));
            var update = buildUpdate(ticker, nextPrice);

            this.subscribers.removeIf(obs -> {
                if (obs.isCancelled()) {
                    return true;
                }
                try {
                    obs.onNext(update);
                    return false;
                } catch (Exception e) {
                    logger.warning("Failed to push price update: " + e.getMessage());
                    return true;
                }
            });
        }
    }

    private Iterable<Ticker> seededTickers() {
        // Keep a stable iteration order.
        Map<Ticker, Integer> order = new EnumMap<>(Ticker.class);
        order.put(Ticker.APPLE, 1);
        order.put(Ticker.AMAZON, 2);
        order.put(Ticker.GOOGLE, 3);
        order.put(Ticker.MICROSOFT, 4);
        return order.keySet();
    }

    private int mutatePrice(AtomicInteger current) {
        // Simulate small fluctuation (±5)
        int change = (int) ((Math.random() - 0.5) * 10);
        return current.updateAndGet(p -> Math.max(100, p + change));
    }

    private PriceUpdate buildUpdate(Ticker ticker, int price) {
        return PriceUpdate.newBuilder()
                .setTicker(ticker)
                .setPrice(price)
                .build();
    }
}
