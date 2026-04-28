import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';

export type BookingStatus = {
  bookingOpen: boolean;
  opensAt: string | null;
};

export function useBookingStatus() {
  return useQuery<BookingStatus>({
    queryKey: ['booking-status'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/api/booking-status'));
      if (!res.ok) {
        throw new Error(`Booking status failed (${res.status})`);
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    // If the API is unreachable, do not hide the site behind a false pause.
    placeholderData: { bookingOpen: true, opensAt: null },
  });
}
