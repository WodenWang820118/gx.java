import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, defer, retry, timer } from 'rxjs';

import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

import { Empty } from '@bufbuild/protobuf';

import { StockService } from '../../gen/stock-service_connect.js';
import { Ticker as CommonTicker } from '../../gen/common/common_pb.js';

import { PriceUpdateDto, Ticker } from '../models/trading.models';

export type StockStreamStatus =
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'disconnected';

@Injectable({
  providedIn: 'root',
})
export class StockUpdatesService {
  private readonly transport = createGrpcWebTransport({ baseUrl: '' });
  private readonly stockClient = createPromiseClient(
    StockService,
    this.transport,
  );

  readonly status = signal<StockStreamStatus>('disconnected');
  readonly status$ = toObservable(this.status);

  priceUpdates(): Observable<PriceUpdateDto> {
    return defer(() => {
      this.status.set('connecting');

      return new Observable<PriceUpdateDto>((subscriber) => {
        const abortController = new AbortController();
        let hasEmitted = false;
        let setDisconnectedOnTeardown = true;

        const stream = this.stockClient.getPriceUpdates(
          // google.protobuf.Empty
          new Empty(),
          { signal: abortController.signal },
        );

        const iterator = stream[Symbol.asyncIterator]();

        const pump = (): void => {
          iterator
            .next()
            .then((result) => {
              if (abortController.signal.aborted) return;

              if (result.done) {
                this.status.set('disconnected');
                subscriber.complete();
                return;
              }

              const update = result.value;
              if (!hasEmitted) {
                hasEmitted = true;
                this.status.set('live');
              }

              subscriber.next({
                ticker: protoTickerToUiTicker(update.ticker),
                price: update.price,
              });

              pump();
            })
            .catch((err) => {
              if (!abortController.signal.aborted) {
                this.status.set('reconnecting');
                setDisconnectedOnTeardown = false;
                subscriber.error(err);
              }
            });
        };

        pump();

        return () => {
          abortController.abort();
          iterator.return?.();
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
