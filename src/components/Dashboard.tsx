import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  AlertTriangle,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface DashboardProps {
  products: Product[];
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, onRefresh }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Calcular métricas del inventario
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.precio_costo), 0);
  const totalSaleValue = products.reduce((sum, p) => sum + (p.stock * p.precio_venta), 0);
  const lowStockProducts = products.filter(p => p.stock <= (p.stock_minimo || 5));
  const outOfStockProducts = products.filter(p => p.stock === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Resumen general de tu inventario</p>
        </div>
        
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Alertas */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Alertas de Inventario</span>
          </div>
          <div className="text-sm text-yellow-700 space-y-1">
            {outOfStockProducts.length > 0 && (
              <p>• {outOfStockProducts.length} productos sin stock</p>
            )}
            {lowStockProducts.length > 0 && (
              <p>• {lowStockProducts.length} productos con stock bajo</p>
            )}
          </div>
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Productos */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Productos</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
              <p className="text-blue-100 text-sm">En inventario</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* Stock Total */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Stock Total</p>
              <p className="text-3xl font-bold">{totalStock}</p>
              <p className="text-green-100 text-sm">Unidades disponibles</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        {/* Valor Inventario */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Valor Inventario</p>
              <p className="text-3xl font-bold">${totalInventoryValue.toFixed(0)}</p>
              <p className="text-purple-100 text-sm">Valor de costo</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        {/* Ganancia Potencial */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ganancia Potencial</p>
              <p className="text-3xl font-bold">${(totalSaleValue - totalInventoryValue).toFixed(0)}</p>
              <p className="text-orange-100 text-sm">Si se vende todo</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Valor del Inventario</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor de Costo:</span>
              <span className="font-medium">${totalInventoryValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Valor de Venta:</span>
              <span className="font-medium">${totalSaleValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium text-gray-900">Ganancia Potencial:</span>
              <span className="font-bold text-green-600">${(totalSaleValue - totalInventoryValue).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estado del Stock</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Normal:</span>
              <span className="font-medium text-green-600">{totalProducts - lowStockProducts.length - outOfStockProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Bajo:</span>
              <span className="font-medium text-yellow-600">{lowStockProducts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sin Stock:</span>
              <span className="font-medium text-red-600">{outOfStockProducts.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Análisis</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Margen Promedio:</span>
              <span className="font-medium">
                {products.length > 0 
                  ? (products.reduce((sum, p) => sum + (p.margen_porcentaje || 0), 0) / products.length).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Productos Únicos:</span>
              <span className="font-medium">
                {[...new Set(products.map(p => p.categoria))].length} categorías
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precio Promedio:</span>
              <span className="font-medium">
                ${products.length > 0 ? (products.reduce((sum, p) => sum + p.precio_venta, 0) / products.length).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos con Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Productos con Stock Bajo</span>
          </h3>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 10).map((product) => (
              <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {product.categoria} • {product.talle} • {product.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {product.stock} unidades
                  </p>
                  <p className="text-xs text-gray-500">
                    Mín: {product.stock_minimo || 5}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;