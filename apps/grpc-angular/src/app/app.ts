import { Component } from '@angular/core';

import { TradingPageComponent } from './trading-page/trading-page.component';

/**
 * Root application component.
 * Serves as the main entry point for the Angular application and renders the trading page.
 * This component handles the overall layout and imports the primary trading functionality.
 */
@Component({
  imports: [TradingPageComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  /** Application title displayed in the browser tab and used for identification */
  protected title = 'grpc-angular';
}
