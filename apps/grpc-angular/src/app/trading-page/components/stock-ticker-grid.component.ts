import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { StockStreamStatus } from '../../services/stock-updates.service';
import { Ticker, TradeAction } from '../../models/trading.models';

@Component({
  selector: 'app-stock-ticker-grid',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  styles: [
    `
      .price {
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
  template: `
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      @for (ticker of tickers; track ticker) {
        <p-card class="h-full">
          <ng-template pTemplate="header">
            <div class="flex items-center justify-between px-2 py-2">
              <span class="text-sm font-semibold">{{ ticker }}</span>
              <p-tag
                [value]="statusLabel(connectionStatus)"
                [severity]="statusSeverity(connectionStatus)"
              ></p-tag>
            </div>
          </ng-template>

          <div class="flex flex-col gap-3">
            <div class="text-center text-2xl font-semibold price">
              @if (stockPrices[ticker]; as price) {
                <span aria-hidden="true">$</span>{{ price }}
              } @else {
                <span class="text-slate-400 dark:text-slate-600">—</span>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
              <p-button
                label="Buy"
                severity="success"
                (onClick)="requestTrade(ticker, 'BUY')"
              ></p-button>
              <p-button
                label="Sell"
                severity="warn"
                [disabled]="holdingsByTicker[ticker] < 1"
                (onClick)="requestTrade(ticker, 'SELL')"
              ></p-button>
            </div>
          </div>
        </p-card>
      }
    </div>
  `,
})
export class StockTickerGridComponent {
  @Input({ required: true }) tickers!: readonly Ticker[];
  @Input({ required: true }) connectionStatus!: StockStreamStatus;
  @Input({ required: true }) stockPrices!: Record<string, number | undefined>;
  @Input({ required: true }) holdingsByTicker!: Record<Ticker, number>;

  @Output() tradeRequested = new EventEmitter<{
    ticker: Ticker;
    action: TradeAction;
  }>();

  requestTrade(ticker: Ticker, action: TradeAction): void {
    this.tradeRequested.emit({ ticker, action });
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
