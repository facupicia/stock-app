import React, { useState, useEffect } from 'react';
import { Package, Calculator, Search, Plus, AlertTriangle, TrendingUp, Plane, Users } from 'lucide-react';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import PriceCalculator from './components/PriceCalculator';
import ChinaCostCalculator from './components/ChinaCostCalculator';
import SellerForm from './components/SellerForm';
import SellerList from './components/SellerList';
import SellerDashboard from './components/SellerDashboard';
import Dashboard from './components/Dashboard';
import { Product } from './types/Product';
import { Seller } from './types/Seller';
import { ProductService } from './services/productService';
import { SellerService } from './services/sellerService';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stock' | 'pricing' | 'china' | 'sellers'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [sellerFilterSpecialty, setSellerFilterSpecialty] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos desde Supabase
  useEffect(() => {
    loadProducts();
    loadSellers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos. Verifica tu conexión a Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const loadSellers = async () => {
    try {
      setError(null);
      const data = await SellerService.getAll();
      setSellers(data);
    } catch (err) {
      console.error('Error loading sellers:', err);
      setError('Error al cargar los sellers. Verifica tu conexión a Supabase.');
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'codigo' | 'created_at' | 'updated_at' | 'margen_porcentaje'>) => {
    try {
      const newProduct = await ProductService.create(productData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const updated = await ProductService.update(id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === '' || product.categoria === filterType;
    const matchesSize = filterSize === '' || product.talle === filterSize;

    return matchesSearch && matchesType && matchesSize;
  });

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
      seller.specialty.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
      (seller.description && seller.description.toLowerCase().includes(sellerSearchTerm.toLowerCase()));

    const matchesSpecialty = sellerFilterSpecialty === '' || seller.specialty === sellerFilterSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const lowStockProducts = products.filter(product => product.stock <= lowStockThreshold);

  const productTypes = [...new Set(products.map(p => p.categoria))];
  const productSizes = [...new Set(products.map(p => p.talle))];
  const sellerSpecialties = [...new Set(sellers.map(s => s.specialty))];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'pricing', label: 'Calculadora de Precios', icon: Calculator },
    { id: 'china', label: 'Costos China', icon: Plane },
    { id: 'sellers', label: 'Sellers', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
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
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Stock</h1>
                <p className="text-sm text-gray-600">Sistema completo de inventario</p>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {lowStockProducts.length} productos con stock bajo
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
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
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard products={products} onRefresh={loadProducts} />
        )}

        {/* Stock Management Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-6">
            {/* Add Product Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Producto</h2>
                </div>
              </div>
              <ProductForm onAddProduct={addProduct} />
            </div>
            
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas las categorías</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>

                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los talles</option>
                    {productSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">
                    Umbral de stock bajo:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  {filteredProducts.length} productos encontrados
                </div>
              </div>
            </div>

            {/* Product List */}
            <ProductList
              products={filteredProducts}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              lowStockThreshold={lowStockThreshold}
            />
          </div>
        )}

        {/* Price Calculator Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Calculadora de Precios de Venta</h2>
            </div>
            <PriceCalculator />
          </div>
        )}

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