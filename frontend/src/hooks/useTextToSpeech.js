import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-native speech controller. Uses voices installed by the user's browser/OS:
 * no speech API key, server request, or provider quota is involved.
 * Fully supports Play, Pause, Resume, Stop, Repeat, Speed control, English & Hindi voice detection,
 * boundary progress tracking, and sequential step-by-step synchronized code line narration.
 */
export function useTextToSpeech() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState('');
  const [currentBoundaryIndex, setCurrentBoundaryIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeLineNumber, setActiveLineNumber] = useState(null);
  const [speechError, setSpeechError] = useState(null);

  const generation = useRef(0);
  const lastSpokenRef = useRef({ text: '', options: {} });
  const activeUtterancesRef = useRef(new Set());
  const cancelTimerRef = useRef(null);
  const sequenceRef = useRef({
    items: [],
    index: 0,
    active: false,
    onStepChange: null,
    onComplete: null,
  });

  // Pick suitable voice for current language (English / Hindi)
  const resolveVoice = useCallback(
    (targetLang, targetVoiceName, voiceList) => {
      const list = voiceList || voices;
      if (!list || list.length === 0) return null;

      if (targetVoiceName) {
        const exact = list.find((v) => v.name === targetVoiceName);
        if (exact) return exact;
      }

      const langCode = (targetLang || voiceLanguage).toLowerCase();

      // Hindi voice matching
      if (langCode.startsWith('hi')) {
        const hindiVoice =
          list.find((v) => v.lang?.toLowerCase().includes('hi')) ||
          list.find((v) => /hindi|हिन्दी/i.test(v.name));
        if (hindiVoice) return hindiVoice;
      }

      // English voice matching
      if (langCode.startsWith('en')) {
        const enVoice =
          list.find((v) => v.lang?.toLowerCase() === langCode) ||
          list.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
          list.find((v) => /english/i.test(v.name));
        if (enVoice) return enVoice;
      }

      // Fallback
      return list[0] || null;
    },
    [voiceLanguage, voices]
  );

  useEffect(() => {
    const available =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function';
    setSupported(available);
    if (!available) {
      setSpeechError('Web Speech API is not supported in this browser.');
      return undefined;
    }

    const synth = window.speechSynthesis;
    const refreshVoices = () => {
      const next = synth.getVoices() || [];
      setVoices(next);

      setVoiceName((current) => {
        if (current && next.some((v) => v.name === current)) {
          return current;
        }
        const defaultVoice = resolveVoice(voiceLanguage, null, next);
        return defaultVoice ? defaultVoice.name : '';
      });
    };

    refreshVoices();
    synth.addEventListener?.('voiceschanged', refreshVoices);

    // Cancel speech on page unload or component unmount
    const handleBeforeUnload = () => {
      generation.current += 1;
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      synth.cancel();
      activeUtterancesRef.current.clear();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      generation.current += 1;
      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      synth.cancel();
      activeUtterancesRef.current.clear();
      synth.removeEventListener?.('voiceschanged', refreshVoices);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resolveVoice, voiceLanguage]);

  // When language changes, auto-select a matching voice
  const handleSetVoiceLanguage = useCallback(
    (newLang) => {
      setVoiceLanguage(newLang);
      const matchedVoice = resolveVoice(newLang, null, voices);
      if (matchedVoice) {
        setVoiceName(matchedVoice.name);
      }
    },
    [resolveVoice, voices]
  );

  const stop = useCallback(() => {
    generation.current += 1;
    sequenceRef.current.active = false;
    sequenceRef.current.items = [];
    if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // silent
      }
    }
    activeUtterancesRef.current.clear();
    setSpeaking(false);
    setPaused(false);
    setCurrentBoundaryIndex(0);
    setActiveLineNumber(null);
  }, []);

  const speak = useCallback(
    (text, options = {}) => {
      const message = String(text ?? '').trim();
      const isForced = options.force === true;

      if (isForced && !enabled) {
        setEnabled(true);
      }

      if (
        !message ||
        (!enabled && !isForced) ||
        typeof window === 'undefined' ||
        !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== 'function'
      ) {
        stop();
        return false;
      }

      const synth = window.speechSynthesis;
      const requestId = ++generation.current;

      lastSpokenRef.current = { text: message, options };

      const utterance = new window.SpeechSynthesisUtterance(message);
      const language = options.lang || voiceLanguage;
      utterance.lang = language;
      utterance.rate = Math.max(0.6, Math.min(1.5, Number(options.rate ?? rate) || 1));

      const selectedVoice =
        voices.find((v) => v.name === (options.voiceName || voiceName)) ||
        resolveVoice(language, options.voiceName || voiceName, voices);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Retain utterance reference to prevent V8 garbage collection mid-speech
      activeUtterancesRef.current.add(utterance);

      utterance.onboundary = (event) => {
        if (generation.current === requestId && typeof event.charIndex === 'number') {
          setCurrentBoundaryIndex(event.charIndex);
        }
      };

      utterance.onstart = () => {
        if (generation.current === requestId) {
          setSpeaking(true);
          setPaused(false);
          setSpeechError(null);
          if (options.lineNumber !== undefined) {
            setActiveLineNumber(options.lineNumber);
          }
        }
      };

      utterance.onend = () => {
        activeUtterancesRef.current.delete(utterance);
        if (generation.current === requestId) {
          setSpeaking(false);
          setPaused(false);
          if (typeof options.onEnd === 'function') {
            options.onEnd();
          }
        }
      };

      utterance.onerror = (err) => {
        activeUtterancesRef.current.delete(utterance);
        // 'canceled' and 'interrupted' are expected when user clicks Stop, Next, or Pause
        if (err?.error === 'canceled' || err?.error === 'interrupted') {
          return;
        }

        const errorMsg =
          err?.error === 'not-allowed'
            ? 'Browser speech permission denied. Please interact with the page first.'
            : err?.error === 'audio-busy'
            ? 'System audio device is currently busy.'
            : `Speech error: ${err?.error || 'Playback failed'}`;

        setSpeechError(errorMsg);

        if (generation.current === requestId) {
          setSpeaking(false);
          setPaused(false);
          if (typeof options.onError === 'function') {
            options.onError(err);
          }
        }
      };

      const dispatchSpeech = () => {
        if (generation.current !== requestId) return;
        try {
          // Unstick synth if browser left it paused
          if (synth.paused) {
            synth.resume();
          }
          synth.speak(utterance);
        } catch (e) {
          activeUtterancesRef.current.delete(utterance);
          setSpeechError(e.message || 'Speech dispatch failed');
          if (typeof options.onError === 'function') {
            options.onError(e);
          }
        }
      };

      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);

      if (synth.speaking || synth.pending) {
        synth.cancel();
        // Give browser speech thread 30ms to clear canceled audio before pushing new utterance
        cancelTimerRef.current = setTimeout(dispatchSpeech, 30);
      } else {
        dispatchSpeech();
      }

      return true;
    },
    [enabled, rate, resolveVoice, stop, voiceLanguage, voiceName, voices]
  );

  // Play a sequence of explanation steps with synchronized line numbers
  const speakSequence = useCallback(
    (items = [], options = {}) => {
      if (!Array.isArray(items) || items.length === 0) {
        stop();
        return false;
      }

      if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      activeUtterancesRef.current.clear();

      sequenceRef.current = {
        items,
        index: options.startIndex || 0,
        active: true,
        onStepChange: options.onStepChange || null,
        onComplete: options.onComplete || null,
      };

      const playCurrentSequenceStep = () => {
        const { items: seqItems, index: idx, active } = sequenceRef.current;
        if (!active || idx >= seqItems.length) {
          sequenceRef.current.active = false;
          setSpeaking(false);
          setActiveLineNumber(null);
          if (typeof sequenceRef.current.onComplete === 'function') {
            sequenceRef.current.onComplete();
          }
          return;
        }

        const currentItem = seqItems[idx];
        setActiveStepIndex(idx);
        if (currentItem.lineNumber) {
          setActiveLineNumber(currentItem.lineNumber);
        }

        if (typeof sequenceRef.current.onStepChange === 'function') {
          sequenceRef.current.onStepChange(idx, currentItem);
        }

        speak(currentItem.text, {
          ...options,
          force: true,
          lineNumber: currentItem.lineNumber,
          onEnd: () => {
            if (sequenceRef.current.active) {
              sequenceRef.current.index += 1;
              setTimeout(playCurrentSequenceStep, 350);
            }
          },
          onError: (err) => {
            if (sequenceRef.current.active) {
              // On non-fatal step error, proceed to next step after brief pause
              sequenceRef.current.index += 1;
              setTimeout(playCurrentSequenceStep, 500);
            }
          },
        });
      };

      playCurrentSequenceStep();
      return true;
    },
    [speak, stop]
  );

  const nextStep = useCallback(() => {
    if (sequenceRef.current.active && sequenceRef.current.index < sequenceRef.current.items.length - 1) {
      sequenceRef.current.index += 1;
      const nextItem = sequenceRef.current.items[sequenceRef.current.index];
      setActiveStepIndex(sequenceRef.current.index);
      if (nextItem.lineNumber) setActiveLineNumber(nextItem.lineNumber);
      if (typeof sequenceRef.current.onStepChange === 'function') {
        sequenceRef.current.onStepChange(sequenceRef.current.index, nextItem);
      }
      speak(nextItem.text, { force: true, lineNumber: nextItem.lineNumber });
    }
  }, [speak]);

  const prevStep = useCallback(() => {
    if (sequenceRef.current.active && sequenceRef.current.index > 0) {
      sequenceRef.current.index -= 1;
      const prevItem = sequenceRef.current.items[sequenceRef.current.index];
      setActiveStepIndex(sequenceRef.current.index);
      if (prevItem.lineNumber) setActiveLineNumber(prevItem.lineNumber);
      if (typeof sequenceRef.current.onStepChange === 'function') {
        sequenceRef.current.onStepChange(sequenceRef.current.index, prevItem);
      }
      speak(prevItem.text, { force: true, lineNumber: prevItem.lineNumber });
    }
  }, [speak]);

  const repeat = useCallback(() => {
    if (lastSpokenRef.current.text) {
      speak(lastSpokenRef.current.text, {
        ...lastSpokenRef.current.options,
        force: true,
      });
      return true;
    }
    return false;
  }, [speak]);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((previous) => {
      if (previous && typeof window !== 'undefined' && window.speechSynthesis) {
        generation.current += 1;
        sequenceRef.current.active = false;
        window.speechSynthesis.cancel();
        activeUtterancesRef.current.clear();
        setSpeaking(false);
        setPaused(false);
        setActiveLineNumber(null);
      }
      return !previous;
    });
  }, []);

  const clearSpeechError = useCallback(() => {
    setSpeechError(null);
  }, []);

  return {
    supported,
    enabled,
    speaking,
    paused,
    voiceLanguage,
    rate,
    voices,
    voiceName,
    currentBoundaryIndex,
    activeStepIndex,
    activeLineNumber,
    speechError,
    clearSpeechError,
    setVoiceLanguage: handleSetVoiceLanguage,
    setRate,
    setVoiceName,
    toggleEnabled,
    speak,
    speakSequence,
    nextStep,
    prevStep,
    repeat,
    pause,
    resume,
    stop,
  };
}

export default useTextToSpeech;
