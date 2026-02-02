import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, defer, retry, timer } from 'rxjs';

import { createClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

// Connect v2: service descriptors are exported from *_pb.ts
import { StockService } from '../../gen/stock-service_pb.js';

import { Ticker as CommonTicker } from '../../gen/common/common_pb.js';
import { PriceUpdateDto, Ticker } from '../models/trading.models';

export type StockStreamStatus =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'disconnected';

@Injectable({ providedIn: 'root' })
export class StockUpdatesService {
  private readonly transport = createGrpcWebTransport({
    // same-origin + dev proxy / Envoy forward
    baseUrl: '',
  });

  private readonly stockClient = createClient(StockService, this.transport);

  readonly status = signal<StockStreamStatus>('disconnected');
  readonly status$ = toObservable(this.status);

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
