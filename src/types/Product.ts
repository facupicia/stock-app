export interface Product {
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

export interface PriceCalculation {
  baseCost: number;
  profitMargin: number;
  importTax: number;
  shipping: number;
  platformCommission: number;
  finalPrice: number;
  breakdown: {
    cost: number;
    profit: number;
    tax: number;
    shipping: number;
    commission: number;
  };
}

// Tipos para formularios
export interface ProductFormData {
  nombre: string;
  categoria: string;
  talle: string;
  color: string;
  precio_costo: number;
  precio_venta: number;
  stock: number;
  stock_minimo?: number;
}
