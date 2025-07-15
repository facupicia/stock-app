import { supabase, Venta } from '../lib/supabase';
import { ProductService } from './productService';

export class SalesService {
  // Obtener todas las ventas
  static async getAll(): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
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
      console.error('Error fetching sales:', error);
      throw error;
    }

    return data || [];
  }

  // Crear nueva venta
  static async create(venta: Omit<Venta, 'id' | 'total' | 'fecha'>): Promise<Venta> {
    try {
      // Verificar stock disponible
      const producto = await ProductService.getById(venta.producto_id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (producto.stock < venta.cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
      }

      // Calcular ganancia neta
      const total = venta.cantidad * venta.precio_unitario;
      const comision = total * (venta.comision_porcentaje || 0) / 100;
      const costo_total = venta.cantidad * producto.precio_costo;
      const ganancia_neta = total - comision - costo_total;

      // Crear la venta
      const { data, error } = await supabase
        .from('ventas')
        .insert([{
          ...venta,
          ganancia_neta
        }])
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
        console.error('Error creating sale:', error);
        throw error;
      }

      // Reducir stock del producto
      await ProductService.reduceStock(venta.producto_id, venta.cantidad);

      return data;
    } catch (error) {
      console.error('Error in sales transaction:', error);
      throw error;
    }
  }

  // Obtener ventas por período
  static async getByDateRange(startDate: string, endDate: string): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
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
      console.error('Error fetching sales by date range:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas de ventas
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
      .from('ventas')
      .select('cantidad, total, ganancia_neta')
      .gte('fecha', startDate.toISOString());

    if (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }

    const stats = data?.reduce((acc, venta) => ({
      totalVentas: acc.totalVentas + 1,
      cantidadVendida: acc.cantidadVendida + venta.cantidad,
      ingresoTotal: acc.ingresoTotal + (venta.total || 0),
      gananciaNeta: acc.gananciaNeta + (venta.ganancia_neta || 0)
    }), {
      totalVentas: 0,
      cantidadVendida: 0,
      ingresoTotal: 0,
      gananciaNeta: 0
    }) || {
      totalVentas: 0,
      cantidadVendida: 0,
      ingresoTotal: 0,
      gananciaNeta: 0
    };

    return stats;
  }

  // Eliminar venta (y restaurar stock)
  static async delete(id: string): Promise<void> {
    try {
      // Obtener la venta antes de eliminarla
      const { data: venta, error: fetchError } = await supabase
        .from('ventas')
        .select('producto_id, cantidad')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Eliminar la venta
      const { error: deleteError } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Restaurar el stock
      if (venta) {
        await ProductService.increaseStock(venta.producto_id, venta.cantidad);
      }
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }
}