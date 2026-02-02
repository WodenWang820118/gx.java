export type Ticker = 'APPLE' | 'AMAZON' | 'GOOGLE' | 'MICROSOFT';

export interface PriceUpdateDto {
  ticker: string;
  price: number;
}

export interface PortfolioHolding {
  ticker: string;
  quantity: number;
}

export interface UserInformation {
  name: string;
  balance: number;
  holdings: PortfolioHolding[];
}

export type TradeAction = 'BUY' | 'SELL';

export interface StockTradeRequest {
  userId: number;
  ticker: string;
  price: number;
  action: TradeAction;
  quantity: number;
}

export interface StockTradeResponse {
  message?: string;
  balance?: number;
}

export interface AlertMessage {
  id: string;
  level: 'success' | 'danger' | 'warning' | 'info';
  message: string;
}
