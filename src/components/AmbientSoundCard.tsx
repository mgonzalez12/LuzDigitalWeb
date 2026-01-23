'use client';

import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { setSound, AmbientSoundType } from '@/lib/features/audioSlice';

export function AmbientSoundCard() {
  const { currentSound } = useAppSelector((state) => state.audio);
  const dispatch = useAppDispatch();
  
  // Si hay un sonido seleccionado (que no sea 'none'), el modo está activo
  const isSoundActive = currentSound !== 'none';

  const toggleSound = () => {
    if (isSoundActive) {
      dispatch(setSound('none'));
    } else {
      // Por defecto activar lluvia si se enciende sin selección previa
      dispatch(setSound('rain'));
    }
  };

  const sounds = [
    { value: 'none', label: 'Silencio', icon: '🔇' },
    { value: 'rain', label: 'Lluvia', icon: '🌧️' },
    { value: 'nature', label: 'Naturaleza', icon: '🌿' },
    { value: 'piano', label: 'Piano', icon: '🎹' }
  ];

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
            🔊
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Sonidos</h3>
            <p className="text-xs text-indigo-200/70">{isSoundActive ? 'Activado' : 'Desactivado'}</p>
          </div>
        </div>
        <button
          onClick={toggleSound}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isSoundActive ? 'bg-amber-400' : 'bg-slate-700'
          }`}
          aria-label="Toggle sonidos"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSoundActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sounds.map((sound) => (
          <button
            key={sound.value}
            onClick={() => dispatch(setSound(sound.value as AmbientSoundType))}
            className={`p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
              currentSound === sound.value
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                : 'border-white/5 hover:border-white/10 hover:bg-white/5 text-slate-400'
            }`}
          >
            <span className="text-xl">{sound.icon}</span>
            <span className="text-sm font-medium">{sound.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
