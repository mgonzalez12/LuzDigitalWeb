import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Verse {
  verse: string;
  number: number;
  study?: string;
  id: number;
}

export interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Verse[];
}

interface BibleChapterState {
  currentChapter: ChapterData | null;
  loading: boolean;
  error: string | null;
}

const initialState: BibleChapterState = {
  currentChapter: null,
  loading: false,
  error: null,
};

// Async thunk para fetch de un capítulo específico
export const fetchBibleChapter = createAsyncThunk(
  'bibleChapter/fetchChapter',
  async (
    { version, book, chapter }: { version: string; book: string; chapter: string },
    { signal }
  ) => {
    const response = await fetch(
      `https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}`,
      { signal }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch Bible chapter');
    }
    const data: ChapterData = await response.json();
    return data;
  }
);

const bibleChapterSlice = createSlice({
  name: 'bibleChapter',
  initialState,
  reducers: {
    clearChapter: (state) => {
      state.currentChapter = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBibleChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBibleChapter.fulfilled, (state, action: PayloadAction<ChapterData>) => {
        state.loading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchBibleChapter.rejected, (state, action) => {
        state.loading = false;
        // Ignorar errores de cancelación (AbortError)
        if (action.error.name !== 'AbortError') {
          state.error = action.error.message || 'Failed to fetch Bible chapter';
        }
      });
  },
});

export const { clearChapter } = bibleChapterSlice.actions;
export default bibleChapterSlice.reducer;
