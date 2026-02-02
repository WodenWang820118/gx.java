import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, scan, switchMap, take } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import {
  StockStreamStatus,
  StockUpdatesService,
} from '../services/stock-updates.service';
import { TradingApiService } from '../services/trading-api.service';
import {
  PriceUpdateDto,
  Ticker,
  TradeAction,
  UserInformation,
} from '../models/trading.models';

@Component({
  selector: 'app-trading-page',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    ToastModule,
  ],
  templateUrl: './trading-page.component.html',
  styleUrl: './trading-page.component.css',
})
export class TradingPageComponent implements OnInit {
  readonly tickers: readonly Ticker[] = [
    'APPLE',
    'AMAZON',
    'GOOGLE',
    'MICROSOFT',
  ];

  private readonly tickerSet = new Set<Ticker>(this.tickers);

  readonly userId = signal(1);
  readonly user = signal<UserInformation | null>(null);

  readonly stockPrices = signal<Record<string, number | undefined>>({});

  private readonly lastStatus = signal<StockStreamStatus | null>(null);

  private readonly api = inject(TradingApiService);
  private readonly updates = inject(StockUpdatesService);
  private readonly messageService = inject(MessageService);

  readonly connectionStatus = this.updates.status;

  private readonly priceBatch = toSignal<Record<Ticker, number> | null>(
    this.updates.priceUpdates().pipe(
      filter(
        (event): event is PriceUpdateDto =>
          !!event &&
          typeof event.ticker === 'string' &&
          this.tickerSet.has(event.ticker as Ticker) &&
          Number.isFinite(event.price) &&
          event.price > 0,
      ),
      map((event) => ({ ticker: event.ticker as Ticker, price: event.price })),
      scan(
        (state, event) => {
          const pending: Partial<Record<Ticker, number>> = {
            ...state.pending,
            [event.ticker]: event.price,
          };

          // Only update the UI when we have a fresh price for ALL tickers.
          const ready = this.tickers.every(
            (t) => typeof pending[t] === 'number',
          );

          if (!ready) {
            return { pending, emit: null };
          }

          return { pending: {}, emit: pending as Record<Ticker, number> };
        },
        {
          pending: {} as Partial<Record<Ticker, number>>,
          emit: null as Record<Ticker, number> | null,
        },
      ),
      filter(
        (
          state,
        ): state is {
          pending: Partial<Record<Ticker, number>>;
          emit: Record<Ticker, number>;
        } => state.emit !== null,
      ),
      map((state) => state.emit),
    ),
    { initialValue: null },
  );

  readonly portfolioValue = computed(() => {
    const user = this.user();
    const prices = this.stockPrices();

    const holdingsValue = (user?.holdings ?? []).reduce((sum, holding) => {
      const price = prices[holding.ticker] ?? 0;
      return sum + holding.quantity * price;
    }, 0);

    return holdingsValue + (user?.balance ?? 0);
  });

  readonly holdingsByTicker = computed(() => {
    const holdings = this.user()?.holdings ?? [];
    return holdings.reduce<Record<Ticker, number>>(
      (acc, holding) => {
        acc[holding.ticker] = holding.quantity;
        return acc;
      },
      {
        APPLE: 0,
        AMAZON: 0,
        GOOGLE: 0,
        MICROSOFT: 0,
      },
    );
  });

  constructor() {
    effect(() => {
      const status = this.connectionStatus();
      if (status === this.lastStatus()) return;
      this.lastStatus.set(status);

      if (status === 'reconnecting') {
        this.showToast(
          'warn',
          'Reconnecting',
          'Lost live stock updates; attempting to reconnect...',
        );
      }
    });

    effect(() => {
      const batch = this.priceBatch();
      if (!batch) return;
      this.stockPrices.update((prev) => ({ ...prev, ...batch }));
    });
  }

  ngOnInit(): void {
    const params = new URLSearchParams(globalThis?.location?.search ?? '');
    const user = params.get('user');
    this.userId.set(user ? Number(user) : 1);

    if (!Number.isFinite(this.userId()) || this.userId() <= 0) {
      this.userId.set(1);
    }

    this.refreshUser();
  }

  refreshUser(): void {
    this.api
      .getUserInformation(this.userId())
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.user.set(user);
        },
        error: () => {
          this.user.set(null);
          this.showToast(
            'error',
            'User Load Failed',
            `User ${this.userId()} not found or server error.`,
          );
        },
      });
  }

  trade(ticker: Ticker, action: TradeAction): void {
    if (action === 'SELL' && (this.holdingsByTicker()[ticker] ?? 0) < 1) {
      this.showToast(
        'warn',
        'Cannot Sell',
        `You don't own any ${ticker} shares yet.`,
      );
      return;
    }

    const knownPrice = this.stockPrices()[ticker];
    const price = typeof knownPrice === 'number' ? Math.round(knownPrice) : 100;

    this.api
      .trade({
        userId: this.userId(),
        ticker,
        price,
        action,
        quantity: 1,
      })
      .pipe(
        take(1),
        switchMap((res) =>
          this.api.getUserInformation(this.userId()).pipe(
            take(1),
            map((user) => ({ res, user })),
          ),
        ),
      )
      .subscribe({
        next: ({ res, user }) => {
          this.user.set(user);
          this.showToast(
            'success',
            'Trade Submitted',
            res.message ?? `${action} ${ticker}`,
          );
        },
        error: (err: unknown) => {
          this.showToast('error', 'Trade Failed', getErrorMessage(err));
        },
      });
  }

  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
  ): void {
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }

  statusLabel(status: StockStreamStatus): string {
    switch (status) {
      case 'live':
        return 'LIVE';
      case 'connecting':
        return 'CONNECTING';
      case 'reconnecting':
        return 'RECONNECTING';
      case 'disconnected':
      default:
        return 'DISCONNECTED';
    }
  }

  statusSeverity(
    status: StockStreamStatus,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'live':
        return 'success';
      case 'connecting':
        return 'info';
      case 'reconnecting':
        return 'warn';
      case 'disconnected':
      default:
        return 'danger';
    }
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const maybeMessage = (err as Record<string, unknown>)['message'];
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return 'Trade failed.';
}
