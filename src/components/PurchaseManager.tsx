import React, { useState, useEffect } from 'react';
import { Product, Purchase, PurchaseFormData } from '../types/Product';
import { PurchaseService } from '../services/purchaseService';
import { Package, Plus, TrendingDown, X } from 'lucide-react';

interface PurchaseManagerProps {
  products: Product[];
  onProductUpdate: () => void;
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ products, onProductUpdate }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PurchaseFormData>({
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0,
    proveedor: '',
    notas: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await PurchaseService.getAll();
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
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
        precio_unitario: product.precio_costo
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.producto_id) newErrors.producto_id = 'Selecciona un producto';
    if (formData.cantidad <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (formData.precio_unitario <= 0) newErrors.precio_unitario = 'El precio debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await PurchaseService.create(formData);
      await loadPurchases();
      onProductUpdate(); // Actualizar productos en el componente padre
      
      // Reset form
      setFormData({
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0,
        proveedor: '',
        notas: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating purchase:', error);
      setErrors({ submit: 'Error al registrar la compra' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
      try {
        await PurchaseService.delete(id);
        await loadPurchases();
        onProductUpdate();
      } catch (error) {
        console.error('Error deleting purchase:', error);
        alert('Error al eliminar la compra');
      }
    }
  };

  const total = formData.cantidad * formData.precio_unitario;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando compras...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Compras</h2>
            <p className="text-sm text-gray-600">Registra la reposición de stock</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Compra</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Registrar Nueva Compra</h3>
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.producto_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nombre} - {product.categoria} (Stock actual: {product.stock})
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
                  value={formData.cantidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.cantidad ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.precio_unitario ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.precio_unitario && (
                  <p className="mt-1 text-sm text-red-600">{errors.precio_unitario}</p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre del proveedor"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre la compra..."
                />
              </div>
            </div>

            {/* Purchase Summary */}
            {formData.cantidad > 0 && formData.precio_unitario > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-3">Resumen de la Compra</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-700">Total a Pagar:</span>
                    <div className="font-medium text-lg">${total.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-purple-700">Costo por Unidad:</span>
                    <div className="font-medium">${formData.precio_unitario.toFixed(2)}</div>
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
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Historial de Compras</h3>
        </div>
        
        {purchases.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay compras registradas</h3>
            <p className="text-gray-500">Comienza registrando tu primera compra.</p>
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
                    Proveedor
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
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.productos?.nombre || 'Producto eliminado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {purchase.productos?.categoria} • {purchase.productos?.talle}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {purchase.cantidad}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${purchase.precio_unitario.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${purchase.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {purchase.proveedor || 'Sin especificar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(purchase.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar compra"
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

export default PurchaseManager;