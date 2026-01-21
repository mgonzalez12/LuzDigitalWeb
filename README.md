# 💡 Luz Digital

> La Palabra en Nueva Luz

Una experiencia digital moderna y open-source para el cristiano contemporáneo. Sumérgete en la espiritualidad con diseño de alta tecnología.

## ✨ Características Principales

### 🎯 Experiencia Sin Presión
- **Recordatorios suaves** - Recordatorios gentiles que respetan tu ritmo
- **Refuerzo positivo** - Celebraciones tranquilas de tu progreso
- **Indicadores de progreso tranquilos** - Seguimiento discreto y motivador
- **Sin gamificación agresiva** - Enfoque en la conexión espiritual, no en puntos

### 📖 Funcionalidades
- **Resaltado diario de versículos** - Destacados especiales para reflexión diaria
- **Racha de lectura** - Seguimiento de tu jornada con celebraciones suaves
- **Transiciones fluidas** - Navegación elegante entre capítulos
- **Modo de concentración** - Lectura sin distracciones para inmersión total
- **Música de fondo opcional** - Sonidos ambientales para crear atmósfera de paz
- **🌓 Modo claro/oscuro** - Cambia entre temas según tu preferencia o momento del día

## 🚀 Comenzar

### Pre-requisitos
- Node.js 20+ (recomendado usar la versión especificada en `.nvmrc`)
- npm, yarn, pnpm o bun

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 🎨 Tecnologias

- **Next.js 16.1.4** - Framework React para produção
- **Tailwind CSS 4** - Framework de CSS utilitário
- **TypeScript** - Tipagem estática para JavaScript
- **React 19** - Biblioteca para interfaces de usuário

## 🏗️ Estructura del Proyecto

```
luz-digital-web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Página principal (Home)
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── globals.css        # Estilos globales
│   │   ├── busqueda/          # Ruta de búsqueda
│   │   │   └── page.tsx       # Página de búsqueda y navegación rápida
│   │   └── leer/              # Ruta de lectura
│   │       └── [libro]/
│   │           └── [capitulo]/
│   │               └── page.tsx  # Vista de capítulo completo
│   ├── components/            # Componentes reutilizables
│   │   ├── Header.tsx             # Barra de navegación superior
│   │   ├── Sidebar.tsx            # Navegación lateral (reader)
│   │   ├── SearchBar.tsx          # Barra de búsqueda
│   │   ├── FastNavigation.tsx     # Navegación rápida a libros/capítulos
│   │   ├── FloatingActions.tsx    # Acciones flotantes (lectura)
│   │   ├── VerseOfDayCard.tsx     # Tarjeta de versículo del día
│   │   ├── BibleVersionsSection.tsx # Sección de versiones de la Biblia
│   │   ├── ThemeProvider.tsx      # Proveedor de temas
│   │   ├── ThemeToggle.tsx        # Botón de cambio de tema
│   │   ├── ReadingStreak.tsx      # Racha de lectura
│   │   ├── DailyVerse.tsx         # Versículo del día
│   │   ├── GentleReminder.tsx     # Recordatorio suave
│   │   ├── FocusMode.tsx          # Modo de concentración
│   │   └── ProgressIndicator.tsx  # Indicador de progreso tranquilo
│   └── lib/                   # Redux y utilidades
│       ├── store.ts               # Configuración de Redux store
│       ├── hooks.ts               # Hooks tipados de Redux
│       ├── StoreProvider.tsx      # Provider de Redux
│       └── features/
│           └── bibleVersionsSlice.ts  # Slice de versiones de la Biblia
├── public/                    # Archivos estáticos
└── package.json              # Dependencias del proyecto
```

## 🎯 Principios de Diseño

### UX-Focused
- **Ritual Digital Tranquilo** - Crear un espacio de paz y reflexión
- **Diseño Minimalista** - Interfaz limpia que no distrae de la Palabra
- **Responsive Total** - Experiencia perfecta en cualquier dispositivo
- **Temas Claro/Oscuro** - Adaptable a tus preferencias y reduce cansancio visual
- **Micro-interacciones** - Feedback sutil y elegante

### Valores
- **Open Source** - Transparencia total y crecimiento comunitario
- **Accesibilidad** - Disponible para todos
- **Performance** - Rápido y eficiente
- **Privacidad** - Tus datos espirituales son tuyos

## 📱 Responsividad

El diseño es totalmente responsive y optimizado para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint
```

## 🎨 Personalización

### Temas

#### Modo Oscuro (por defecto)
- **Background**: `#0a0a0a` (Negro profundo)
- **Text**: `#ededed` (Blanco suave)
- **Secondary**: `#a1a1aa` (Gris suave)

#### Modo Claro
- **Background**: `#ffffff` (Blanco)
- **Text**: `#0f172a` (Azul oscuro)
- **Secondary**: `#475569` (Gris azulado)

#### Colores de Acento (ambos modos)
- **Primary Blue**: `#3b82f6` (Azul vibrante)
- **Blue Light**: `#60a5fa` (Azul claro)

### Efectos
- Efectos de glow azul para destacar elementos importantes
- Gradientes sutiles para crear profundidad
- Transiciones suaves para todas las interacciones
- Toggle de tema con persistencia en localStorage

## 🌟 Características Implementadas

### 🎨 Diseño y Navegación
- ✅ Header fijo con navegación responsive
- ✅ Hero section con gradientes y animaciones
- ✅ Sección de capítulos con cards interactivas
- ✅ Sección de características
- ✅ Footer completo con enlaces
- ✅ **Toggle de tema claro/oscuro**
- ✅ **Interfaz completamente en español**
- ✅ Responsive design para todos los dispositivos
- ✅ Efectos hover y transiciones suaves
- ✅ **Página de búsqueda avanzada** (`/busqueda`)

### 🙏 Componentes Espirituales Interactivos

#### 📖 Versículo del Día (`DailyVerse`)
- Resaltado diario de versículos con diseño elegante
- Sistema de guardado en favoritos
- Cambio automático basado en la fecha
- Diseño inspirador con gradientes cálidos

#### 🔥 Racha de Lectura (`ReadingStreak`)
- Seguimiento de días consecutivos de lectura
- Celebración suave y no intrusiva al registrar lectura
- Indicador visual de progreso semanal
- Persistencia de datos en localStorage
- Refuerzo positivo sin gamificación agresiva

#### 🔔 Recordatorio Suave (`GentleReminder`)
- Configuración de hora preferida para lectura
- Notificaciones gentiles y respetuosas
- Diseño no invasivo
- Personalización completa

#### 👁️ Modo de Concentración (`FocusMode`)
- Lectura sin distracciones
- 4 opciones de sonido ambiental:
  - 🔇 Silencio
  - 🌧️ Lluvia
  - 🌿 Naturaleza
  - 🎹 Piano suave
- Toggle fácil para activar/desactivar
- Transiciones fluidas

#### 📊 Indicador de Progreso Tranquilo (`ProgressIndicator`)
- Seguimiento visual discreto del progreso de lectura
- Barras de progreso con animaciones suaves
- Indicador por libro bíblico
- Progreso general sin presión
- Mensaje motivador positivo

### 🔍 Página de Búsqueda (`/busqueda`)

Una experiencia de búsqueda moderna y elegante con navegación rápida a cualquier pasaje bíblico.

#### 🔎 Barra de Búsqueda (`SearchBar`)
- Campo de búsqueda con icono de lupa
- Placeholder: "Buscar palabras clave o versículos..."
- Botón ESC para cerrar/volver
- Diseño oscuro con efectos de enfoque
- Soporte para búsqueda por palabras clave

#### 🧭 Navegación Rápida (`FastNavigation`)
- **Selección de versión bíblica**:
  - NVI - Nueva Versión Internacional
  - RVR60 - Reina Valera 1960
  - NVI - New International Version
  - KJV - King James Version
- **Selección de libro**: Todos los libros de la Biblia
- **Selección de capítulo**: Hasta 50 capítulos
- **Botón "Leer Ahora"**: Con icono de libro y flecha
- Diseño con gradientes azul/púrpura
- Efectos de glow y blur para profundidad
- Dropdowns personalizados con iconos

#### 🎨 Diseño Visual
- Fondo con gradiente oscuro y elementos decorativos
- Elementos flotantes con blur
- Animaciones de fade-in escalonadas
- Footer minimalista: "LUZ DIGITAL • ADVANCED BIBLE ENGINE"
- Totalmente responsive

### 📖 Vista de Lectura (`/leer/[libro]/[capitulo]`)

Una experiencia de lectura inmersiva y completa para estudiar la Biblia.

#### 🎨 Componentes Principales

##### Sidebar (`Sidebar`)
- **Logo y Branding**: "Luz Digital WEB READER"
- **Navegación Principal**:
  - Home (icono casa)
  - Library (icono libro) - destacado cuando activo
  - Search (icono lupa)
  - Profile (icono persona)
  - Bookmarks (icono marcador)
- **Reading Plan**: 
  - Nombre del plan: "Wisdom Path"
  - Barra de progreso visual (85%)
- **Settings**: Acceso a configuración
- **Diseño**: Fixed sidebar, dark theme, iconos SVG

##### Top Bar
- **Breadcrumbs**: Navegación jerárquica
  - Antiguo/Nuevo Testamento > Libro > Capítulo
- **Racha de Días**: 
  - Icono de llama 🔥
  - Contador de días consecutivos
  - Diseño con badge naranja
- **Botón Compartir**: "Compartir Versículo"

##### Verse of the Day Card (`VerseOfDayCard`)
- Versículo destacado del día
- Referencia bíblica
- Botón "Reflexionar"
- Diseño card con fondo claro/oscuro

##### Chapter Content
- **Título del Capítulo**: Grande, centrado, bold
- **Featured Image Card**:
  - Imagen de tema (gradiente de placeholder)
  - Título y subtítulo superpuestos
  - "The Divine Shepherd"
  - "A meditation on protection and abundance"
- **Verses Display**:
  - Versículos numerados
  - Número en badge azul
  - Texto con espaciado generoso
  - Hover effect para interactividad

##### Floating Actions (`FloatingActions`)
- **3 botones flotantes** (fijos a la derecha):
  1. **TT**: Ajustar tamaño de texto
  2. **👁️**: Toggle mostrar/ocultar notas
  3. **✏️**: Añadir notas o resaltados
- Hover effects con escala
- Cambio a azul al pasar el mouse

##### Additional Sections
- **"A Través del Valle"**: Sección expandible
- Botón + para más contenido
- Reflexiones y recursos relacionados

#### 🎯 Características de UX
- ✅ **Layout de 3 columnas**: Sidebar + Content + Floating Actions
- ✅ **Breadcrumbs para navegación** contextual
- ✅ **Racha de lectura** visible para motivación
- ✅ **Versículos interactivos** con hover
- ✅ **Acciones rápidas** siempre accesibles
- ✅ **Diseño inmersivo** con imágenes y tipografía grande
- ✅ **Responsive** para todos los dispositivos
- ✅ **Tema oscuro** optimizado para lectura prolongada

## 📄 Licencia

Este proyecto es open-source. Hecho con fe y código abierto.

## 🤝 Contribuyendo

¡Las contribuciones son bienvenidas! Este es un proyecto de la comunidad, para la comunidad.

---

**© 2026 Luz Digital** - Llevando la espiritualidad al próximo nivel digital.
