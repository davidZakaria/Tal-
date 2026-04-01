import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@/lib/api';

// Type representing the Property Schema from our Express backend
export interface Property {
  _id: string;
  name: string;
  description: string;
  roomType: string;
  basePrice: number;
  amenities: string[];
  capacity: number;
  images: string[];
  isOccupiedToday?: boolean;
  openForBooking?: boolean;
}

export function useProperties() {
  return useQuery<Property[], Error>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/api/properties'));
      if (!response.ok) {
        throw new Error('Failed to fetch properties from the Talé API');
      }
      return response.json();
    },
  });
}

export function useProperty(id: string) {
  return useQuery<Property, Error>({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`/api/properties/${id}`));
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/** All properties including closed-for-booking; requires admin token in localStorage */
export function useAdminProperties() {
  return useQuery<Property[], Error>({
    queryKey: ['properties', 'admin'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const response = await fetch(apiUrl('/api/properties/manage/all'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error('Failed to fetch properties for admin');
      }
      return response.json();
    },
  });
}
