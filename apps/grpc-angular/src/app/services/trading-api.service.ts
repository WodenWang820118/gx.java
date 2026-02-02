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

@Injectable({
  providedIn: 'root',
})
export class TradingApiService {
  private readonly transport = createGrpcWebTransport({
    // Use same-origin so Angular's dev proxy can forward to Envoy.
    // In production, serve the UI behind Envoy to keep same-origin.
    baseUrl: '',
  });

  private readonly userClient = createClient(UserService, this.transport);

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

function uiTickerToProtoTicker(ticker: string): CommonTicker {
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
  ) {
    return key;
  }
  return 'APPLE';
}

function uiTradeActionToProtoTradeAction(action: TradeAction): UserTradeAction {
  return action === 'SELL' ? UserTradeAction.SELL : UserTradeAction.BUY;
}

function protoTradeActionToUiTradeAction(action: UserTradeAction): TradeAction {
  return action === UserTradeAction.SELL ? 'SELL' : 'BUY';
}
