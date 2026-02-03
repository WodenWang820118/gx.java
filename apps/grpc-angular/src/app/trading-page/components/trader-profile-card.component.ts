import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { Department, Employee } from '../../models/organization.models';
import { UserInformation } from '../../models/trading.models';

@Component({
  selector: 'app-trader-profile-card',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="px-2 py-2 text-sm font-semibold">Profile</div>
      </ng-template>

      <div class="flex flex-col items-center gap-3 py-2">
        <div
          class="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700"
          aria-hidden="true"
        ></div>
        <div class="text-center">
          <div class="text-lg font-semibold">{{ user?.name ?? '—' }}</div>

          @if (employee) {
            <div class="text-sm text-slate-600 dark:text-slate-400">
              {{ employee.firstName }} {{ employee.lastName }}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-500">
              {{ employee.email }}
            </div>
          }

          @if (department) {
            <div class="mt-2">
              <p-tag
                [value]="department.departmentName"
                severity="info"
              ></p-tag>
            </div>
            <div class="mt-1 text-xs text-slate-500 dark:text-slate-500">
              {{ department.location }}
            </div>
          }
        </div>
      </div>

      <div class="mt-4 space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-slate-600 dark:text-slate-400"
            >Available Balance</span
          >
          <span class="font-semibold"
            ><span aria-hidden="true">$</span>{{ user?.balance ?? 0 }}</span
          >
        </div>

        <div class="flex items-center justify-between">
          <span class="text-slate-600 dark:text-slate-400"
            >Portfolio Value</span
          >
          <span
            class="font-semibold"
            [class.text-green-600]="portfolioValue >= 10000"
            [class.text-red-600]="portfolioValue < 10000"
            [class.dark:text-green-400]="portfolioValue >= 10000"
            [class.dark:text-red-400]="portfolioValue < 10000"
          >
            <span aria-hidden="true">$</span>{{ portfolioValue }}
          </span>
        </div>
      </div>
    </p-card>
  `,
})
export class TraderProfileCardComponent {
  @Input() user: UserInformation | null = null;
  @Input() employee: Employee | null = null;
  @Input() department: Department | null = null;
  @Input() portfolioValue = 0;
}
