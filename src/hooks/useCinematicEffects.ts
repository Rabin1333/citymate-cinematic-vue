import { useCallback } from 'react';
import { useCinematicEffects } from '../contexts/CinematicEffectsContext';
import { 
  effectsRegistry, 
  logCinematicEffect, 
  announceEffect 
} from '../utils/cinematicEffects';

// Audio cache for performance
const audioCache: Record<string, HTMLAudioElement> = {};

export const useTriggerEffect = () => {
  const {
    cinematicEffectsEnabled,
    microAudioMuted,
    isEffectPlaying,
    setIsEffectPlaying,
    lastEffectTimestamp,
    setLastEffectTimestamp
  } = useCinematicEffects();

  const triggerEffect = useCallback(async (
    movieKey: string, 
    triggerType: string, 
    targetElement?: HTMLElement
  ) => {
    const now = Date.now();
    const effectConfig = effectsRegistry[movieKey];

    // Guardrails
    if (
      !cinematicEffectsEnabled || 
      !effectConfig || 
      isEffectPlaying || 
      (now - lastEffectTimestamp < 10000) // 10s throttle
    ) {
      return;
    }

    setIsEffectPlaying(true);
    setLastEffectTimestamp(now);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle audio
    let audioPlaybackSuccess = false;
    if (effectConfig.sfx && !microAudioMuted) {
      try {
        if (!audioCache[movieKey]) {
          audioCache[movieKey] = new Audio(effectConfig.sfx);
          audioCache[movieKey].preload = 'metadata';
        }
        
        const audio = audioCache[movieKey];
        audio.volume = 0.2; // Low volume for micro-audio
        audio.currentTime = 0; // Reset to start
        
        await audio.play();
        audioPlaybackSuccess = true;
      } catch (error) {
        console.error(`Audio playback failed for ${movieKey}:`, error);
        // Continue with visual effect even if audio fails
      }
    }

    // Execute visual effect
    try {
      effectConfig.visual(targetElement || document.body, prefersReducedMotion);
      
      // ARIA announcement
      announceEffect(movieKey);
      
      // Telemetry
      logCinematicEffect(movieKey, triggerType, microAudioMuted, effectConfig.durationMs);
      
    } catch (error) {
      console.error(`Visual effect failed for ${movieKey}:`, error);
    }

    // Clear playing state after effect duration
    setTimeout(() => {
      setIsEffectPlaying(false);
      
      // Stop audio if it's still playing and not meant to loop
      if (audioPlaybackSuccess && audioCache[movieKey]) {
        const audio = audioCache[movieKey];
        if (!audio.loop && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    }, effectConfig.durationMs);

  }, [
    cinematicEffectsEnabled,
    microAudioMuted,
    isEffectPlaying,
    lastEffectTimestamp,
    setIsEffectPlaying,
    setLastEffectTimestamp
  ]);

  return triggerEffect;
};