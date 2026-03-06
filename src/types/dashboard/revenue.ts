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