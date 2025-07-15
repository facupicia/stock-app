import React, { useState, useEffect } from 'react';
import { Product, Sale, SaleFormData } from '../types/Product';
import { SalesService } from '../services/salesService';
import { ShoppingCart, Plus, Calendar, DollarSign, TrendingUp, X, Check } from 'lucide-react';

interface SalesManagerProps {
  products: Product[];
  onProductUpdate: () => void;
}

const SalesManager: React.FC<SalesManagerProps> = ({ products, onProductUpdate }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SaleFormData>({
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0,
    metodo_pago: 'efectivo',
    comision_porcentaje: 0,
    notas: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta_debito', label: 'Tarjeta de Débito' },
    { value: 'tarjeta_credito', label: 'Tarjeta de Crédito' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'mercadopago', label: 'MercadoPago' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await SalesService.getAll();
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        producto_id: productId,
        precio_unitario: product.precio_venta
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const selectedProduct = products.find(p => p.id === formData.producto_id);

    if (!formData.producto_id) newErrors.producto_id = 'Selecciona un producto';
    if (formData.cantidad <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (formData.precio_unitario <= 0) newErrors.precio_unitario = 'El precio debe ser mayor a 0';
    if (!formData.metodo_pago) newErrors.metodo_pago = 'Selecciona un método de pago';
    
    if (selectedProduct && formData.cantidad > selectedProduct.stock) {
      newErrors.cantidad = `Stock insuficiente. Disponible: ${selectedProduct.stock}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await SalesService.create(formData);
      await loadSales();
      onProductUpdate(); // Actualizar productos en el componente padre
      
      // Reset form
      setFormData({
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0,
        metodo_pago: 'efectivo',
        comision_porcentaje: 0,
        notas: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating sale:', error);
      setErrors({ submit: 'Error al registrar la venta' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
      try {
        await SalesService.delete(id);
        await loadSales();
        onProductUpdate();
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Error al eliminar la venta');
      }
    }
  };

  const selectedProduct = products.find(p => p.id === formData.producto_id);
  const total = formData.cantidad * formData.precio_unitario;
  const commission = total * (formData.comision_porcentaje / 100);
  const netProfit = selectedProduct 
    ? total - commission - (formData.cantidad * selectedProduct.precio_costo)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando ventas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Ventas</h2>
            <p className="text-sm text-gray-600">Registra y administra las ventas</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Venta</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Registrar Nueva Venta</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{errors.submit}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto *
                </label>
                <select
                  value={formData.producto_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.producto_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar producto</option>
                  {products.filter(p => p.stock > 0).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nombre} - {product.categoria} ({product.stock} disponibles)
                    </option>
                  ))}
                </select>
                {errors.producto_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.producto_id}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 999}
                  value={formData.cantidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.cantidad ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {selectedProduct && (
                  <p className="mt-1 text-xs text-gray-500">
                    Stock disponible: {selectedProduct.stock}
                  </p>
                )}
                {errors.cantidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
                )}
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Unitario *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData(prev => ({ ...prev, precio_unitario: parseFloat(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.precio_unitario ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.precio_unitario && (
                  <p className="mt-1 text-sm text-red-600">{errors.precio_unitario}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.metodo_pago ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                {errors.metodo_pago && (
                  <p className="mt-1 text-sm text-red-600">{errors.metodo_pago}</p>
                )}
              </div>

              {/* Commission */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.comision_porcentaje}
                  onChange={(e) => setFormData(prev => ({ ...prev, comision_porcentaje: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre la venta..."
                />
              </div>
            </div>

            {/* Sale Summary */}
            {selectedProduct && formData.cantidad > 0 && formData.precio_unitario > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-3">Resumen de la Venta</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total:</span>
                    <div className="font-medium">${total.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Comisión:</span>
                    <div className="font-medium">${commission.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Costo:</span>
                    <div className="font-medium">${(formData.cantidad * selectedProduct.precio_costo).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-green-700">Ganancia Neta:</span>
                    <div className="font-medium text-green-800">${netProfit.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historial de Ventas</h3>
        </div>
        
        {sales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ventas registradas</h3>
            <p className="text-gray-500">Comienza registrando tu primera venta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unit.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganancia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {sale.productos?.nombre || 'Producto eliminado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sale.productos?.categoria} • {sale.productos?.talle}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sale.cantidad}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${sale.precio_unitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${sale.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {sale.metodo_pago.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${sale.ganancia_neta?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sale.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar venta"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManager;