import React, { useState, useEffect } from 'react';
import { PriceCalculation } from '../types/Product';
import { Calculator, DollarSign, TrendingUp, ShoppingCart, Truck, CreditCard } from 'lucide-react';

const PriceCalculator: React.FC = () => {
  const [calculation, setCalculation] = useState<PriceCalculation>({
    baseCost: 0,
    profitMargin: 0,
    importTax: 0,
    shipping: 0,
    platformCommission: 0,
    finalPrice: 0,
    breakdown: {
      cost: 0,
      profit: 0,
      tax: 0,
      shipping: 0,
      commission: 0
    }
  });

  const [usdToArsRate, setUsdToArsRate] = useState(800); // Default USD to ARS rate
  const [showInPesos, setShowInPesos] = useState(false);

  useEffect(() => {
    calculatePrice();
  }, [calculation.baseCost, calculation.profitMargin, calculation.importTax, calculation.shipping, calculation.platformCommission]);

  const calculatePrice = () => {
    const cost = calculation.baseCost;
    const tax = (cost * calculation.importTax) / 100;
    const shipping = (cost * calculation.shipping) / 100;
    const subtotal = cost + tax + shipping;
    const profit = (subtotal * calculation.profitMargin) / 100;
    const priceBeforeCommission = subtotal + profit;
    const commission = (priceBeforeCommission * calculation.platformCommission) / 100;
    const finalPrice = priceBeforeCommission + commission;

    setCalculation(prev => ({
      ...prev,
      finalPrice,
      breakdown: {
        cost,
        profit,
        tax,
        shipping,
        commission
      }
    }));
  };

  const handleInputChange = (field: keyof PriceCalculation, value: number) => {
    setCalculation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPrice = (price: number) => {
    if (showInPesos) {
      return `$${(price * usdToArsRate).toLocaleString('es-AR')} ARS`;
    }
    return `$${price.toFixed(2)} USD`;
  };

  const getPercentageOfTotal = (amount: number) => {
    if (calculation.finalPrice === 0) return 0;
    return ((amount / calculation.finalPrice) * 100).toFixed(1);
  };

  const presetMargins = [
    { label: 'Bajo (30%)', value: 30 },
    { label: 'Medio (50%)', value: 50 },
    { label: 'Alto (70%)', value: 70 },
    { label: 'Premium (100%)', value: 100 }
  ];

  const platformCommissions = [
    { label: 'MercadoLibre', value: 11.5 },
    { label: 'Tiendanube', value: 3.5 },
    { label: 'Shopify', value: 2.9 },
    { label: 'Instagram Shop', value: 5.0 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            placeholder="800"
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
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span>Datos del Producto</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Base (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={calculation.baseCost}
                  onChange={(e) => handleInputChange('baseCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen de Ganancia (%)
                </label>
                <input
                  type="number"
                  value={calculation.profitMargin}
                  onChange={(e) => handleInputChange('profitMargin', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {presetMargins.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => handleInputChange('profitMargin', preset.value)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impuestos de Importación (%)
                </label>
                <input
                  type="number"
                  value={calculation.importTax}
                  onChange={(e) => handleInputChange('importTax', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Incluye derechos de importación, IVA, etc.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flete y Logística (%)
                </label>
                <input
                  type="number"
                  value={calculation.shipping}
                  onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Envío desde China, almacenamiento, distribución
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión de Plataforma (%)
                </label>
                <input
                  type="number"
                  value={calculation.platformCommission}
                  onChange={(e) => handleInputChange('platformCommission', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {platformCommissions.map(platform => (
                    <button
                      key={platform.label}
                      onClick={() => handleInputChange('platformCommission', platform.value)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                    >
                      {platform.label} ({platform.value}%)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Resultado del Cálculo</span>
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Precio de Venta Sugerido</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(calculation.finalPrice)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Desglose de Costos</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>Costo Base</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatPrice(calculation.breakdown.cost)}</span>
                      <span className="text-xs text-gray-500 ml-2">({getPercentageOfTotal(calculation.breakdown.cost)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Impuestos</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatPrice(calculation.breakdown.tax)}</span>
                      <span className="text-xs text-gray-500 ml-2">({getPercentageOfTotal(calculation.breakdown.tax)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Flete</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatPrice(calculation.breakdown.shipping)}</span>
                      <span className="text-xs text-gray-500 ml-2">({getPercentageOfTotal(calculation.breakdown.shipping)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Ganancia</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">{formatPrice(calculation.breakdown.profit)}</span>
                      <span className="text-xs text-gray-500 ml-2">({getPercentageOfTotal(calculation.breakdown.profit)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Comisión Plataforma</span>
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatPrice(calculation.breakdown.commission)}</span>
                      <span className="text-xs text-gray-500 ml-2">({getPercentageOfTotal(calculation.breakdown.commission)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Margin Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rentabilidad</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Ganancia Neta</p>
                <p className="text-xl font-bold text-green-700">
                  {formatPrice(calculation.breakdown.profit)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Margen Real</p>
                <p className="text-xl font-bold text-blue-700">
                  {getPercentageOfTotal(calculation.breakdown.profit)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;