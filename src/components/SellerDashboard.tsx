import React from 'react';
import { Seller } from '../types/Seller';
import { User, Tag, ExternalLink } from 'lucide-react';

interface SellerDashboardProps {
  sellers: Seller[];
  onRefresh: () => void;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellers }) => {
  // Calcular métricas básicas
  const totalSellers = sellers.length;
  const totalLinks = sellers.reduce((sum, seller) => sum + (seller.links?.length || 0), 0);
  const specialties = [...new Set(sellers.map(s => s.specialty))];
  const avgLinksPerSeller = totalSellers > 0 ? (totalLinks / totalSellers).toFixed(1) : '0';

  return (
    <div className="space-y-6">
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
            <ExternalLink className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;