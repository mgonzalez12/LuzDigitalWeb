import { configureStore } from '@reduxjs/toolkit';
import bibleVersionsReducer from './features/bibleVersionsSlice';
import bibleBooksReducer from './features/bibleBooksSlice';
import bibleChapterReducer from './features/bibleChapterSlice';
import bibleVersesReducer from './features/bibleVersesSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      bibleVersions: bibleVersionsReducer,
      bibleBooks: bibleBooksReducer,
      bibleChapter: bibleChapterReducer,
      bibleVerses: bibleVersesReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
