# 🔄 Redux & Bible API Integration

## ✅ Implementación Completada

### 📦 Dependencias Instaladas

```bash
npm install @reduxjs/toolkit react-redux
```

- **@reduxjs/toolkit**: ^2.x - Herramientas oficiales de Redux
- **react-redux**: ^9.x - Bindings de React para Redux

## 🏗️ Estructura de Redux

### Store (`src/lib/store.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import bibleVersionsReducer from './features/bibleVersionsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      bibleVersions: bibleVersionsReducer,
    },
  });
};
```

### Slice de Bible Versions (`src/lib/features/bibleVersionsSlice.ts`)

#### Estado
```typescript
interface BibleVersionsState {
  versions: BibleVersion[];  // Array de versiones de la Biblia
  loading: boolean;          // Estado de carga
  error: string | null;      // Mensaje de error si falla
}
```

#### Thunk Asíncrono
```typescript
export const fetchBibleVersions = createAsyncThunk(
  'bibleVersions/fetchVersions',
  async () => {
    const response = await fetch('https://bible-api.deno.dev/api/versions');
    return await response.json();
  }
);
```

### Hooks Tipados (`src/lib/hooks.ts`)

```typescript
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

### Store Provider (`src/lib/StoreProvider.tsx`)

Envuelve la aplicación para proveer el store de Redux a todos los componentes.

## 📚 Bible API Integration

### API Base URL
```
https://bible-api.deno.dev/api/
```

### Endpoints Utilizados

#### 1. Get Bible Versions
```
GET /api/versions
```

**Response:**
```json
[
  {
    "name": "Reina Valera 1960",
    "version": "rv1960",
    "uri": "/api/read/rv1960"
  },
  {
    "name": "Nueva version internacional",
    "version": "nvi",
    "uri": "/api/read/nvi"
  }
]
```

#### 2. Get All Books (Futuro)
```
GET /api/books
```

#### 3. Read Chapter (Futuro)
```
GET /api/read/{version}/{book}/{chapter}
```

**Ejemplo:**
```
GET /api/read/nvi/genesis/1
```

## 🎨 Componente: BibleVersionsSection

### Features

1. **Fetch Automático**
   - Carga las versiones al montar el componente
   - Usa Redux para estado global

2. **Estados de UI**
   - **Loading**: Spinner animado mientras carga
   - **Error**: Mensaje de error si falla la petición
   - **Success**: Grid de cards con las versiones

3. **Cards con Gradientes**
   - 6 gradientes diferentes rotan entre versiones
   - Placeholders hasta que se suban imágenes reales
   - Hover effects con `card-hover`

4. **Navegación**
   - Cada card es clickeable
   - Link a `/version/{version_code}`

### Gradientes Disponibles

```typescript
const versionGradients = [
  { bg: 'from-amber-900/20 to-zinc-900', overlay: 'from-amber-500/20 via-transparent to-blue-500/20' },
  { bg: 'from-blue-900/20 to-zinc-900', overlay: 'from-blue-500/30 via-cyan-500/20 to-transparent' },
  { bg: 'from-purple-900/20 to-zinc-900', overlay: 'from-purple-400/20 via-transparent to-pink-500/20' },
  { bg: 'from-green-900/20 to-zinc-900', overlay: 'from-green-500/20 via-transparent to-emerald-500/20' },
  { bg: 'from-red-900/20 to-zinc-900', overlay: 'from-red-500/20 via-transparent to-orange-500/20' },
  { bg: 'from-indigo-900/20 to-zinc-900', overlay: 'from-indigo-500/20 via-transparent to-blue-500/20' },
];
```

## 🔧 Uso en Componentes

### Ejemplo Básico

```typescript
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchBibleVersions } from '@/lib/features/bibleVersionsSlice';

export function MyComponent() {
  const dispatch = useAppDispatch();
  const { versions, loading, error } = useAppSelector((state) => state.bibleVersions);

  useEffect(() => {
    dispatch(fetchBibleVersions());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {versions.map(version => (
        <div key={version.version}>{version.name}</div>
      ))}
    </div>
  );
}
```

## 📋 Versiones de la Biblia Disponibles

| Nombre | Código | Idioma |
|--------|--------|--------|
| Reina Valera 1960 | `rv1960` | Español |
| Reina Valera 1995 | `rv1995` | Español |
| Nueva Versión Internacional | `nvi` | Español |
| Dios Habla Hoy | `dhh` | Español |
| Palabra de Dios para Todos | `pdt` | Español |
| King James Version | `kjv` | Inglés |

## 🎯 Próximos Pasos

### Para Agregar Más Funcionalidad

1. **Fetch de Libros**
   - Crear nuevo slice: `bibleBooksSlice.ts`
   - Endpoint: `/api/books`

2. **Fetch de Capítulos**
   - Crear nuevo slice: `bibleChaptersSlice.ts`
   - Endpoint: `/api/read/{version}/{book}/{chapter}`

3. **Búsqueda**
   - Agregar filtrado local en el state
   - O crear endpoint de búsqueda

4. **Favoritos**
   - Guardar en localStorage
   - Sincronizar con Redux

### Ejemplo de Nuevo Slice

```typescript
// src/lib/features/bibleChaptersSlice.ts
export const fetchChapter = createAsyncThunk(
  'bibleChapters/fetchChapter',
  async ({ version, book, chapter }: { version: string; book: string; chapter: number }) => {
    const response = await fetch(
      `https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}`
    );
    return await response.json();
  }
);
```

## 🚀 Testing

### Test de la API

```bash
# En tu navegador o Postman
GET https://bible-api.deno.dev/api/versions
```

Deberías ver un array de 6 versiones de la Biblia.

### Test del Componente

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000`
3. Deberías ver una sección "Versiones de la Biblia" con 6 cards
4. Cada card muestra el nombre de la versión con un gradiente de fondo

## 📝 Notas Importantes

- ✅ Redux está configurado y funcionando
- ✅ La API de la Biblia está integrada
- ✅ El componente BibleVersionsSection muestra las versiones
- ⏳ Las imágenes son placeholders (gradientes) por ahora
- ⏳ Falta implementar la navegación a páginas individuales de versiones

## 🔗 Enlaces Útiles

- [Bible API Docs](https://docs-bible-api.netlify.app/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
