import apiClient from './api';
import { EventItem, PaginatedResponse, Order, Ticket, AdminMetrics } from '@/types';

export const eventsApi = {
  getEvents: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<EventItem>> => {
    const res = await apiClient.get<PaginatedResponse<EventItem>>('/events', { params });
    return res.data;
  },

  getEventByIdentifier: async (identifier: string): Promise<EventItem> => {
    const res = await apiClient.get<{ data: EventItem }>(`/events/${identifier}`);
    return res.data.data;
  },

  createEvent: async (payload: {
    title: string;
    description?: string;
    category?: string;
    banner_url?: string;
    venue_name: string;
    venue_address: string;
    status?: string;
    start_time: string;
    end_time: string;
    ticket_categories?: Array<{
      name: string;
      description?: string;
      price: number;
      total_quota: number;
      sale_start_time?: string;
      sale_end_time?: string;
    }>;
  }): Promise<EventItem> => {
    const res = await apiClient.post<{ message: string; data: EventItem }>('/events', payload);
    return res.data.data;
  },

  updateEvent: async (id: string, payload: Partial<EventItem>): Promise<EventItem> => {
    const res = await apiClient.put<{ message: string; data: EventItem }>(`/events/${id}`, payload);
    return res.data.data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};

export const bookingsApi = {
  reserveTickets: async (items: Array<{ ticket_category_id: string; quantity: number }>): Promise<Order> => {
    const res = await apiClient.post<{ message: string; data: Order }>('/bookings/reserve', { items });
    return res.data.data;
  },

  processMockPayment: async (
    orderId: string,
    paymentMethod: string,
    simulateSuccess = true
  ): Promise<{
    success: boolean;
    order: Order;
    payment: unknown;
    tickets: Ticket[];
    message: string;
  }> => {
    const res = await apiClient.post(`/bookings/${orderId}/pay`, {
      payment_method: paymentMethod,
      simulate_success: simulateSuccess,
    });
    return res.data;
  },

  getMyOrders: async (perPage = 10, page = 1): Promise<PaginatedResponse<Order>> => {
    const res = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params: { per_page: perPage, page },
    });
    return res.data;
  },

  getOrderDetail: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
    return res.data.data;
  },

  getMyTickets: async (perPage = 20, page = 1): Promise<PaginatedResponse<Ticket>> => {
    const res = await apiClient.get<PaginatedResponse<Ticket>>('/tickets', {
      params: { per_page: perPage, page },
    });
    return res.data;
  },
};

export const adminApi = {
  getMetrics: async (): Promise<AdminMetrics> => {
    const res = await apiClient.get<{ data: AdminMetrics }>('/admin/metrics');
    return res.data.data;
  },
};
