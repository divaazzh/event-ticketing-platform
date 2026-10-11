import { create } from 'zustand';
import { eventsApi } from '@/services/endpoints';
import { EventItem, PaginatedResponse } from '@/types';

interface EventFilters {
  search: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface EventState {
  events: EventItem[];
  featuredEvents: EventItem[];
  pagination: Omit<PaginatedResponse<EventItem>, 'data'> | null;
  currentPage: number;
  perPage: number;
  filters: EventFilters;
  isLoading: boolean;
  error: string | null;

  // Selected single event
  currentEvent: EventItem | null;
  isLoadingCurrentEvent: boolean;

  // Actions
  setFilters: (newFilters: Partial<EventFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  fetchEvents: (overridePage?: number) => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
  fetchEventBySlugOrId: (identifier: string) => Promise<EventItem | null>;
  createEvent: (payload: Parameters<typeof eventsApi.createEvent>[0]) => Promise<EventItem>;
  clearCurrentEvent: () => void;
}

const initialFilters: EventFilters = {
  search: '',
  category: '',
  status: 'published',
  startDate: '',
  endDate: '',
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  featuredEvents: [],
  pagination: null,
  currentPage: 1,
  perPage: 9,
  filters: initialFilters,
  isLoading: false,
  error: null,

  currentEvent: null,
  isLoadingCurrentEvent: false,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page on filter change
    }));
    get().fetchEvents(1);
  },

  resetFilters: () => {
    set({ filters: initialFilters, currentPage: 1 });
    get().fetchEvents(1);
  },

  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchEvents(page);
  },

  fetchEvents: async (overridePage?: number) => {
    const { filters, currentPage, perPage } = get();
    const pageToUse = overridePage ?? currentPage;

    set({ isLoading: true, error: null });
    try {
      const response = await eventsApi.getEvents({
        search: filters.search || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        start_date: filters.startDate || undefined,
        end_date: filters.endDate || undefined,
        page: pageToUse,
        per_page: perPage,
      });

      // Split response pagination metadata
      const { data, ...paginationMeta } = response;

      set({
        events: data,
        pagination: paginationMeta,
        currentPage: pageToUse,
        isLoading: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch events.';
      set({ error: msg, isLoading: false });
    }
  },

  fetchFeaturedEvents: async () => {
    try {
      const response = await eventsApi.getEvents({
        status: 'published',
        per_page: 3,
        page: 1,
      });
      set({ featuredEvents: response.data });
    } catch {
      // featured fail graceful
    }
  },

  fetchEventBySlugOrId: async (identifier: string) => {
    set({ isLoadingCurrentEvent: true, error: null, currentEvent: null });
    try {
      const event = await eventsApi.getEventByIdentifier(identifier);
      set({ currentEvent: event, isLoadingCurrentEvent: false });
      return event;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Event could not be found.';
      set({ error: msg, isLoadingCurrentEvent: false });
      return null;
    }
  },

  createEvent: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await eventsApi.createEvent(payload);
      set((state) => ({
        events: [created, ...state.events],
        isLoading: false,
      }));
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create event.';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  clearCurrentEvent: () => set({ currentEvent: null, error: null }),
}));
