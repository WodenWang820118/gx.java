package com.gx.aggregator.service;

import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.gx.aggregator.controller.dto.PriceUpdateDto;
import com.gx.stock.StockServiceGrpc;
import com.google.protobuf.Empty;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PriceUpdateSubscriptionInitializer implements CommandLineRunner {
    private static final Logger logger = Logger.getLogger(PriceUpdateSubscriptionInitializer.class.getName());
    private final PriceUpdateListener priceUpdateListener;
    private final ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);

    @Override
    public void run(String... args) throws Exception {
        // Start mock price updates since stock-service doesn't exist yet
        startMockPriceUpdates();
    }

    private void startMockPriceUpdates() {
        String[] tickers = { "APPLE", "AMAZON", "GOOGLE", "MICROSOFT" };
        int[] prices = { 150, 160, 140, 180 };

        executorService.scheduleAtFixedRate(() -> {
            for (int i = 0; i < tickers.length; i++) {
                // Simulate price fluctuation (±5%)
                int change = (int) ((Math.random() - 0.5) * 10);
                prices[i] = Math.max(100, prices[i] + change);

                PriceUpdateDto dto = PriceUpdateDto.builder()
                        .ticker(tickers[i])
                        .price(prices[i])
                        .build();

                try {
                    priceUpdateListener.sendPriceUpdate(dto);
                } catch (Exception e) {
                    logger.warning("Failed to send price update: " + e.getMessage());
                }
            }
        }, 0, 2, TimeUnit.SECONDS);

        logger.info("Mock price updates started");
    }
}
