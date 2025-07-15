import React, { useState, useEffect } from 'react';
import { Plane, Package, Calculator, DollarSign, Weight, Truck, CreditCard, AlertCircle } from 'lucide-react';

interface ProductCost {
  price: number;
  internalShipping: number;
  weight: number; // en gramos
}

interface ChinaCostCalculation {
  products: ProductCost[];
  totalProductCost: number;
  rechargeCommission: number;
  internationalShipping: number;
  serviceCharge: number;
  totalCost: number;
  costPerProduct: number;
  totalWeight: number;
}

const ChinaCostCalculator: React.FC = () => {
  const [products, setProducts] = useState<ProductCost[]>([
    { price: 0, internalShipping: 1, weight: 200 }
  ]);
  
  const [calculation, setCalculation] = useState<ChinaCostCalculation>({
    products: [],
    totalProductCost: 0,
    rechargeCommission: 0,
    internationalShipping: 0,
    serviceCharge: 4,
    totalCost: 0,
    costPerProduct: 0,
    totalWeight: 0
  });

  const [usdToArsRate, setUsdToArsRate] = useState(1200);
  const [showInPesos, setShowInPesos] = useState(false);

  useEffect(() => {
    calculateCosts();
  }, [products]);

  const calculateCosts = () => {
    const totalProductCost = products.reduce((sum, product) => 
      sum + product.price + product.internalShipping, 0
    );
    
    const totalWeight = products.reduce((sum, product) => sum + product.weight, 0);
    
    // Comisión por recarga (4%)
    const rechargeCommission = totalProductCost * 0.04;
    
    // Costo de envío internacional
    const weightInKg = totalWeight / 1000;
    let internationalShipping = 24.46; // Primer kg
    
    if (weightInKg > 1) {
      const extraKg = Math.ceil(weightInKg - 1);
      internationalShipping += extraKg * 9.08;
    }
    
    const serviceCharge = 4;
    const totalCost = totalProductCost + rechargeCommission + internationalShipping + serviceCharge;
    const costPerProduct = products.length > 0 ? totalCost / products.length : 0;

    setCalculation({
      products,
      totalProductCost,
      rechargeCommission,
      internationalShipping,
      serviceCharge,
      totalCost,
      costPerProduct,
      totalWeight
    });
  };

  const addProduct = () => {
    setProducts([...products, { price: 0, internalShipping: 1, weight: 200 }]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof ProductCost, value: number) => {
    const updatedProducts = products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const formatPrice = (price: number) => {
    if (showInPesos) {
      return `$${(price * usdToArsRate).toLocaleString('es-AR')} ARS`;
    }
    return `$${price.toFixed(2)} USD`;
  };

  const getWeightEfficiency = () => {
    const optimalWeight = 5999; // gramos
    const currentWeight = calculation.totalWeight;
    
    if (currentWeight <= optimalWeight) {
      const remaining = optimalWeight - currentWeight;
      return {
        status: 'good',
        message: `Puedes agregar ${remaining}g más para optimizar el envío`,
        color: 'text-green-600'
      };
    } else {
      const excess = currentWeight - optimalWeight;
      return {
        status: 'warning',
        message: `Excedes el peso óptimo por ${excess}g`,
        color: 'text-yellow-600'
      };
    }
  };

  const weightEfficiency = getWeightEfficiency();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Currency Toggle */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Tipo de cambio USD a ARS:
          </label>
          <input
            type="number"
            value={usdToArsRate}
            onChange={(e) => setUsdToArsRate(parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1200"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">USD</span>
          <button
            onClick={() => setShowInPesos(!showInPesos)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showInPesos ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showInPesos ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">ARS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>Productos a Importar</span>
              </h3>
              <button
                onClick={addProduct}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Agregar Producto
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {products.map((product, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Producto {index + 1}
                    </span>
                    {products.length > 1 && (
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Precio (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Envío Interno (USD)
                      </label>
                      <select
                        value={product.internalShipping}
                        onChange={(e) => updateProduct(index, 'internalShipping', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value={0.5}>$0.50</option>
                        <option value={1}>$1.00</option>
                        <option value={1.5}>$1.50</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Peso (gramos)
                      </label>
                      <input
                        type="number"
                        value={product.weight}
                        onChange={(e) => updateProduct(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Optimization */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Weight className="h-5 w-5 text-purple-600" />
              <span>Optimización de Peso</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peso Total:</span>
                <span className="font-medium">{calculation.totalWeight}g ({(calculation.totalWeight/1000).toFixed(2)}kg)</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Peso Óptimo:</span>
                <span className="font-medium">5,999g (5.99kg)</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    calculation.totalWeight <= 5999 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min((calculation.totalWeight / 5999) * 100, 100)}%` }}
                />
              </div>
              
              <div className={`flex items-center space-x-2 ${weightEfficiency.color}`}>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{weightEfficiency.message}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-green-600" />
              <span>Cálculo de Costos</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Costo Total</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatPrice(calculation.totalCost)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(calculation.costPerProduct)} por producto
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Desglose de Costos</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>Productos + Envío Interno</span>
                    </span>
                    <span className="text-sm font-medium">{formatPrice(calculation.totalProductCost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Comisión Recarga (4%)</span>
                    </span>
                    <span className="text-sm font-medium">{formatPrice(calculation.rechargeCommission)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <Plane className="h-4 w-4" />
                      <span>Envío Internacional</span>
                    </span>
                    <span className="text-sm font-medium">{formatPrice(calculation.internationalShipping)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Cargo por Servicio</span>
                    </span>
                    <span className="text-sm font-medium">{formatPrice(calculation.serviceCharge)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Envío</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Primer kg:</span>
                <span className="font-medium">$24.46</span>
              </div>
              
              {calculation.totalWeight > 1000 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Kg adicionales ({Math.ceil((calculation.totalWeight/1000) - 1)}kg):
                  </span>
                  <span className="font-medium">
                    ${(Math.ceil((calculation.totalWeight/1000) - 1) * 9.08).toFixed(2)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cargo por servicio:</span>
                <span className="font-medium">$4.00</span>
              </div>
              
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Total Envío:</span>
                <span className="font-bold">${(calculation.internationalShipping + calculation.serviceCharge).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cost per Product Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis por Producto</h3>
            
            <div className="space-y-3">
              {products.map((product, index) => {
                const productTotal = product.price + product.internalShipping;
                const productShare = productTotal / calculation.totalProductCost;
                const allocatedShipping = (calculation.internationalShipping + calculation.serviceCharge) * productShare;
                const allocatedCommission = calculation.rechargeCommission * productShare;
                const totalProductCost = productTotal + allocatedShipping + allocatedCommission;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">Producto {index + 1}</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(totalProductCost)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Producto + envío interno:</span>
                        <span>{formatPrice(productTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío asignado:</span>
                        <span>{formatPrice(allocatedShipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comisión asignada:</span>
                        <span>{formatPrice(allocatedCommission)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChinaCostCalculator;