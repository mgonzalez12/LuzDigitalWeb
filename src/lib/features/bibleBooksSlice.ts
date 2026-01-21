import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BibleBook {
  name: string;
  info: string;
  byChapter: string;
}

export interface BookDetails {
  names: string[];
  abrev: string;
  chapters: number;
  testament: string;
}

export interface EnrichedBibleBook extends BibleBook {
  details?: BookDetails;
}

interface BibleBooksState {
  books: EnrichedBibleBook[];
  loading: boolean;
  error: string | null;
  currentVersion: string | null;
}

const initialState: BibleBooksState = {
  books: [],
  loading: false,
  error: null,
  currentVersion: null,
};

// Async thunk para fetch de los libros de una versión específica con detalles
export const fetchBibleBooks = createAsyncThunk(
  'bibleBooks/fetchBooks',
  async (versionCode: string) => {
    // Primero obtenemos la lista de libros
    const response = await fetch(`https://bible-api.deno.dev/api/read/${versionCode}`);
    if (!response.ok) {
      throw new Error('Failed to fetch Bible books');
    }
    const books: BibleBook[] = await response.json();

    // Luego obtenemos los detalles de cada libro
    const enrichedBooks = await Promise.all(
      books.map(async (book) => {
        try {
          // Verificar que book.info existe y es válida
          if (!book.info) {
            return book;
          }

          const detailsResponse = await fetch(`https://bible-api.deno.dev${book.info}`);
          
          if (detailsResponse.ok) {
            const details: BookDetails = await detailsResponse.json();
            return { ...book, details };
          }
          
          // Si la respuesta no es ok, retornar el libro sin detalles
          return book;
        } catch {
          // Si hay error en el fetch, retornar el libro sin detalles (silencioso)
          return book;
        }
      })
    );

    return { books: enrichedBooks, versionCode };
  }
);

const bibleBooksSlice = createSlice({
  name: 'bibleBooks',
  initialState,
  reducers: {
    clearBooks: (state) => {
      state.books = [];
      state.currentVersion = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBibleBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBibleBooks.fulfilled, (state, action: PayloadAction<{ books: EnrichedBibleBook[], versionCode: string }>) => {
        state.loading = false;
        state.books = action.payload.books;
        state.currentVersion = action.payload.versionCode;
      })
      .addCase(fetchBibleBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch Bible books';
      });
  },
});

export const { clearBooks } = bibleBooksSlice.actions;
export default bibleBooksSlice.reducer;
