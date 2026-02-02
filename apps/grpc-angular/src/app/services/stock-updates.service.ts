import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, defer, retry, timer } from 'rxjs';

import { createClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

// Connect v2: service descriptors are exported from *_pb.ts
import { StockService } from '../../gen/stock-service_pb.js';

import { Ticker as CommonTicker } from '../../gen/common/common_pb.js';
import { PriceUpdateDto, Ticker } from '../models/trading.models';

/** Status states of the gRPC streaming connection to the stock service */
export type StockStreamStatus =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'disconnected';

/**
 * Service for real-time stock price updates via gRPC streaming.
 * Maintains connection status and provides continuous price updates for all supported tickers.
 * Automatically handles reconnection logic with exponential backoff.
 */
@Injectable({ providedIn: 'root' })
export class StockUpdatesService {
  /** gRPC web transport configured for streaming requests */
  private readonly transport = createGrpcWebTransport({
    // same-origin + dev proxy / Envoy forward
    baseUrl: '',
  });

  /** gRPC client for stock service streaming operations */
  private readonly stockClient = createClient(StockService, this.transport);

  /** Signal tracking the current connection status */
  readonly status = signal<StockStreamStatus>('disconnected');
  /** Observable version of the status signal for reactive subscriptions */
  readonly status$ = toObservable(this.status);

  /**
   * Establishes a gRPC server-streaming connection to receive real-time price updates.
   * Automatically manages connection status and implements exponential backoff retry logic.
   * Updates are emitted as they arrive from the server.
   * @returns Observable that emits PriceUpdateDto objects with ticker and price information
   */
  priceUpdates(): Observable<PriceUpdateDto> {
    return defer(() => {
      this.status.set('connecting');

      return new Observable<PriceUpdateDto>((subscriber) => {
        const abortController = new AbortController();
        let hasEmitted = false;
        let setDisconnectedOnTeardown = true;

        // Connect v2: send an empty request as {}
        const stream = this.stockClient.getPriceUpdates(
          {},
          { signal: abortController.signal },
        );

        const run = async (): Promise<void> => {
          try {
            // server-streaming：AsyncIterable，for await...of
            for await (const update of stream) {
              if (abortController.signal.aborted) return;

              if (!hasEmitted) {
                hasEmitted = true;
                this.status.set('live');
              }

              subscriber.next({
                ticker: protoTickerToUiTicker(update.ticker),
                price: update.price,
              });
            }

            if (!abortController.signal.aborted) {
              this.status.set('disconnected');
              subscriber.complete();
            }
          } catch (err) {
            if (!abortController.signal.aborted) {
              this.status.set('reconnecting');
              setDisconnectedOnTeardown = false; // Keep reconnecting; retry will switch back to connecting on re-subscribe
              subscriber.error(err);
            }
          }
        };

        // Fire-and-forget: start the streaming loop without awaiting.
        // Observable teardown uses AbortController to cancel the stream.
        void run();

        return () => {
          abortController.abort();
          if (setDisconnectedOnTeardown) {
            this.status.set('disconnected');
          }
        };
      });
    }).pipe(
      retry({
        delay: (_err, retryCount) => timer(Math.min(1000 * retryCount, 10_000)),
      }),
    );
  }
}

// Connect v2: prefer switch for stable typing (avoid enum reverse lookup)
/**
 * Converts protobuf Ticker enum value to UI ticker symbol string.
 * Used for mapping gRPC price updates to displayable ticker symbols.
 * @param ticker - The protobuf Ticker enum value
 * @returns The corresponding ticker symbol ('APPLE', 'AMAZON', 'GOOGLE', 'MICROSOFT'), defaults to 'APPLE' if unknown
 */
function protoTickerToUiTicker(ticker: CommonTicker): Ticker {
  switch (ticker) {
    case CommonTicker.APPLE:
      return 'APPLE';
    case CommonTicker.AMAZON:
      return 'AMAZON';
    case CommonTicker.GOOGLE:
      return 'GOOGLE';
    case CommonTicker.MICROSOFT:
      return 'MICROSOFT';
    default:
      return 'APPLE';
  }
}
