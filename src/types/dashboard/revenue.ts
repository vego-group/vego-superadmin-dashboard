export interface RevenueData {
  date: string;
  amount: number;
}

export interface RevenueStats {
  daily: RevenueData[];
  weekly: RevenueData[];
  monthly: RevenueData[];
  total: number;
  growth: number;
}

export interface FinancialData {
  total_revenue: number;
  total_transactions: number;
  pending_holds: number;
  refunds: number;
  avg_transaction: number;
}

export interface FinancialResponse {
  success: boolean;
  message: string;
  data: FinancialData;
}