import React, { useState } from 'react';
import { SellerFormData, SPECIALTIES } from '../types/Seller';
import { Check, X, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SellerFormProps {
  onSubmit: (seller: SellerFormData) => Promise<any>;
  initialData?: SellerFormData;
  isEditing?: boolean;
  onCancel?: () => void;
}

const SellerForm: React.FC<SellerFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEditing = false, 
  onCancel 
}) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState<SellerFormData>(
    initialData || {
      name: '',
      specialty: '',
      description: '',
      links: [{ name: '', url: '' }]
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si no es admin, no mostrar el formulario
  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Acceso Restringido</h3>
        <p className="text-yellow-700">Solo los administradores pueden agregar o editar sellers.</p>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.specialty.trim()) newErrors.specialty = 'La especialidad es requerida';
    
    // Validar que al menos un link esté completo
    const validLinks = formData.links.filter(link => link.name.trim() && link.url.trim());
    if (validLinks.length === 0) {
      newErrors.links = 'Debe agregar al menos un link de catálogo';
    }

    // Validar URLs
    formData.links.forEach((link, index) => {
      if (link.url.trim() && !isValidUrl(link.url.trim())) {
        newErrors[`link_${index}`] = 'URL inválida';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      if (!isEditing) {
        setFormData({
          name: '',
          specialty: '',
          description: '',
          links: [{ name: '', url: '' }]
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting seller:', error);
      setErrors({ submit: 'Error al guardar el seller. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SellerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { name: '', url: '' }]
    }));
  };

  const removeLink = (index: number) => {
    if (formData.links.length > 1) {
      setFormData(prev => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
    
    if (errors[`link_${index}`]) {
      setErrors(prev => ({ ...prev, [`link_${index}`]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {showSuccess && !isEditing && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">¡Seller agregado exitosamente!</span>
        </div>
      )}

      {errors.submit && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <X className="h-5 w-5 text-red-600" />
          <span className="text-red-800 font-medium">{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seller Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Seller *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: RepsMaster, TopSeller, etc."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad *
            </label>
            <select
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.specialty ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccionar especialidad</option>
              {SPECIALTIES.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            {errors.specialty && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.specialty}</span>
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Información adicional sobre el seller, calidad, tiempos de entrega, etc."
          />
        </div>

        {/* Links Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Links de Catálogo *
            </label>
            <button
              type="button"
              onClick={addLink}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Link</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.links.map((link, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Link {index + 1}
                  </span>
                  {formData.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nombre del Catálogo
                    </label>
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => updateLink(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ej: Zapatillas Jordan, Remeras Nike..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      URL del Catálogo
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                          errors[`link_${index}`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="https://seller.x.yupoo.com/albums"
                      />
                      {link.url && isValidUrl(link.url) && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {errors[`link_${index}`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`link_${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.links && (
            <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
              <X className="h-4 w-4" />
              <span>{errors.links}</span>
            </p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting 
              ? (isEditing ? 'Actualizando...' : 'Agregando...') 
              : (isEditing ? 'Actualizar Seller' : 'Agregar Seller')
            }
          </button>
          
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SellerForm;