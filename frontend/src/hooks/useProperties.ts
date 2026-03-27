import { useQuery } from '@tanstack/react-query';

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
}

export function useProperties() {
  return useQuery<Property[], Error>({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/api/properties');
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
      const response = await fetch(`http://localhost:5000/api/properties/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      return response.json();
    },
    enabled: !!id,
  });
}
