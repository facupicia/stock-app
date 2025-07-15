# Sistema de Gestión de Stock de Ropa

Un sistema completo de gestión de inventario para tiendas de ropa, desarrollado con React, TypeScript, Tailwind CSS y Supabase.

## Características

- 📦 **Gestión de Inventario**: Agregar, editar y eliminar productos
- 📊 **Dashboard Completo**: Métricas de ventas, compras y stock
- 💰 **Gestión de Ventas**: Registro de ventas con cálculo automático de ganancias
- 🛒 **Gestión de Compras**: Control de reposición de stock
- 🧮 **Calculadora de Precios**: Herramienta para calcular precios de venta
- 📈 **Análisis y Gráficos**: Visualización de datos de stock y rentabilidad
- 🔍 **Búsqueda y Filtros**: Filtrado por categoría, talle, color
- ⚠️ **Alertas de Stock**: Notificaciones de stock bajo
- 📱 **Diseño Responsivo**: Optimizado para móviles y desktop

## Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Iconos**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd sistema-stock-ropa
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:
```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. Ejecuta las migraciones de la base de datos en Supabase

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── ProductForm.tsx
│   ├── ProductList.tsx
│   ├── SalesManager.tsx
│   ├── PurchaseManager.tsx
│   ├── PriceCalculator.tsx
│   └── StockChart.tsx
├── services/           # Servicios para API
│   ├── productService.ts
│   ├── salesService.ts
│   └── purchaseService.ts
├── types/              # Definiciones de tipos
│   └── Product.ts
├── lib/                # Configuración
│   └── supabase.ts
└── App.tsx             # Componente principal
```

## Base de Datos

El proyecto utiliza Supabase con las siguientes tablas:

- **productos**: Información de productos (nombre, categoría, precios, stock)
- **ventas**: Registro de ventas con cálculo de ganancias
- **compras**: Registro de compras para reposición de stock

## Funcionalidades Principales

### Dashboard
- Métricas de ventas y compras por período
- Análisis de inventario y rentabilidad
- Alertas de stock bajo
- Transacciones recientes

### Gestión de Productos
- Formulario completo para agregar productos
- Edición inline en la tabla
- Cálculo automático de márgenes
- Códigos únicos generados automáticamente

### Ventas
- Registro de ventas con validación de stock
- Cálculo automático de comisiones y ganancias
- Múltiples métodos de pago
- Actualización automática de stock

### Compras
- Registro de compras para reposición
- Actualización automática de stock y precios de costo
- Control de proveedores

### Calculadora de Precios
- Cálculo de precios considerando costos, impuestos, flete
- Soporte para múltiples monedas (USD/ARS)
- Presets para diferentes márgenes y plataformas

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en GitHub.