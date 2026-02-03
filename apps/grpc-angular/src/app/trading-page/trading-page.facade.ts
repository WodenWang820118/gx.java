import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, scan, switchMap, take } from 'rxjs';

import { MessageService } from 'primeng/api';

import {
  StockStreamStatus,
  StockUpdatesService,
} from '../services/stock-updates.service';
import { TradingApiService } from '../services/trading-api.service';
import { EmployeeService } from '../services/employee.service';
import { DepartmentService } from '../services/department.service';
import {
  PriceUpdateDto,
  Ticker,
  TradeAction,
  UserInformation,
} from '../models/trading.models';
import { Department, Employee } from '../models/organization.models';

@Injectable()
export class TradingPageFacade {
  readonly tickers: readonly Ticker[] = [
    'APPLE',
    'AMAZON',
    'GOOGLE',
    'MICROSOFT',
  ];
  private readonly tickerSet = new Set<Ticker>(this.tickers);

  readonly userId = signal(1);
  readonly user = signal<UserInformation | null>(null);
  readonly employee = signal<Employee | null>(null);
  readonly department = signal<Department | null>(null);

  readonly stockPrices = signal<Record<string, number | undefined>>({});

  private readonly lastStatus = signal<StockStreamStatus | null>(null);

  private readonly api = inject(TradingApiService);
  private readonly updates = inject(StockUpdatesService);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
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

          const ready = this.tickers.every(
            (t) => typeof pending[t] === 'number',
          );
          if (!ready) return { pending, emit: null };

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

  initFromUrl(): void {
    const params = new URLSearchParams(globalThis?.location?.search ?? '');
    const user = params.get('user');
    this.userId.set(user ? Number(user) : 1);

    if (!Number.isFinite(this.userId()) || this.userId() <= 0) {
      this.userId.set(1);
    }
  }

  refreshUser(): void {
    this.api
      .getUserInformation(this.userId())
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.user.set(user);

          // Load organizational info if present on the user payload.
          if (user.employeeId) this.loadEmployeeData(user.employeeId);
          if (user.departmentId) this.loadDepartmentData(user.departmentId);
        },
        error: () => {
          this.user.set(null);
          this.employee.set(null);
          this.department.set(null);
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

  private loadEmployeeData(employeeId: number): void {
    this.employeeService
      .getEmployeeById(employeeId)
      .pipe(take(1))
      .subscribe({
        next: (employee) => this.employee.set(employee),
        error: () => {
          this.employee.set(null);
          console.warn(`Failed to load employee data for ID: ${employeeId}`);
        },
      });
  }

  private loadDepartmentData(departmentId: number): void {
    this.departmentService
      .getDepartmentById(departmentId)
      .pipe(take(1))
      .subscribe({
        next: (department) => this.department.set(department),
        error: () => {
          this.department.set(null);
          console.warn(
            `Failed to load department data for ID: ${departmentId}`,
          );
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
