package com.gx.user.util;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gx.common.Ticker;
import com.gx.user.Holding;
import com.gx.user.StockTradeRequest;
import com.gx.user.StockTradeResponse;
import com.gx.user.entity.PortfolioItem;
import com.gx.user.entity.User;
import com.gx.user.UserInformation;

@Service
public class EntityMapper {
    public UserInformation toUserInformation(User user, List<PortfolioItem> portfolioItems) {
        var holdings = portfolioItems.stream()
                .map(item -> Holding.newBuilder()
                        .setTicker(Ticker.valueOf(item.getTicker()))
                        .setQuantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());
        // Assuming UserInformation has a builder and a method to set holdings
        return UserInformation.newBuilder()
                .setUserId(user.getId())
                .setName(user.getName())
                .setBalance(user.getBalance())
                .addAllHoldings(holdings)
                .build();
    }

    public PortfolioItem toPortfolioItem(StockTradeRequest request) {
        return PortfolioItem.builder()
                .userId(request.getUserId())
                .ticker(request.getTicker().name())
                .quantity(request.getQuantity())
                .build();
    }

    public StockTradeResponse toStockTradeResponse(StockTradeRequest request, int newBalance) {
        return StockTradeResponse.newBuilder()
                .setUserId(request.getUserId())
                .setTicker(request.getTicker())
                .setQuantity(request.getQuantity())
                .setPrice(request.getPrice())
                .setTotalPrice(request.getPrice() * request.getQuantity())
                .setBalance(newBalance)
                .setAction(request.getAction())
                .build();
    }
}
