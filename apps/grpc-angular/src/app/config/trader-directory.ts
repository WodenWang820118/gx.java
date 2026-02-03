import { PortfolioHolding } from '../models/trading.models';

export type TraderDirectoryEntry =
  | {
      source: 'internal';
      company: string;
      userId: number;
      employeeId?: number;
      departmentId?: number;
    }
  | {
      source: 'external';
      company: string;
      traderName: string;
      balance: number;
      holdings: PortfolioHolding[];
    };

/**
 * Default "one company with three traders" setup.
 *
 * These IDs align with the sample data described in TRADING_COMPANY_INTEGRATION.md.
 */
export const GX_TRADERS: readonly TraderDirectoryEntry[] = [
  {
    source: 'internal',
    company: 'GX Trading',
    userId: 1,
    employeeId: 1,
    departmentId: 1,
  },
  {
    source: 'internal',
    company: 'GX Trading',
    userId: 2,
    employeeId: 2,
    departmentId: 2,
  },
  {
    source: 'internal',
    company: 'GX Trading',
    userId: 3,
    employeeId: 3,
    departmentId: 1,
  },
] as const;

/**
 * Optional extra traders (other companies) that can be included in the leaderboard.
 *
 * These are client-side entries whose "equity" updates in real-time using the same stock price stream.
 */
export const EXTERNAL_TRADERS: readonly TraderDirectoryEntry[] = [
  {
    source: 'external',
    company: 'Rival Capital',
    traderName: 'Ava',
    balance: 12_000,
    holdings: [
      { ticker: 'APPLE', quantity: 4 },
      { ticker: 'GOOGLE', quantity: 2 },
    ],
  },
  {
    source: 'external',
    company: 'BlueRock Partners',
    traderName: 'Noah',
    balance: 9_500,
    holdings: [
      { ticker: 'AMAZON', quantity: 1 },
      { ticker: 'MICROSOFT', quantity: 5 },
    ],
  },
] as const;

export const INTERNAL_TRADERS_BY_USER_ID = new Map<
  number,
  Extract<TraderDirectoryEntry, { source: 'internal' }>
>(
  GX_TRADERS.filter(
    (t): t is Extract<TraderDirectoryEntry, { source: 'internal' }> =>
      t.source === 'internal',
  ).map((t) => [t.userId, t]),
);
