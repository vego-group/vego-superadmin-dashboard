export type ComplaintCategory = "charging" | "swap" | "payment" | "platform";
export type ComplaintStatus = "new" | "in_review" | "replied";

export interface ComplaintUser {
  id: number;
  name: string;
  phone: string;
}

export interface ComplaintRepliedBy {
  id: number;
  name: string;
}

export interface Complaint {
  id: number;
  user_id: number;
  title: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  reply: string | null;
  replied_by: ComplaintRepliedBy | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
  user: ComplaintUser;
}

export interface ComplaintsPagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}
