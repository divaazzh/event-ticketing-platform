import { create } from 'zustand';
import { bookingsApi } from '@/services/endpoints';
import { EventItem, Order, Ticket, TicketCategory } from '@/types';

export interface CartItem {
  ticketCategory: TicketCategory;
  quantity: number;
}

interface BookingState {
  // Selection state
  selectedEvent: EventItem | null;
  selectedTickets: Record<string, number>; // categoryId -> quantity

  // Active reservation/order hold
  activeOrder: Order | null;
  issuedTickets: Ticket[];
  holdExpiresAt: string | null;
  secondsRemaining: number;
  isHolding: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedEvent: (event: EventItem | null) => void;
  updateTicketQuantity: (categoryId: string, quantity: number, maxQuota: number) => void;
  clearSelection: () => void;
  getTotalPrice: () => number;
  getTotalTicketsCount: () => number;

  // Booking & Payment
  reserveOrder: () => Promise<Order>;
  payOrder: (paymentMethod: string, simulateSuccess?: boolean) => Promise<{ success: boolean; tickets: Ticket[] }>;
  resetBooking: () => void;
  tickTimer: () => void;
  setOrderFromExisting: (order: Order) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedEvent: null,
  selectedTickets: {},
  activeOrder: null,
  issuedTickets: [],
  holdExpiresAt: null,
  secondsRemaining: 0,
  isHolding: false,
  isLoading: false,
  error: null,

  setSelectedEvent: (event) => {
    // If setting a different event, reset ticket quantities
    const current = get().selectedEvent;
    if (current?.id !== event?.id) {
      set({ selectedEvent: event, selectedTickets: {} });
    } else {
      set({ selectedEvent: event });
    }
  },

  updateTicketQuantity: (categoryId, quantity, maxQuota) => {
    const safeQty = Math.max(0, Math.min(10, Math.min(quantity, maxQuota)));
    set((state) => {
      const nextTickets = { ...state.selectedTickets };
      if (safeQty <= 0) {
        delete nextTickets[categoryId];
      } else {
        nextTickets[categoryId] = safeQty;
      }
      return { selectedTickets: nextTickets };
    });
  },

  clearSelection: () => {
    set({ selectedTickets: {} });
  },

  getTotalPrice: () => {
    const { selectedEvent, selectedTickets } = get();
    if (!selectedEvent) return 0;

    const categories = selectedEvent.ticket_categories || selectedEvent.categories || [];
    let sum = 0;

    Object.entries(selectedTickets).forEach(([categoryId, qty]) => {
      const cat = categories.find((c) => c.id === categoryId);
      if (cat) {
        sum += Number(cat.price) * qty;
      }
    });

    return sum;
  },

  getTotalTicketsCount: () => {
    const { selectedTickets } = get();
    return Object.values(selectedTickets).reduce((acc, qty) => acc + qty, 0);
  },

  reserveOrder: async () => {
    const { selectedTickets } = get();
    const items = Object.entries(selectedTickets)
      .filter(([, qty]) => qty > 0)
      .map(([ticket_category_id, quantity]) => ({
        ticket_category_id,
        quantity,
      }));

    if (items.length === 0) {
      throw new Error('Please select at least 1 ticket to proceed.');
    }

    set({ isLoading: true, error: null });

    try {
      const order = await bookingsApi.reserveTickets(items);
      const expiresAt = order.expires_at;
      const secondsLeft = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000)
      );

      set({
        activeOrder: order,
        holdExpiresAt: expiresAt,
        secondsRemaining: secondsLeft,
        isHolding: true,
        isLoading: false,
        error: null,
      });

      return order;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation failed.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  setOrderFromExisting: (order) => {
    const secondsLeft = Math.max(
      0,
      Math.floor((new Date(order.expires_at).getTime() - new Date().getTime()) / 1000)
    );
    set({
      activeOrder: order,
      holdExpiresAt: order.expires_at,
      secondsRemaining: secondsLeft,
      isHolding: order.status === 'pending' && secondsLeft > 0,
      issuedTickets: order.tickets || [],
    });
  },

  payOrder: async (paymentMethod, simulateSuccess = true) => {
    const { activeOrder } = get();
    if (!activeOrder) {
      throw new Error('No active reservation to pay for.');
    }

    set({ isLoading: true, error: null });

    try {
      const res = await bookingsApi.processMockPayment(activeOrder.id, paymentMethod, simulateSuccess);
      
      set({
        activeOrder: res.order,
        issuedTickets: res.tickets,
        isHolding: false,
        isLoading: false,
      });

      return {
        success: res.success,
        tickets: res.tickets,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment process encountered an error.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  tickTimer: () => {
    const { secondsRemaining, isHolding } = get();
    if (!isHolding || secondsRemaining <= 0) {
      if (isHolding) {
        set({ isHolding: false, secondsRemaining: 0 });
      }
      return;
    }
    set({ secondsRemaining: secondsRemaining - 1 });
  },

  resetBooking: () => {
    set({
      selectedEvent: null,
      selectedTickets: {},
      activeOrder: null,
      issuedTickets: [],
      holdExpiresAt: null,
      secondsRemaining: 0,
      isHolding: false,
      isLoading: false,
      error: null,
    });
  },
}));
