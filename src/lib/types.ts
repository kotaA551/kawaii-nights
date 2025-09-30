// src/lib/types.ts
export type Category = 'concafe' | 'girlsbar';

export type Shop = {
  id: string;
  name: string;
  concept?: string;
  priceRange?: string;
  address: string;
  lat: number;
  lng: number;
  area: 'tokyo' | 'osaka' | 'kyoto' | 'fukuoka' | 'other' | string;
  hours?: string;
  alcohol?: 'ok' | 'ng' | 'space' | 'separate' | string;
  smoking?: 'ok' | 'ng' | 'space' | 'separate' | string;
  images?: string[];
};
