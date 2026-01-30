package com.gx.user.service;

import org.springframework.stereotype.Service;

import com.gx.common.Ticker;
import com.gx.user.StockTradeRequest;
import com.gx.user.StockTradeResponse;
import com.gx.user.exceptions.InsufficientBalanceException;
import com.gx.user.exceptions.UnkownTickerException;
import com.gx.user.exceptions.UnkownUserException;
import com.gx.user.repository.PortfolioItemRepository;
import com.gx.user.repository.UserRepository;
import com.gx.user.util.EntityMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockTradeRequestHandler {
    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final EntityMapper entityMapper;

    @Transactional
    public StockTradeResponse buyStock(StockTradeRequest request) {
        this.validateTickerInPortfolio(request.getTicker());
        var user = this.userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UnkownUserException(request.getUserId()));
        var totalPrice = request.getQuantity() * request.getPrice();
        this.validateUserBalance(request.getUserId(), user.getBalance(), totalPrice);

        user.setBalance(user.getBalance() - totalPrice);

        this.portfolioItemRepository.findByUserIdAndTicker(request.getUserId(), request.getTicker())
                .ifPresentOrElse(item -> item.setQuantity(item.getQuantity() + request.getQuantity()), () -> {
                    var newItem = this.entityMapper.toPortfolioItem(request);
                    this.portfolioItemRepository.save(newItem);
                });
        return this.entityMapper.toStockTradeResponse(request, user.getBalance());
    }

    @Transactional
    public StockTradeResponse sellStock(StockTradeRequest request) {
        this.validateTickerInPortfolio(request.getTicker());
        var user = this.userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UnkownUserException(request.getUserId()));

        var portfolioItem = this.portfolioItemRepository.findByUserIdAndTicker(request.getUserId(), request.getTicker())
                .filter(item -> item.getQuantity() >= request.getQuantity())
                .orElseThrow(() -> new InsufficientBalanceException(user.getId()));

        var totalPrice = request.getQuantity() * request.getPrice();
        user.setBalance(user.getBalance() + totalPrice);
        portfolioItem.setQuantity(portfolioItem.getQuantity() - request.getQuantity());
        return this.entityMapper.toStockTradeResponse(request, user.getBalance());
    }

    private void validateTickerInPortfolio(Ticker ticker) {
        if (Ticker.UNKNOWN.equals(ticker)) {
            throw new UnkownTickerException(ticker.name());
        }
    }

    private void validateUserBalance(Integer userId, Integer userBalance, Integer totalPrice) {
        if (userBalance < totalPrice) {
            throw new InsufficientBalanceException(userId);
        }
    }
}
