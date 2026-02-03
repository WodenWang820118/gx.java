import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import {
  EXTERNAL_TRADERS,
  GX_TRADERS,
  TraderDirectoryEntry,
} from '../../config/trader-directory';
import { Department, Employee } from '../../models/organization.models';
import {
  PortfolioHolding,
  Ticker,
  UserInformation,
} from '../../models/trading.models';
import { OrganizationDirectoryService } from '../../services/organization-directory.service';
import { TradingApiService } from '../../services/trading-api.service';

export interface TraderRankingRow {
  rank: number;
  company: string;
  traderName: string;
  departmentName?: string;
  location?: string;
  equity: number;
}

@Component({
  selector: 'app-trader-ranking-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="flex items-center justify-between px-2 py-2">
          <div class="text-sm font-semibold">Trader Rankings</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">
            Updates with live prices (and user refresh)
          </div>
        </div>
      </ng-template>

      <p-table [value]="rows()" [paginator]="false" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th scope="col" style="width: 70px">Rank</th>
            <th scope="col">Trader</th>
            <th scope="col" style="width: 160px">Company</th>
            <th scope="col" style="width: 180px">Department</th>
            <th scope="col" style="width: 140px">Location</th>
            <th scope="col" style="width: 160px">Equity</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td class="font-semibold">#{{ row.rank }}</td>
            <td class="font-semibold">{{ row.traderName }}</td>
            <td>
              <p-tag [value]="row.company" severity="secondary"></p-tag>
            </td>
            <td>{{ row.departmentName ?? '—' }}</td>
            <td>{{ row.location ?? '—' }}</td>
            <td class="font-semibold">
              <span aria-hidden="true">$</span>{{ row.equity }}
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  `,
})
export class TraderRankingDashboardComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(TradingApiService);
  private readonly org = inject(OrganizationDirectoryService);

  @Input({ required: true }) tickers!: readonly Ticker[];

  private _includeExternal = true;
  @Input()
  set includeExternal(value: boolean) {
    this._includeExternal = value;
  }
  get includeExternal(): boolean {
    return this._includeExternal;
  }

  @Input({ required: true })
  set stockPrices(value: Record<string, number | undefined>) {
    this.pricesSignal.set(value ?? {});
  }

  private readonly internalDirectory = GX_TRADERS;

  private readonly pricesSignal = signal<Record<string, number | undefined>>(
    {},
  );

  private readonly internalSnapshots = signal<
    Array<{
      company: string;
      user: UserInformation;
      employee?: Employee;
      department?: Department;
    }>
  >([]);

  readonly rows = computed<TraderRankingRow[]>(() => {
    const prices = this.pricesSignal();

    const internalRows: TraderRankingRow[] = this.internalSnapshots().map(
      (t) => {
        const equity = computeEquity(t.user.balance, t.user.holdings, prices);
        return {
          rank: 0,
          company: t.company,
          traderName: t.user.name,
          departmentName: t.department?.departmentName,
          location: t.department?.location,
          equity,
        };
      },
    );

    const externalRows: TraderRankingRow[] = (
      this.includeExternal ? EXTERNAL_TRADERS : []
    )
      .map((t) => {
        if (t.source !== 'external') return null;
        return {
          rank: 0,
          company: t.company,
          traderName: t.traderName,
          equity: computeEquity(t.balance, t.holdings, prices),
        } satisfies TraderRankingRow;
      })
      .filter((x): x is TraderRankingRow => x !== null);

    const all = [...internalRows, ...externalRows]
      .sort((a, b) => b.equity - a.equity)
      .map((row, idx) => ({ ...row, rank: idx + 1 }));

    return all;
  });

  constructor() {
    // Poll internal traders (3 users by default) for balance/holdings changes.
    // Prices update in real time via the stock stream, so equity updates instantly.
    timer(0, 5_000)
      .pipe(
        switchMap(() => this.loadInternalTraders(this.internalDirectory)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((snapshots) => this.internalSnapshots.set(snapshots));
  }

  private loadInternalTraders(entries: readonly TraderDirectoryEntry[]) {
    const internal = entries.filter(
      (t): t is Extract<TraderDirectoryEntry, { source: 'internal' }> =>
        t.source === 'internal',
    );

    if (internal.length === 0) return of([]);

    const requests = internal.map((t) => {
      const user$ = this.api
        .getUserInformation(t.userId)
        .pipe(catchError(() => of(null)));

      const employee$ = t.employeeId
        ? this.org.employeeById(t.employeeId).pipe(catchError(() => of(null)))
        : of(null);

      const department$ = t.departmentId
        ? this.org
            .departmentById(t.departmentId)
            .pipe(catchError(() => of(null)))
        : of(null);

      return forkJoin({
        user: user$,
        employee: employee$,
        department: department$,
      }).pipe(
        map(({ user, employee, department }) => {
          if (!user) return null;
          return {
            company: t.company,
            user,
            employee: employee ?? undefined,
            department: department ?? undefined,
          };
        }),
      );
    });

    return forkJoin(requests).pipe(
      map((rows) => rows.filter((r): r is NonNullable<typeof r> => r !== null)),
    );
  }
}

function computeEquity(
  balance: number,
  holdings: PortfolioHolding[],
  prices: Record<string, number | undefined>,
): number {
  const holdingsValue = holdings.reduce((sum, holding) => {
    const price = prices[holding.ticker] ?? 0;
    return sum + holding.quantity * price;
  }, 0);

  return Math.round(balance + holdingsValue);
}
