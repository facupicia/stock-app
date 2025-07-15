import React, { useState, useEffect } from 'react';
import { Product, Sale, Purchase } from '../types/Product';
import { SalesService } from '../services/salesService';
import { PurchaseService } from '../services/purchaseService';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
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
  const [salesStats, setSalesStats] = useState({
    totalVentas: 0,
    cantidadVendida: 0,
    ingresoTotal: 0,
    gananciaNeta: 0
  });
  
  const [purchaseStats, setPurchaseStats] = useState({
    totalCompras: 0,
    cantidadComprada: 0,
    gastoTotal: 0
  });

  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const [salesData, purchaseData] = await Promise.all([
        SalesService.getStats(period),
        PurchaseService.getStats(period)
      ]);
      
      setSalesStats(salesData);
      setPurchaseStats(purchaseData);

      // Cargar transacciones recientes
      const [recentSalesData, recentPurchasesData] = await Promise.all([
        SalesService.getAll(),
        PurchaseService.getAll()
      ]);

      setRecentSales(recentSalesData.slice(0, 5));
      setRecentPurchases(recentPurchasesData.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas del inventario
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.precio_costo), 0);
  const totalSaleValue = products.reduce((sum, p) => sum + (p.stock * p.precio_venta), 0);
  const lowStockProducts = products.filter(p => p.stock <= (p.stock_minimo || 5));
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const periodLabels = {
    day: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes'
  };

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
          <p className="text-gray-600">Resumen general de tu negocio</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
          </select>
          
          <button
            onClick={() => {
              onRefresh();
              loadDashboardData();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
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
        {/* Ventas */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Ventas {periodLabels[period]}</p>
              <p className="text-3xl font-bold">{salesStats.totalVentas}</p>
              <p className="text-green-100 text-sm">${salesStats.ingresoTotal.toFixed(2)} ingresos</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-200" />
          </div>
        </div>

        {/* Ganancias */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Ganancias {periodLabels[period]}</p>
              <p className="text-3xl font-bold">${salesStats.gananciaNeta.toFixed(0)}</p>
              <p className="text-blue-100 text-sm">{salesStats.cantidadVendida} unidades vendidas</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* Compras */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Compras {periodLabels[period]}</p>
              <p className="text-3xl font-bold">{purchaseStats.totalCompras}</p>
              <p className="text-purple-100 text-sm">${purchaseStats.gastoTotal.toFixed(2)} gastado</p>
            </div>
            <TrendingDown className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Inventario Total</p>
              <p className="text-3xl font-bold">{totalStock}</p>
              <p className="text-orange-100 text-sm">{totalProducts} productos</p>
            </div>
            <Package className="h-8 w-8 text-orange-200" />
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
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento</h3>
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
              <span className="text-sm text-gray-600">Rotación {periodLabels[period]}:</span>
              <span className="font-medium">
                {totalStock > 0 ? ((salesStats.cantidadVendida / totalStock) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Ticket Promedio:</span>
              <span className="font-medium">
                ${salesStats.totalVentas > 0 ? (salesStats.ingresoTotal / salesStats.totalVentas).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Recientes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
          {recentSales.length > 0 ? (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {sale.productos?.nombre || 'Producto eliminado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.cantidad} unidades • {sale.metodo_pago}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${sale.total?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.fecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay ventas recientes</p>
          )}
        </div>

        {/* Compras Recientes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compras Recientes</h3>
          {recentPurchases.length > 0 ? (
            <div className="space-y-3">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {purchase.productos?.nombre || 'Producto eliminado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {purchase.cantidad} unidades • {purchase.proveedor || 'Sin proveedor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      ${purchase.total?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(purchase.fecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay compras recientes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;