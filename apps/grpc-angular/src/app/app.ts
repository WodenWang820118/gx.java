import { Component, inject } from '@angular/core';

import { TradingPageComponent } from './trading-page/trading-page.component';
import { ThemeService } from './services/theme.service';

/**
 * Root application component.
 * Serves as the main entry point for the Angular application and renders the trading page.
 * This component handles the overall layout and imports the primary trading functionality.
 * Initializes theme service to restore user's theme preference.
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

  /**
   * Inject theme service to initialize theme on app startup.
   * The theme service automatically restores the user's preference from localStorage
   * or uses the system preference if no stored preference exists.
   */
  constructor() {
    inject(ThemeService);
  }
}
