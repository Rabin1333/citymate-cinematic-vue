import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CinematicEffectsContextType {
  cinematicEffectsEnabled: boolean;
  setCinematicEffectsEnabled: (enabled: boolean) => void;
  microAudioMuted: boolean;
  setMicroAudioMuted: (muted: boolean) => void;
  isEffectPlaying: boolean;
  setIsEffectPlaying: (playing: boolean) => void;
  lastEffectTimestamp: number;
  setLastEffectTimestamp: (timestamp: number) => void;
}

const CinematicEffectsContext = createContext<CinematicEffectsContextType | undefined>(undefined);

export const useCinematicEffects = () => {
  const context = useContext(CinematicEffectsContext);
  if (context === undefined) {
    throw new Error('useCinematicEffects must be used within a CinematicEffectsProvider');
  }
  return context;
};

interface CinematicEffectsProviderProps {
  children: ReactNode;
}

export const CinematicEffectsProvider: React.FC<CinematicEffectsProviderProps> = ({ children }) => {
  const [cinematicEffectsEnabled, setCinematicEffectsEnabled] = useState(() => {
    const saved = localStorage.getItem('cinematicEffectsEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Default ON
  });
  
  const [microAudioMuted, setMicroAudioMuted] = useState(() => {
    const saved = localStorage.getItem('microAudioMuted');
    return saved !== null ? JSON.parse(saved) : true; // Default muted
  });
  
  const [isEffectPlaying, setIsEffectPlaying] = useState(false);
  const [lastEffectTimestamp, setLastEffectTimestamp] = useState(0);

  const handleSetCinematicEffects = (enabled: boolean) => {
    setCinematicEffectsEnabled(enabled);
    localStorage.setItem('cinematicEffectsEnabled', JSON.stringify(enabled));
  };

  const handleSetMicroAudio = (muted: boolean) => {
    setMicroAudioMuted(muted);
    localStorage.setItem('microAudioMuted', JSON.stringify(muted));
  };

  return (
    <CinematicEffectsContext.Provider value={{
      cinematicEffectsEnabled,
      setCinematicEffectsEnabled: handleSetCinematicEffects,
      microAudioMuted,
      setMicroAudioMuted: handleSetMicroAudio,
      isEffectPlaying,
      setIsEffectPlaying,
      lastEffectTimestamp,
      setLastEffectTimestamp
    }}>
      {children}
    </CinematicEffectsContext.Provider>
  );
};