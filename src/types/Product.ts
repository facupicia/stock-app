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

export interface Sale {
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
  productos?: Product;
}

export interface Purchase {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total?: number;
  proveedor?: string;
  fecha: string;
  notas?: string;
  productos?: Product;
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

export interface SaleFormData {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  metodo_pago: string;
  comision_porcentaje?: number;
  notas?: string;
}

export interface PurchaseFormData {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  proveedor?: string;
  notas?: string;
}