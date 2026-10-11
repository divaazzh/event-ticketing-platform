export type UserRole = 'customer' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface TicketCategory {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number | string;
  total_quota: number;
  available_quota: number;
  sale_start_time?: string;
  sale_end_time?: string;
  version?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventItem {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  banner_url?: string;
  venue_name: string;
  venue_address: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
  categories?: TicketCategory[];
  ticket_categories?: TicketCategory[];
  organizer?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_category_id: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  ticket_category?: TicketCategory;
  ticketCategory?: TicketCategory;
}

export interface Payment {
  id: string;
  order_id: string;
  transaction_reference: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'qris' | 'e_wallet' | string;
  payment_status: 'success' | 'failed' | 'pending';
  amount_paid: number | string;
  paid_at?: string;
  payload?: Record<string, unknown>;
  created_at?: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  order_item_id: string;
  ticket_category_id: string;
  user_id: string;
  ticket_code: string;
  qr_payload: string; // Base64 encoded SVG string
  status: 'valid' | 'used' | 'cancelled';
  check_in_at?: string | null;
  created_at?: string;
  ticket_category?: TicketCategory;
  ticketCategory?: TicketCategory;
  order?: Order;
}

export interface Order {
  id: string;
  user_id: string;
  order_reference: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  total_amount: number | string;
  expires_at: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  payments?: Payment[];
  tickets?: Ticket[];
  user?: User;
}

export interface AdminMetrics {
  total_revenue: number | string;
  total_tickets_sold: number;
  active_events: number;
  registered_users: number;
  sales_chart: Array<{
    date: string;
    count: number;
    total: number;
  }>;
  order_breakdown: {
    paid: number;
    pending: number;
    cancelled: number;
  };
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url?: string;
  from?: number;
  last_page: number;
  last_page_url?: string;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number;
  total: number;
}
