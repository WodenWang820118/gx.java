import { Injectable } from '@angular/core';
import { Observable, defer, from, map } from 'rxjs';

import { create } from '@bufbuild/protobuf';
import { createClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

import { Ticker as CommonTicker } from '../../gen/common/common_pb.js';
import {
  Holding,
  StockTradeRequestSchema,
  TradeAction as UserTradeAction,
  UserInformationRequestSchema,
  UserService,
} from '../../gen/user-service_pb.js';

import {
  StockTradeRequest,
  StockTradeResponse,
  Ticker,
  TradeAction,
  UserInformation,
} from '../models/trading.models';

/**
 * Service for communicating with the trading/user backend via gRPC.
 * Handles all API calls for user information retrieval and stock trading operations.
 * Uses gRPC-web transport for browser-based communication with the backend services.
 */
@Injectable({
  providedIn: 'root',
})
export class TradingApiService {
  /** gRPC web transport configured for same-origin requests */
  private readonly transport = createGrpcWebTransport({
    // Use same-origin so Angular's dev proxy can forward to Envoy.
    // In production, serve the UI behind Envoy to keep same-origin.
    baseUrl: '',
  });

  /** gRPC client for user service operations */
  private readonly userClient = createClient(UserService, this.transport);

  /**
   * Retrieves user account information including balance and portfolio holdings.
   * Calls the gRPC user service and maps the protobuf response to UI models.
   * @param userId - The ID of the user to fetch information for
   * @returns Observable emitting user information with holdings and balance
   */
  getUserInformation(userId: number): Observable<UserInformation> {
    return defer(() =>
      from(
        this.userClient.getUserInformation(
          create(UserInformationRequestSchema, { userId }),
        ),
      ),
    ).pipe(
      map((user) => ({
        name: user.name,
        balance: user.balance,
        holdings: user.holdings.map((h: Holding) => ({
          ticker: protoTickerToUiTicker(h.ticker),
          quantity: h.quantity,
        })),
      })),
    );
  }

  /**
   * Executes a stock trade (buy or sell) for a user.
   * Converts UI models to protobuf format and sends the request to the user service.
   * Maps the protobuf response back to UI models for display.
   * @param request - The trade request containing user ID, ticker, action, quantity, and price
   * @returns Observable emitting the trade response with confirmation message and new balance
   */
  trade(request: StockTradeRequest): Observable<StockTradeResponse> {
    return defer(() =>
      from(
        this.userClient.tradeStock(
          create(StockTradeRequestSchema, {
            userId: request.userId,
            ticker: uiTickerToProtoTicker(request.ticker),
            action: uiTradeActionToProtoTradeAction(request.action),
            quantity: request.quantity,
            price: request.price,
          }),
        ),
      ),
    ).pipe(
      map((res) => ({
        balance: res.balance,
        message: `${protoTradeActionToUiTradeAction(res.action)} ${protoTickerToUiTicker(res.ticker)} @ $${res.price}`,
      })),
    );
  }
}

/**
 * Converts UI ticker symbol string to protobuf Ticker enum value.
 * Used when sending trade requests to the backend.
 * @param ticker - The ticker symbol as a string (e.g., 'APPLE', 'AMAZON')
 * @returns The corresponding protobuf Ticker enum value, or UNKNOWN if not found
 */
function uiTickerToProtoTicker(ticker: string): CommonTicker {
  /**
   * Converts protobuf Ticker enum value to UI ticker symbol string.
   * Used when processing responses from the backend to display to users.
   * @param ticker - The protobuf Ticker enum value
   * @returns The corresponding ticker symbol ('APPLE', 'AMAZON', 'GOOGLE', 'MICROSOFT'), defaults to 'APPLE' if unknown
   */
  const resolved = (CommonTicker as unknown as Record<string, number>)[ticker];
  return typeof resolved === 'number'
    ? (resolved as CommonTicker)
    : CommonTicker.UNKNOWN;
}

function protoTickerToUiTicker(ticker: CommonTicker): Ticker {
  const key = CommonTicker[ticker] as string | undefined;
  if (
    key === 'APPLE' ||
    key === 'AMAZON' ||
    key === 'GOOGLE' ||
    key === 'MICROSOFT'
    /**
     * Converts UI trade action string to protobuf TradeAction enum value.
     * Used when sending trade requests to the backend.
     * @param action - The trade action as a string ('BUY' or 'SELL')
     * @returns The corresponding protobuf TradeAction enum value (BUY or SELL)
     */
  ) {
    return key;
  }
  return 'APPLE';
  /**
   * Converts protobuf TradeAction enum value to UI trade action string.
   * Used when processing trade responses from the backend for display.
   * @param action - The protobuf TradeAction enum value
   * @returns The corresponding trade action string ('SELL' or 'BUY')
   */
}

function uiTradeActionToProtoTradeAction(action: TradeAction): UserTradeAction {
  return action === 'SELL' ? UserTradeAction.SELL : UserTradeAction.BUY;
}

function protoTradeActionToUiTradeAction(action: UserTradeAction): TradeAction {
  return action === UserTradeAction.SELL ? 'SELL' : 'BUY';
}
