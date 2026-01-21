import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Verse {
  verse: string;
  number: number;
  study?: string;
  id: number;
}

export interface VersesData {
  verses: Verse[];
  version: string;
  book: string;
  chapter: number;
  verseRange: string; // "1" o "16-17"
}

interface BibleVersesState {
  currentVerses: VersesData | null;
  loading: boolean;
  error: string | null;
}

const initialState: BibleVersesState = {
  currentVerses: null,
  loading: false,
  error: null,
};

export const fetchBibleVerses = createAsyncThunk(
  'bibleVerses/fetchVerses',
  async ({ 
    version, 
    book, 
    chapter, 
    verseRange 
  }: { 
    version: string; 
    book: string; 
    chapter: string; 
    verseRange: string;
  }, { signal }) => {
    const response = await fetch(
      `https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}/${verseRange}`,
      { signal }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Bible verses');
    }
    
    const data = await response.json();
    
    // La API devuelve diferentes formatos:
    // - Versículo individual: {verse, number, id, study}
    // - Rango de versículos: [{verse, number, id}, ...]
    
    let versesArray: Verse[];
    
    if (Array.isArray(data)) {
      // Si es un array, usar directamente
      versesArray = data;
    } else if (data && typeof data === 'object' && 'verse' in data) {
      // Si es un objeto con propiedad 'verse', convertir a array
      versesArray = [data];
    } else {
      throw new Error('Invalid API response format');
    }
    
    return {
      verses: versesArray,
      version,
      book,
      chapter: parseInt(chapter),
      verseRange,
    };
  }
);

const bibleVersesSlice = createSlice({
  name: 'bibleVerses',
  initialState,
  reducers: {
    clearVerses: (state) => {
      state.currentVerses = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBibleVerses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBibleVerses.fulfilled, (state, action: PayloadAction<VersesData>) => {
        state.loading = false;
        state.currentVerses = action.payload;
      })
      .addCase(fetchBibleVerses.rejected, (state, action) => {
        state.loading = false;
        // Ignorar errores de cancelación (AbortError)
        if (action.error.name !== 'AbortError') {
          state.error = action.error.message || 'Failed to fetch verses';
        }
      });
  },
});

export const { clearVerses } = bibleVersesSlice.actions;
export default bibleVersesSlice.reducer;
