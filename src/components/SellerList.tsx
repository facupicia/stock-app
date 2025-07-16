import React, { useState } from 'react';
import { Seller } from '../types/Seller';
import { Edit2, Trash2, ExternalLink, User, Tag, Calendar, MessageSquare } from 'lucide-react';
import SellerForm from './SellerForm';

interface SellerListProps {
  sellers: Seller[];
  onUpdateSeller: (id: string, seller: any) => Promise<any>;
  onDeleteSeller: (id: string) => Promise<void>;
}

const SellerList: React.FC<SellerListProps> = ({
  sellers,
  onUpdateSeller,
  onDeleteSeller
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEdit = (seller: Seller) => {
    setEditingId(seller.id);
  };

  const handleSave = async (sellerData: any) => {
    if (!editingId) return;

    setIsUpdating(true);
    try {
      await onUpdateSeller(editingId, sellerData);
      setEditingId(null);
    } catch (error) {
      console.error('Error updating seller:', error);
      alert('Error al actualizar el seller');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string, sellerName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a "${sellerName}"?`)) {
      try {
        await onDeleteSeller(id);
      } catch (error) {
        console.error('Error deleting seller:', error);
        alert('Error al eliminar el seller');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      'Zapatillas': 'bg-blue-100 text-blue-800',
      'Remeras': 'bg-green-100 text-green-800',
      'Jeans': 'bg-indigo-100 text-indigo-800',
      'Buzos': 'bg-purple-100 text-purple-800',
      'Camperas': 'bg-orange-100 text-orange-800',
      'Accesorios': 'bg-pink-100 text-pink-800',
      'Deportiva': 'bg-red-100 text-red-800',
      'Formal': 'bg-gray-100 text-gray-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  if (sellers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sellers registrados</h3>
        <p className="text-gray-500">Comienza agregando tu primer seller para gestionar tus proveedores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sellers.map((seller) => (
        <div key={seller.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
          {editingId === seller.id ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Seller</h3>
              <SellerForm
                onSubmit={handleSave}
                initialData={{
                  name: seller.name,
                  specialty: seller.specialty,
                  description: seller.description || '',
                  links: seller.links?.map(link => ({
                    name: link.name,
                    url: link.url
                  })) || [{ name: '', url: '' }]
                }}
                isEditing={true}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{seller.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecialtyColor(seller.specialty)}`}>
                        <Tag className="h-3 w-3 mr-1" />
                        {seller.specialty}
                      </span>
                    </div>
                    
                    {seller.description && (
                      <div className="flex items-start space-x-2 text-gray-600 mb-3">
                        <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{seller.description}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Agregado el {formatDate(seller.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(seller)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Editar seller"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(seller.id, seller.name)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Eliminar seller"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              {seller.links && seller.links.length > 0 && (
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Catálogos ({seller.links.length})</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {seller.links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {link.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {link.url}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SellerList;