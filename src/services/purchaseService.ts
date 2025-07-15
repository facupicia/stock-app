import { supabase, Compra } from '../lib/supabase';
import { ProductService } from './productService';

export class PurchaseService {
  // Obtener todas las compras
  static async getAll(): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        productos (
          id,
          codigo,
          nombre,
          categoria,
          talle,
          color
        )
      `)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }

    return data || [];
  }

  // Crear nueva compra
  static async create(compra: Omit<Compra, 'id' | 'total' | 'fecha'>): Promise<Compra> {
    try {
      // Crear la compra
      const { data, error } = await supabase
        .from('compras')
        .insert([compra])
        .select(`
          *,
          productos (
            id,
            codigo,
            nombre,
            categoria,
            talle,
            color
          )
        `)
        .single();

      if (error) {
        console.error('Error creating purchase:', error);
        throw error;
      }

      // Aumentar stock del producto
      await ProductService.increaseStock(compra.producto_id, compra.cantidad);

      // Actualizar precio de costo si es diferente
      const producto = await ProductService.getById(compra.producto_id);
      if (producto && producto.precio_costo !== compra.precio_unitario) {
        await ProductService.update(compra.producto_id, {
          precio_costo: compra.precio_unitario
        });
      }

      return data;
    } catch (error) {
      console.error('Error in purchase transaction:', error);
      throw error;
    }
  }

  // Obtener compras por período
  static async getByDateRange(startDate: string, endDate: string): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        productos (
          id,
          codigo,
          nombre,
          categoria,
          talle,
          color
        )
      `)
      .gte('fecha', startDate)
      .lte('fecha', endDate)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching purchases by date range:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas de compras
  static async getStats(period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const { data, error } = await supabase
      .from('compras')
      .select('cantidad, total')
      .gte('fecha', startDate.toISOString());

    if (error) {
      console.error('Error fetching purchase stats:', error);
      throw error;
    }

    const stats = data?.reduce((acc, compra) => ({
      totalCompras: acc.totalCompras + 1,
      cantidadComprada: acc.cantidadComprada + compra.cantidad,
      gastoTotal: acc.gastoTotal + (compra.total || 0)
    }), {
      totalCompras: 0,
      cantidadComprada: 0,
      gastoTotal: 0
    }) || {
      totalCompras: 0,
      cantidadComprada: 0,
      gastoTotal: 0
    };

    return stats;
  }

  // Obtener compras por proveedor
  static async getBySupplier(proveedor: string): Promise<Compra[]> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        productos (
          id,
          codigo,
          nombre,
          categoria,
          talle,
          color
        )
      `)
      .eq('proveedor', proveedor)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching purchases by supplier:', error);
      throw error;
    }

    return data || [];
  }

  // Eliminar compra (y reducir stock)
  static async delete(id: string): Promise<void> {
    try {
      // Obtener la compra antes de eliminarla
      const { data: compra, error: fetchError } = await supabase
        .from('compras')
        .select('producto_id, cantidad')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Eliminar la compra
      const { error: deleteError } = await supabase
        .from('compras')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Reducir el stock
      if (compra) {
        await ProductService.reduceStock(compra.producto_id, compra.cantidad);
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  }
}