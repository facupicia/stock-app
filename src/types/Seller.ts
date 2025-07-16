export interface Seller {
  id: string;
  name: string;
  specialty: string;
  description?: string;
  created_at: string;
  updated_at: string;
  links?: SellerLink[];
}

export interface SellerLink {
  id: string;
  seller_id: string;
  name: string;
  url: string;
  created_at: string;
}

export interface SellerFormData {
  name: string;
  specialty: string;
  description?: string;
  links: {
    name: string;
    url: string;
  }[];
}

export const SPECIALTIES = [
  'Zapatillas',
  'Remeras',
  'Jeans',
  'Buzos',
  'Camperas',
  'Vestidos',
  'Shorts',
  'Accesorios',
  'Bolsos',
  'Relojes',
  'Lentes',
  'Gorras',
  'Medias',
  'Ropa Interior',
  'Deportiva',
  'Formal',
  'Casual',
  'Infantil'
] as const;

export type Specialty = typeof SPECIALTIES[number];