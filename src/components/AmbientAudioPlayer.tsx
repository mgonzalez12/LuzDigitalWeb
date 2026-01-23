'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/lib/hooks';

const SOUND_URLS = {
  none: '',
  // Rain: Works (SoundBible)
  rain: 'https://soundbible.com/mp3/Rain_Background-Mike_Koenig-1681389445.mp3',
  
  // Nature: OrangeFreeSounds (Direct MP3) - "Forest Ambience"
  nature: 'https://www.orangefreesounds.com/wp-content/uploads/2017/09/Forest-ambience.mp3',
  
  // Piano: OrangeFreeSounds (Direct MP3)
  piano: 'https://www.orangefreesounds.com/wp-content/uploads/2016/05/Erik-satie-gymnopedie-no1-piano.mp3',
};

export default function AmbientAudioPlayer() {
  const { currentSound, isPlaying, volume } = useAppSelector((state) => state.audio);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (currentSound === 'none' || !isPlaying) {
      audio.pause();
      return;
    }

    const url = SOUND_URLS[currentSound];
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error('Audio playback failed:', error);
      });
    }
  }, [currentSound, isPlaying, volume]);

  return null; // This component has no visual output
}
