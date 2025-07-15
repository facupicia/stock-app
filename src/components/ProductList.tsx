import React, { useState } from 'react';
import { Product } from '../types/Product';
import { Edit2, Trash2, AlertTriangle, Check, X, Package, DollarSign } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<void>;
  lowStockThreshold: number;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  lowStockThreshold
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    setIsUpdating(true);
    try {
      await onUpdateProduct(editingProduct.id, editingProduct);
      setEditingId(null);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) {
      try {
        await onDeleteProduct(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const getStockStatusColor = (stock: number, minStock: number = lowStockThreshold) => {
    if (stock <= minStock) return 'text-red-600 bg-red-50 border-red-200';
    if (stock <= minStock * 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStockStatusIcon = (stock: number, minStock: number = lowStockThreshold) => {
    if (stock <= minStock) return <AlertTriangle className="h-4 w-4" />;
    return <Package className="h-4 w-4" />;
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos en el inventario</h3>
        <p className="text-gray-500">Comienza agregando tu primer producto para gestionar el stock.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Inventario de Productos</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Talle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                {editingId === product.id ? (
                  // Editing mode
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingProduct?.nombre || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{product.codigo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingProduct?.categoria || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, categoria: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingProduct?.talle || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, talle: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editingProduct?.color || ''}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, color: e.target.value } : null)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.precio_costo || 0}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, precio_costo: parseFloat(e.target.value) } : null)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          placeholder="Costo"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct?.precio_venta || 0}
                          onChange={(e) => setEditingProduct(prev => prev ? { ...prev, precio_venta: parseFloat(e.target.value) } : null)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          placeholder="Venta"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editingProduct?.stock || 0}
                        onChange={(e) => setEditingProduct(prev => prev ? { ...prev, stock: parseInt(e.target.value) } : null)}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">Auto</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isUpdating}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{product.talle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{product.color}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center text-gray-600">
                          <span className="w-12">Costo:</span>
                          <span className="font-medium">${product.precio_costo.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-gray-900">
                          <span className="w-12">Venta:</span>
                          <span className="font-medium">${product.precio_venta.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(product.stock, product.stock_minimo)}`}>
                        {getStockStatusIcon(product.stock, product.stock_minimo)}
                        <span>{product.stock} unidades</span>
                      </div>
                      {product.stock_minimo && product.stock <= product.stock_minimo && (
                        <div className="text-xs text-red-600 mt-1">
                          Mín: {product.stock_minimo}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div className="font-medium text-green-600">
                          {product.margen_porcentaje?.toFixed(1)}%
                        </div>
                        <div className="text-gray-500">
                          ${(product.precio_venta - product.precio_costo).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.nombre)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;