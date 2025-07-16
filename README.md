# Gestión de Importaciones - China

Una aplicación web especializada para gestionar importaciones de ropa y zapatillas desde China, desarrollada con React, TypeScript, Tailwind CSS y Supabase.

## Características

- 🇨🇳 **Calculadora de Costos China**: Cálculo preciso de costos de importación
- 👥 **Gestión de Sellers**: Base de datos completa de proveedores chinos
- 📊 **Dashboard de Sellers**: Métricas y análisis de proveedores
- 🔍 **Búsqueda y Filtros**: Encuentra sellers por especialidad
- 📱 **Diseño Responsivo**: Optimizado para móviles y desktop

## Funcionalidades Principales

### 🇨🇳 Calculadora de Costos China
- Cálculo de comisión de recarga (4%)
- Gestión de múltiples productos por pedido
- Cálculo de envío internacional (primer kg + kg adicionales)
- Optimización de peso para máxima eficiencia
- Conversión USD/ARS
- Análisis detallado por producto

### 👥 Gestión de Sellers
- Agregar, editar y eliminar sellers
- Especialidades por categoría (zapatillas, remeras, etc.)
- Múltiples links de catálogo por seller
- Búsqueda por nombre, especialidad o descripción
- Dashboard con métricas de sellers

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
cd gestion-importaciones-china
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
│   ├── ChinaCostCalculator.tsx
│   ├── SellerForm.tsx
│   ├── SellerList.tsx
│   └── SellerDashboard.tsx
├── services/           # Servicios para API
│   └── sellerService.ts
├── types/              # Definiciones de tipos
│   └── Seller.ts
├── lib/                # Configuración
│   └── supabase.ts
└── App.tsx             # Componente principal
```

## Base de Datos

El proyecto utiliza Supabase con las siguientes tablas:

- **sellers**: Información de sellers (nombre, especialidad, descripción)
- **seller_links**: Links de catálogos asociados a cada seller

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