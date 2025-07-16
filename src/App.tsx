import React, { useState, useEffect } from 'react';
import { Plane, Users, Search, Plus } from 'lucide-react';
import ChinaCostCalculator from './components/ChinaCostCalculator';
import SellerForm from './components/SellerForm';
import SellerList from './components/SellerList';
import SellerDashboard from './components/SellerDashboard';
import { Seller } from './types/Seller';
import { SellerService } from './services/sellerService';

function App() {
  const [activeTab, setActiveTab] = useState<'china' | 'sellers'>('china');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [sellerFilterSpecialty, setSellerFilterSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar sellers desde Supabase
  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SellerService.getAll();
      setSellers(data);
    } catch (err) {
      console.error('Error loading sellers:', err);
      setError('Error al cargar los sellers. Verifica tu conexión a Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const addSeller = async (sellerData: any) => {
    try {
      const newSeller = await SellerService.create(sellerData);
      setSellers(prev => [newSeller, ...prev]);
      return newSeller;
    } catch (err) {
      console.error('Error adding seller:', err);
      throw err;
    }
  };

  const updateSeller = async (id: string, updatedSeller: any) => {
    try {
      const updated = await SellerService.update(id, updatedSeller);
      setSellers(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      console.error('Error updating seller:', err);
      throw err;
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      await SellerService.delete(id);
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting seller:', err);
      throw err;
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
      seller.specialty.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
      (seller.description && seller.description.toLowerCase().includes(sellerSearchTerm.toLowerCase()));

    const matchesSpecialty = sellerFilterSpecialty === '' || seller.specialty === sellerFilterSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const sellerSpecialties = [...new Set(sellers.map(s => s.specialty))];

  const tabs = [
    { id: 'china', label: 'Costos China', icon: Plane },
    { id: 'sellers', label: 'Sellers', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSellers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Importaciones</h1>
                <p className="text-sm text-gray-600">Costos de China y Sellers</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* China Cost Calculator Tab */}
        {activeTab === 'china' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Calculadora de Costos de Importación desde China</h2>
            </div>
            <ChinaCostCalculator />
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="space-y-6">
            {/* Seller Dashboard */}
            <SellerDashboard sellers={sellers} onRefresh={loadSellers} />
            
            {/* Add Seller Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Seller</h2>
                </div>
              </div>
              <SellerForm onSubmit={addSeller} />
            </div>
            
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar sellers..."
                      value={sellerSearchTerm}
                      onChange={(e) => setSellerSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={sellerFilterSpecialty}
                    onChange={(e) => setSellerFilterSpecialty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las especialidades</option>
                    {sellerSpecialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {filteredSellers.length} sellers encontrados
                </div>
              </div>
            </div>

            {/* Seller List */}
            <SellerList
              sellers={filteredSellers}
              onUpdateSeller={updateSeller}
              onDeleteSeller={deleteSeller}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;