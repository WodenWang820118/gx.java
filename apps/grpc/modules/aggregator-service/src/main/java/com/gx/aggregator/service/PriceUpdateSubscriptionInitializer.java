package com.gx.aggregator.service;

import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.gx.stock.StockServiceGrpc;
import com.google.protobuf.Empty;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import jakarta.annotation.PreDestroy;

@Service
public class PriceUpdateSubscriptionInitializer implements CommandLineRunner {
    private static final Logger logger = Logger.getLogger(PriceUpdateSubscriptionInitializer.class.getName());
    private final PriceUpdateListener priceUpdateListener;
    private final StockServiceGrpc.StockServiceStub stockServiceStub;

    private final AtomicBoolean started = new AtomicBoolean(false);
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);

    private final ScheduledExecutorService scheduler;

    public PriceUpdateSubscriptionInitializer(PriceUpdateListener priceUpdateListener,
            StockServiceGrpc.StockServiceStub stockServiceStub) {
        this.priceUpdateListener = priceUpdateListener;
        this.stockServiceStub = stockServiceStub;

        ThreadFactory tf = runnable -> {
            Thread t = new Thread(runnable);
            t.setName("stock-stream-subscriber");
            t.setDaemon(true);
            return t;
        };
        this.scheduler = Executors.newSingleThreadScheduledExecutor(tf);
    }

    @Override
    public void run(String... args) throws Exception {
        // Subscribe once at startup; errors trigger backoff retry.
        startSubscription();
    }

    @PreDestroy
    void stop() {
        this.scheduler.shutdownNow();
    }

    private void startSubscription() {
        if (!this.started.compareAndSet(false, true)) {
            return;
        }

        subscribeNow();
    }

    private void subscribeNow() {
        logger.info("Subscribing to stock-service price updates (gRPC stream)");
        this.stockServiceStub.getPriceUpdates(Empty.getDefaultInstance(), new StreamObserver<>() {
            @Override
            public void onNext(com.gx.stock.PriceUpdate value) {
                consecutiveFailures.set(0);
                priceUpdateListener.onNext(value);
            }

            @Override
            public void onError(Throwable t) {
                // Keep SSE clients connected; just retry the upstream gRPC stream.
                scheduleRetry(t);
            }

            @Override
            public void onCompleted() {
                // Treat completion like a recoverable disconnect.
                scheduleRetry(null);
            }
        });
    }

    private void scheduleRetry(Throwable t) {
        int failures = consecutiveFailures.incrementAndGet();
        Duration delay = backoffDelay(failures, t);

        String reason = (t == null) ? "stream completed" : (t.getClass().getSimpleName() + ": " + t.getMessage());
        logger.warning("Price update stream ended (" + reason + "). Retrying in " + delay.toMillis() + "ms");

        this.scheduler.schedule(this::subscribeNow, delay.toMillis(), TimeUnit.MILLISECONDS);
    }

    private Duration backoffDelay(int failures, Throwable t) {
        // Quick retry for transient gRPC statuses; otherwise exponential backoff capped
        // at 30s.
        long baseMs = 500;
        long maxMs = 30_000;

        if (t != null) {
            Status status = Status.fromThrowable(t);
            switch (status.getCode()) {
                case UNAVAILABLE, DEADLINE_EXCEEDED, RESOURCE_EXHAUSTED -> baseMs = 500;
                default -> baseMs = 1_000;
            }
        }

        long exp = Math.min(maxMs, baseMs * (1L << Math.min(10, failures - 1)));
        // Add a tiny jitter to avoid thundering herd.
        long jitter = (long) (Math.random() * 250);
        return Duration.ofMillis(Math.min(maxMs, exp + jitter));
    }
}
