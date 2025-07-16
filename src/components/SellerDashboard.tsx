import React, { useState, useEffect } from 'react';
import { Seller } from '../types/Seller';
import { User, Tag, ExternalLink, Search, Plus, Filter } from 'lucide-react';

interface SellerDashboardProps {
  sellers: Seller[];
  onRefresh: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellers, onRefresh }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Calcular métricas
  const totalSellers = sellers.length;
  const totalLinks = sellers.reduce((sum, seller) => sum + (seller.links?.length || 0), 0);
  const specialties = [...new Set(sellers.map(s => s.specialty))];
  const avgLinksPerSeller = totalSellers > 0 ? (totalLinks / totalSellers).toFixed(1) : '0';

  // Agrupar por especialidad
  const sellersBySpecialty = specialties.map(specialty => ({
    specialty,
    count: sellers.filter(s => s.specialty === specialty).length,
    sellers: sellers.filter(s => s.specialty === specialty)
  })).sort((a, b) => b.count - a.count);

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      'Zapatillas': 'from-blue-500 to-blue-600',
      'Remeras': 'from-green-500 to-green-600',
      'Jeans': 'from-indigo-500 to-indigo-600',
      'Buzos': 'from-purple-500 to-purple-600',
      'Camperas': 'from-orange-500 to-orange-600',
      'Accesorios': 'from-pink-500 to-pink-600',
      'Deportiva': 'from-red-500 to-red-600',
      'Formal': 'from-gray-500 to-gray-600'
    };
    return colors[specialty] || 'from-gray-500 to-gray-600';
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
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Sellers</h2>
          <p className="text-gray-600">Gestión de proveedores de China</p>
        </div>
        
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sellers */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Sellers</p>
              <p className="text-3xl font-bold">{totalSellers}</p>
              <p className="text-blue-100 text-sm">Proveedores activos</p>
            </div>
            <User className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        {/* Total Links */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Catálogos</p>
              <p className="text-3xl font-bold">{totalLinks}</p>
              <p className="text-green-100 text-sm">Links disponibles</p>
            </div>
            <ExternalLink className="h-8 w-8 text-green-200" />
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Especialidades</p>
              <p className="text-3xl font-bold">{specialties.length}</p>
              <p className="text-purple-100 text-sm">Categorías únicas</p>
            </div>
            <Tag className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        {/* Promedio Links */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Promedio Links</p>
              <p className="text-3xl font-bold">{avgLinksPerSeller}</p>
              <p className="text-orange-100 text-sm">Por seller</p>
            </div>
            <Filter className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Distribución por Especialidad */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Especialidad</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sellersBySpecialty.map(({ specialty, count, sellers: specialtySellers }) => (
            <div key={specialty} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{specialty}</h4>
                <span className="text-sm font-bold text-gray-600">{count} sellers</span>
              </div>
              
              <div className="space-y-2">
                {specialtySellers.slice(0, 3).map(seller => (
                  <div key={seller.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">{seller.name}</span>
                    <span className="text-gray-500 text-xs">
                      {seller.links?.length || 0} links
                    </span>
                  </div>
                ))}
                {specialtySellers.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    +{specialtySellers.length - 3} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sellers Recientes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sellers Agregados Recientemente</h3>
        
        <div className="space-y-3">
          {sellers.slice(0, 5).map(seller => (
            <div key={seller.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`bg-gradient-to-r ${getSpecialtyColor(seller.specialty)} p-2 rounded-lg`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{seller.name}</p>
                  <p className="text-xs text-gray-500">{seller.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {seller.links?.length || 0} catálogos
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(seller.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;