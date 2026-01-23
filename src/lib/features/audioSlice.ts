import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AmbientSoundType = 'none' | 'rain' | 'nature' | 'piano';

interface AudioState {
  currentSound: AmbientSoundType;
  isPlaying: boolean;
  volume: number;
}

const initialState: AudioState = {
  currentSound: 'none',
  isPlaying: false,
  volume: 0.5,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setSound: (state, action: PayloadAction<AmbientSoundType>) => {
      state.currentSound = action.payload;
      if (action.payload === 'none') {
        state.isPlaying = false;
      } else {
        state.isPlaying = true;
      }
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
      if (state.isPlaying && state.currentSound === 'none') {
        state.currentSound = 'rain'; // Default to rain if toggled on without selection
      }
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },
  },
});

export const { setSound, togglePlay, setVolume } = audioSlice.actions;
export default audioSlice.reducer;
