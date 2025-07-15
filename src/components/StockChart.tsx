import React, { useMemo } from 'react';
import { Product } from '../types/Product';
import { BarChart3, TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react';

interface StockChartProps {
  products: Product[];
}

const StockChart: React.FC<StockChartProps> = ({ products }) => {
  const chartData = useMemo(() => {
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.categoria]) {
        acc[product.categoria] = {
          categoria: product.categoria,
          totalStock: 0,
          productCount: 0,
          totalCostValue: 0,
          totalSaleValue: 0,
          lowStockCount: 0
        };
      }
      acc[product.categoria].totalStock += product.stock;
      acc[product.categoria].productCount += 1;
      acc[product.categoria].totalCostValue += product.stock * product.precio_costo;
      acc[product.categoria].totalSaleValue += product.stock * product.precio_venta;
      
      if (product.stock <= (product.stock_minimo || 5)) {
        acc[product.categoria].lowStockCount += 1;
      }
      
      return acc;
    }, {} as Record<string, { 
      categoria: string; 
      totalStock: number; 
      productCount: number; 
      totalCostValue: number;
      totalSaleValue: number;
      lowStockCount: number;
    }>);

    return Object.values(categoryStats).sort((a, b) => b.totalStock - a.totalStock);
  }, [products]);

  const maxStock = Math.max(...chartData.map(item => item.totalStock), 1);
  const totalStock = chartData.reduce((sum, item) => sum + item.totalStock, 0);
  const totalCostValue = chartData.reduce((sum, item) => sum + item.totalCostValue, 0);
  const totalSaleValue = chartData.reduce((sum, item) => sum + item.totalSaleValue, 0);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= (p.stock_minimo || 5)).length;

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos para mostrar</h3>
        <p className="text-gray-500">Agrega productos para ver el análisis de stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Productos</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Stock Total</p>
              <p className="text-3xl font-bold">{totalStock}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Valor Costo</p>
              <p className="text-3xl font-bold">${totalCostValue.toFixed(0)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Valor Venta</p>
              <p className="text-3xl font-bold">${totalSaleValue.toFixed(0)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock por Categoría</h3>
        
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={item.categoria} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.categoria}</span>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{item.productCount} productos</span>
                  <span className="font-medium">{item.totalStock} unidades</span>
                  <span className="text-green-600">${item.totalSaleValue.toFixed(0)}</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-500 ease-out`}
                  style={{ width: `${(item.totalStock / maxStock) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{((item.totalStock / totalStock) * 100).toFixed(1)}% del total</span>
                <span>Ganancia potencial: ${(item.totalSaleValue - item.totalCostValue).toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span>Análisis de Stock Bajo</span>
        </h3>
        
        {lowStockProducts > 0 ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  {lowStockProducts} de {totalProducts} productos tienen stock bajo
                </span>
              </div>
            </div>

            {chartData.map((item, index) => {
              const lowStockPercentage = (item.lowStockCount / item.productCount) * 100;
              
              return (
                <div key={item.categoria} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm font-medium text-gray-700">{item.categoria}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {item.lowStockCount} de {item.productCount} productos
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      lowStockPercentage > 50 ? 'bg-red-100 text-red-800' :
                      lowStockPercentage > 25 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lowStockPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-700 font-medium">¡Excelente! No hay productos con stock bajo</p>
            <p className="text-green-600 text-sm">Todos los productos tienen stock suficiente</p>
          </div>
        )}
      </div>

      {/* Profitability Analysis */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rentabilidad por Categoría</h3>
        
        <div className="space-y-4">
          {chartData.map((item, index) => {
            const profitMargin = ((item.totalSaleValue - item.totalCostValue) / item.totalCostValue) * 100;
            const profit = item.totalSaleValue - item.totalCostValue;
            
            return (
              <div key={item.categoria} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                    <span className="font-medium text-gray-900">{item.categoria}</span>
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    profitMargin > 50 ? 'bg-green-100 text-green-800' :
                    profitMargin > 25 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profitMargin.toFixed(1)}% margen
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valor Costo:</span>
                    <div className="font-medium">${item.totalCostValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Venta:</span>
                    <div className="font-medium">${item.totalSaleValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ganancia Potencial:</span>
                    <div className="font-medium text-green-600">${profit.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockChart;