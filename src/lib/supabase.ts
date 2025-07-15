import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript
export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  talle: string;
  color: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  margen_porcentaje?: number;
  stock_minimo?: number;
  created_at: string;
  updated_at: string;
}

export interface Venta {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total?: number;
  metodo_pago: string;
  comision_porcentaje?: number;
  ganancia_neta?: number;
  fecha: string;
  notas?: string;
  productos?: Producto;
}

export interface Compra {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total?: number;
  proveedor?: string;
  fecha: string;
  notas?: string;
  productos?: Producto;
}