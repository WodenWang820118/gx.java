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

/**
 * Main trading page component.
 * Displays user portfolio information, real-time stock prices, and enables buy/sell functionality.
 * Manages state through Angular signals and reactive streams for a responsive UI.
 * Implements automatic connection management with visual status indicators.
 */
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
  /** List of all available stock tickers the user can trade */
  readonly tickers: readonly Ticker[] = [
    'APPLE',
    'AMAZON',
    'GOOGLE',
    'MICROSOFT',
  ];

  /** Set version of tickers for O(1) lookup operations */
  private readonly tickerSet = new Set<Ticker>(this.tickers);

  /** Currently selected user ID (can be changed via URL parameter) */
  readonly userId = signal(1);
  /** Current user's account information (name, balance, holdings) */
  readonly user = signal<UserInformation | null>(null);

  /** Current stock prices indexed by ticker symbol */
  readonly stockPrices = signal<Record<string, number | undefined>>({});

  /** Tracks the last status to avoid redundant effect triggers */
  private readonly lastStatus = signal<StockStreamStatus | null>(null);

  /** Injected trading API service for backend communication */
  private readonly api = inject(TradingApiService);
  /** Injected stock updates service for real-time price streaming */
  private readonly updates = inject(StockUpdatesService);
  /** Injected message service for displaying toast notifications */
  private readonly messageService = inject(MessageService);

  /** Reactive signal for connection status updates */
  readonly connectionStatus = this.updates.status;

  /** Batched price updates (ensures we have prices for all tickers before updating UI) */
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

  /** Computed total portfolio value (cash balance + holdings value at current prices) */
  readonly portfolioValue = computed(() => {
    const user = this.user();
    const prices = this.stockPrices();

    const holdingsValue = (user?.holdings ?? []).reduce((sum, holding) => {
      const price = prices[holding.ticker] ?? 0;
      return sum + holding.quantity * price;
    }, 0);

    return holdingsValue + (user?.balance ?? 0);
  });

  /** Computed mapping of holdings by ticker for quick quantity lookups */
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
  /**
   * Constructor initializes reactive effects for connection status monitoring and price updates.
   * Sets up automatic UI updates when connection status changes or price batches arrive.
   */

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
      /**
       * Angular lifecycle hook called after component initialization.
       * Loads user ID from URL parameters and fetches initial user information.
       */
      this.stockPrices.update((prev) => ({ ...prev, ...batch }));
    });
  }

  ngOnInit(): void {
    const params = new URLSearchParams(globalThis?.location?.search ?? '');
    const user = params.get('user');
    this.userId.set(user ? Number(user) : 1);
    /**
     * Fetches and updates the current user's information from the API.
     * Called on component initialization and after successful trades.
     * Displays error toast if user is not found.
     */

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
          /**
           * Executes a stock trade (buy or sell) for the current user.
           * Validates trade conditions (e.g., sufficient holdings for sell orders) before execution.
           * Updates user information and displays confirmation messages on success or error.
           * @param ticker - The stock ticker to trade
           * @param action - The trade action (BUY or SELL)
           */
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
          /**
           * Displays a toast notification to the user.
           * Used for confirmations, warnings, and error messages.
           * Auto-dismisses after 3 seconds.
           * @param severity - Severity level of the message (success, info, warn, error)
           * @param summary - Brief title of the notification
           * @param detail - Detailed message text
           */
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
    /**
     * Converts a connection status enum value to a user-friendly display label.
     * @param status - The connection status
     * @returns Display label string (LIVE, CONNECTING, RECONNECTING, DISCONNECTED)
     */
  }

  private showToast(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
  ): void {
    this.messageService.add({
      severity,
      /**
       * Returns the PrimeNG severity level for displaying connection status with appropriate styling.
       * @param status - The connection status
       * @returns Severity value (success, info, warn, danger, secondary) for UI styling
       */
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

/**
 * Extracts a human-readable error message from various error types.
 * Handles Error objects, strings, and objects with message properties.
 * @param err - The error object from which to extract a message
 * @returns A descriptive error message string for display to the user
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const maybeMessage = (err as Record<string, unknown>)['message'];
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return 'Trade failed.';
}
