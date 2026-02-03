import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ThemeToggleComponent } from '../components/theme-toggle.component';

import { TradingPageFacade } from './trading-page.facade';
import { StockTickerGridComponent } from './components/stock-ticker-grid.component';
import { TraderProfileCardComponent } from './components/trader-profile-card.component';
import { PortfolioTableComponent } from './components/portfolio-table.component';
import { TraderRankingDashboardComponent } from './components/trader-ranking-dashboard.component';

/**
 * Main trading page component.
 * Displays user portfolio information, real-time stock prices, and enables buy/sell functionality.
 * Manages state through Angular signals and reactive streams for a responsive UI.
 * Implements automatic connection management with visual status indicators.
 * Includes theme toggle for dark/light mode switching.
 */
@Component({
  selector: 'app-trading-page',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ThemeToggleComponent,
    StockTickerGridComponent,
    TraderProfileCardComponent,
    PortfolioTableComponent,
    TraderRankingDashboardComponent,
  ],
  providers: [TradingPageFacade],
  templateUrl: './trading-page.component.html',
  styleUrl: './trading-page.component.css',
})
export class TradingPageComponent implements OnInit {
  readonly vm = inject(TradingPageFacade);

  ngOnInit(): void {
    this.vm.initFromUrl();
    this.vm.refreshUser();
  }
}
