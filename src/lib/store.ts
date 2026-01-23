import { configureStore } from '@reduxjs/toolkit';
import bibleVersionsReducer from './features/bibleVersionsSlice';
import bibleBooksReducer from './features/bibleBooksSlice';
import bibleChapterReducer from './features/bibleChapterSlice';
import bibleVersesReducer from './features/bibleVersesSlice';
import authReducer from './features/authSlice';
import audioReducer from './features/audioSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      bibleVersions: bibleVersionsReducer,
      bibleBooks: bibleBooksReducer,
      bibleChapter: bibleChapterReducer,
      bibleVerses: bibleVersesReducer,
      auth: authReducer,
      audio: audioReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
