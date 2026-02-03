/** Supported stock ticker symbols in the trading application */
export type Ticker = 'APPLE' | 'AMAZON' | 'GOOGLE' | 'MICROSOFT';

/**
 * Data transfer object for real-time stock price updates.
 * Received from the gRPC streaming service and contains the latest price for a ticker.
 */
export interface PriceUpdateDto {
  /** Stock ticker symbol */
  ticker: string;
  /** Current stock price */
  price: number;
}

/**
 * Represents a stock holding in a user's portfolio.
 * Contains the ticker symbol and quantity owned.
 */
export interface PortfolioHolding {
  /** Stock ticker symbol */
  ticker: Ticker;
  /** Number of shares owned */
  quantity: number;
}

/**
 * Complete user account information including balance and portfolio holdings.
 * Retrieved from the user service via gRPC.
 */
export interface UserInformation {
  /** Trading system user ID */
  userId?: number;
  /** User's display name */
  name: string;
  /** Current account balance in dollars */
  balance: number;
  /** List of stocks currently held in the portfolio */
  holdings: PortfolioHolding[];
  /** Employee ID linking to organizational data */
  employeeId?: number;
  /** Department ID linking to organizational data */
  departmentId?: number;
}

/** Type of trading action that can be performed */
export type TradeAction = 'BUY' | 'SELL';

/**
 * Request object for executing a stock trade.
 * Contains all necessary information to process a buy or sell transaction.
 */
export interface StockTradeRequest {
  /** User ID performing the trade */
  userId: number;
  /** Stock ticker to trade */
  ticker: Ticker;
  /** Price per share at time of trade */
  price: number;
  /** Trade action: BUY or SELL */
  action: TradeAction;
  /** Number of shares to trade */
  quantity: number;
}

/**
 * Response object returned after a trade is executed.
 * Contains confirmation details and updated account balance.
 */
export interface StockTradeResponse {
  /** Confirmation message describing the trade execution */
  message?: string;
  /** Updated account balance after the trade */
  balance?: number;
}

/**
 * Alert message displayed to the user in the UI.
 * Typically used for notifications, warnings, and error messages.
 */
export interface AlertMessage {
  /** Unique identifier for the alert */
  id: string;
  /** Severity level of the alert */
  level: 'success' | 'danger' | 'warning' | 'info';
  /** Message text to display */
  message: string;
}
