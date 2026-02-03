import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { PortfolioHolding } from '../../models/trading.models';

@Component({
  selector: 'app-portfolio-table',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="px-2 py-2 text-sm font-semibold">Portfolio</div>
      </ng-template>

      <p-table [value]="holdings" [paginator]="false" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th scope="col" style="width: 60px">#</th>
            <th scope="col">Stock</th>
            <th scope="col" style="width: 140px">Quantity</th>
            <th scope="col" style="width: 180px">Current Value</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-holding let-rowIndex="rowIndex">
          <tr>
            <td>{{ rowIndex + 1 }}</td>
            <td class="font-semibold">{{ holding.ticker }}</td>
            <td>{{ holding.quantity }}</td>
            <td>
              @if (stockPrices[holding.ticker]; as price) {
                <span aria-hidden="true">$</span>{{ holding.quantity * price }}
              } @else {
                <span class="text-slate-400 dark:text-slate-600">—</span>
              }
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
})
export class PortfolioTableComponent {
  @Input() holdings: PortfolioHolding[] = [];
  @Input() stockPrices: Record<string, number | undefined> = {};
}
