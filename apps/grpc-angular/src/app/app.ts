import { Component } from '@angular/core';

import { TradingPageComponent } from './trading-page/trading-page.component';

@Component({
  imports: [TradingPageComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'grpc-angular';
}
