import React, { useState } from 'react';
import { ProductFormData } from '../types/Product';
import { Check, X } from 'lucide-react';

interface ProductFormProps {
  onAddProduct: (product: ProductFormData) => Promise<any>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    categoria: '',
    talle: '',
    color: '',
    precio_costo: 0,
    precio_venta: 0,
    stock: 0,
    stock_minimo: 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productTypes = [
    'Camiseta', 'Pantalón', 'Buzo', 'Zapatillas', 'Vestido',
    'Shorts', 'Campera', 'Remera', 'Jeans', 'Hoodie', 'Accesorios'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizesShoes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.categoria.trim()) newErrors.categoria = 'La categoría es requerida';
    if (!formData.talle.trim()) newErrors.talle = 'El talle es requerido';
    if (!formData.color.trim()) newErrors.color = 'El color es requerido';
    if (formData.precio_costo <= 0) newErrors.precio_costo = 'El precio de costo debe ser mayor a 0';
    if (formData.precio_venta <= 0) newErrors.precio_venta = 'El precio de venta debe ser mayor a 0';
    if (formData.precio_venta <= formData.precio_costo) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor al precio de costo';
    }
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (formData.stock_minimo && formData.stock_minimo < 0) {
      newErrors.stock_minimo = 'El stock mínimo no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onAddProduct(formData);
      setFormData({
        nombre: '',
        categoria: '',
        talle: '',
        color: '',
        precio_costo: 0,
        precio_venta: 0,
        stock: 0,
        stock_minimo: 5,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setErrors({ submit: 'Error al agregar el producto. Inténtalo de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['precio_costo', 'precio_venta', 'stock', 'stock_minimo'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">¡Producto agregado exitosamente!</span>
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
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Camiseta Nike Dri-FIT"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.nombre}</span>
              </p>
            )}
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.categoria ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccionar categoría</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.categoria}</span>
              </p>
            )}
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talle *
            </label>
            <select
              name="talle"
              value={formData.talle}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.talle ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccionar talle</option>
              {formData.categoria === 'Zapatillas' ? (
                sizesShoes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))
              ) : (
                sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))
              )}
            </select>
            {errors.talle && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.talle}</span>
              </p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.color ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Ej: Azul marino"
            />
            {errors.color && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.color}</span>
              </p>
            )}
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Costo (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_costo"
              value={formData.precio_costo}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.precio_costo ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.precio_costo && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.precio_costo}</span>
              </p>
            )}
          </div>

          {/* Sale Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio de Venta (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.precio_venta ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.precio_venta && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.precio_venta}</span>
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Inicial *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.stock && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.stock}</span>
              </p>
            )}
          </div>

          {/* Minimum Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo
            </label>
            <input
              type="number"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.stock_minimo && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <X className="h-4 w-4" />
                <span>{errors.stock_minimo}</span>
              </p>
            )}
          </div>
        </div>

        {/* Profit Margin Preview */}
        {formData.precio_costo > 0 && formData.precio_venta > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Vista Previa del Margen</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Margen de Ganancia:</span>
                <span className="font-medium ml-2">
                  {(((formData.precio_venta - formData.precio_costo) / formData.precio_costo) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-blue-700">Ganancia por Unidad:</span>
                <span className="font-medium ml-2">
                  ${(formData.precio_venta - formData.precio_costo).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Agregando...' : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;