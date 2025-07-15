import { supabase, Producto } from '../lib/supabase';

export class ProductService {
  // Obtener todos los productos
  static async getAll(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener producto por ID
  static async getById(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  }

  // Crear nuevo producto
  static async create(producto: Omit<Producto, 'id' | 'codigo' | 'created_at' | 'updated_at' | 'margen_porcentaje'>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data;
  }

  // Actualizar producto
  static async update(id: string, updates: Partial<Producto>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return data;
  }

  // Eliminar producto
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Obtener productos con stock bajo
  static async getLowStock(threshold: number = 5): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .lte('stock', threshold)
      .order('stock', { ascending: true });

    if (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }

    return data || [];
  }

  // Buscar productos
  static async search(searchTerm: string, filters?: {
    categoria?: string;
    talle?: string;
  }): Promise<Producto[]> {
    let query = supabase
      .from('productos')
      .select('*');

    // Búsqueda por texto
    if (searchTerm) {
      query = query.or(`nombre.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`);
    }

    // Filtros adicionales
    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters?.talle) {
      query = query.eq('talle', filters.talle);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }

    return data || [];
  }

  // Actualizar stock
  static async updateStock(id: string, newStock: number): Promise<Producto> {
    return this.update(id, { stock: newStock });
  }

  // Reducir stock (para ventas)
  static async reduceStock(id: string, quantity: number): Promise<Producto> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const newStock = Math.max(0, product.stock - quantity);
    return this.updateStock(id, newStock);
  }

  // Aumentar stock (para compras)
  static async increaseStock(id: string, quantity: number): Promise<Producto> {
    const product = await this.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    const newStock = product.stock + quantity;
    return this.updateStock(id, newStock);
  }
}