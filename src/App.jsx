import useAppStore from "./stores/useAppStore";
import { useEffect, useState, useMemo } from "react";
import { sounds } from "./config/sounds";
import * as icons from '@fortawesome/free-solid-svg-icons';
import AudioChannel from "./components/AudioChannel";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { quotes } from './config/quotes';

function App() {
  const [audioStates, setAudioStates] = useState(
    sounds.reduce((acc, sound) => ({
      ...acc,
      [sound.id]: {
        loading: true,
        error: null,
        audio: null,
        isPlaying: sound.id === 'rain' // Set initial state to true for rain
      }
    }), {})
  );
  
  const store = useAppStore();

  const randomQuote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, []);

  useEffect(() => {
    const audioElements = {};
    const cleanupFunctions = [];

    sounds.forEach(sound => {
      const audio = new Audio(sound.file);
      audio.volume = store[`${sound.id}Volume`];
      audio.loop = true; // Make all sounds loop
      
      const handleLoaded = () => {
        setAudioStates(prev => ({
          ...prev,
          [sound.id]: { ...prev[sound.id], loading: false, error: null }
        }));
        
        // Try to auto-play rain
        if (sound.id === 'rain') {
          audio.play().catch(() => {
            // If autoplay fails, update the state
            setAudioStates(prev => ({
              ...prev,
              rain: { ...prev.rain, isPlaying: false }
            }));
          });
        }
      };

      const handleError = (error) => {
        setAudioStates(prev => ({
          ...prev,
          [sound.id]: { ...prev[sound.id], loading: false, error: error.message }
        }));
      };

      audioElements[sound.id] = audio;
      
      cleanupFunctions.push(() => {
        audio.removeEventListener("canplaythrough", handleLoaded);
        audio.removeEventListener("error", handleError);
        audio.pause();
        audio.remove();
      });

      audio.addEventListener("canplaythrough", handleLoaded);
      audio.addEventListener("error", handleError);
    });

    setAudioStates(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: { ...prev[key], audio: audioElements[key] }
      }), {})
    );

    return () => cleanupFunctions.forEach(cleanup => cleanup());
  }, []);

  const toggleSound = (soundId) => {
    const state = audioStates[soundId];
    if (state.isPlaying) {
      state.audio?.pause();
    } else {
      const playPromise = state.audio?.play();
      if (playPromise) {
        playPromise.catch(() => {
          // If play fails, update state
          setAudioStates(prev => ({
            ...prev,
            [soundId]: { ...prev[soundId], isPlaying: false }
          }));
        });
      }
    }
    setAudioStates(prev => ({
      ...prev,
      [soundId]: { ...prev[soundId], isPlaying: !state.isPlaying }
    }));
  };

  const isLoading = Object.values(audioStates).some(state => state.loading);
  const hasError = Object.values(audioStates).some(state => state.error);

  return (
    <div className="flex min-h-screen bg-base-300">
      <div className="w-20 bg-base-200 p-4">
        <div className="space-y-4">
          {sounds.map(sound => (
            <AudioChannel
              key={sound.id}
              icon={icons[sound.icon]}
              isPlaying={audioStates[sound.id].isPlaying}
              onToggle={() => toggleSound(sound.id)}
              volume={store[`${sound.id}Volume`]}
              onVolumeChange={(volume) => store.setVolume(sound.id, volume)}
              audio={audioStates[sound.id].audio}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">
        {isLoading && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Loading audio assets...</span>
          </div>
        )}
        
        {hasError && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error loading audio: {Object.values(audioStates).find(state => state.error)?.error}</span>
          </div>
        )}

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <FontAwesomeIcon 
                icon={faQuoteLeft} 
                className="text-3xl text-primary mb-4 opacity-50" 
              />
              <p className="text-xl font-serif italic">
                "{randomQuote.text}"
              </p>
              <p className="text-sm opacity-75 mt-4">
                — {randomQuote.author}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
