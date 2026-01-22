import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';

export interface BibleVersion {
  name: string;
  version: string;
  uri: string;
}

interface BibleVersionsState {
  versions: BibleVersion[];
  selectedVersion: string;
  loading: boolean;
  error: string | null;
}

const initialState: BibleVersionsState = {
  versions: [],
  selectedVersion: 'rv1960', // Versión por defecto
  loading: false,
  error: null,
};

// Async thunk para fetch de las versiones de la Biblia
export const fetchBibleVersions = createAsyncThunk(
  'bibleVersions/fetchVersions',
  async () => {
    // Preferimos Supabase (evita dependencia de endpoint externo).
    const { data, error } = await supabase
      .from('bible_versions')
      .select('code,name')
      .order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((v: any) => ({
        name: v.name,
        version: v.code,
        uri: '',
      })) as BibleVersion[];
    }

    // Fallback: API externa (por compatibilidad si aún no hay tabla sembrada)
    const response = await fetch('https://bible-api.deno.dev/api/versions');
    if (!response.ok) {
      throw new Error('Failed to fetch Bible versions');
    }
    return (await response.json()) as BibleVersion[];
  }
);

const bibleVersionsSlice = createSlice({
  name: 'bibleVersions',
  initialState,
  reducers: {
    setSelectedVersion: (state, action: PayloadAction<string>) => {
      state.selectedVersion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBibleVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBibleVersions.fulfilled, (state, action: PayloadAction<BibleVersion[]>) => {
        state.loading = false;
        state.versions = action.payload;
        // Establecer la primera versión como seleccionada si no hay ninguna
        if (action.payload.length > 0 && !state.selectedVersion) {
          state.selectedVersion = action.payload[0].version;
        }
      })
      .addCase(fetchBibleVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Bible versions';
      });
  },
});

export const { setSelectedVersion } = bibleVersionsSlice.actions;
export default bibleVersionsSlice.reducer;
