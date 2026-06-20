import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { CountdownConfig } from './types';
import { AmbientCanvas } from './AmbientCanvas';

const PRIMARY_TRACKS: Record<string, string> = {
  cinematic_epic: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=epic-cinematic-trailer-103890.mp3',
  cinematic_valkyries: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Richard_Wagner_-_Ride_of_the_Valkyries.ogg',
  cinematic_mars: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Holst_-_mars.ogg',
  emotional_piano: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf589.mp3?filename=emotional-piano-110008.mp3',
  emotional_moonlight: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Beethoven_-_Piano_Sonata_No._14%2C_Op._27%2C_No._2_%28%27Moonlight%27%29%2C_Movement_1.ogg',
  emotional_nocturne: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Chopin_-_Nocturne_Op_9_No_2_%28E_Flat_Major%29.ogg',
  energetic_upbeat: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_ebd2fbb59d.mp3?filename=energetic-indie-rock-jump-109635.mp3',
  energetic_summer: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Vivaldi_-_The_Four_Seasons%2C_Summer%2C_3._Presto.ogg',
  energetic_bumblebee: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Flight_of_the_bumblebee.ogg'
};

const BACKUP_TRACKS: Record<string, string> = {
  // If wikimedia/pixabay fails, fallback to these (some soundhelix or same if they're reliable)
  cinematic_epic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  cinematic_valkyries: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  cinematic_mars: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  emotional_piano: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  emotional_moonlight: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  emotional_nocturne: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  energetic_upbeat: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  energetic_summer: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  energetic_bumblebee: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
};

import { useCountdown } from './useCountdown';

interface Props {
  config: CountdownConfig;
  isPreview?: boolean;
  onConfigChange?: (updates: Partial<CountdownConfig>) => void;
}

const pad = (num: number, size: number) => {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

export function CountdownLayout(props: Props) {
  const { config, isPreview = false } = props;
  const isLiveWithAudio = !isPreview && (config.music !== 'none' || !!config.customAudioUrl);
  const [showGate, setShowGate] = useState(isLiveWithAudio);
  const [gateFading, setGateFading] = useState(false);
  const timeLeft = useCountdown(config.date, config.time, isPreview, showGate);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
  const isExpired = timeLeft.isExpired;
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [audioError, setAudioError] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState(config.audioVolume ?? 0.5);
  const [localLoop, setLocalLoop] = useState(config.audioLoop ?? true);
  const [isAudioBuffering, setIsAudioBuffering] = useState(isLiveWithAudio);

  // Sync with config
  useEffect(() => {
    if (config.audioVolume !== undefined) setLocalVolume(config.audioVolume);
    if (config.audioLoop !== undefined) setLocalLoop(config.audioLoop);
  }, [config.audioVolume, config.audioLoop]);

  useEffect(() => {
    if (config.customAudioUrl) {
      setAudioSrc(config.customAudioUrl);
      setAudioError(false);
    } else if (config.music && config.music !== 'none') {
      setAudioSrc(PRIMARY_TRACKS[config.music] || '');
      setAudioError(false);
    } else {
      setAudioSrc('');
      setIsPlaying(false);
      setAudioError(false);
    }
  }, [config.music, config.customAudioUrl]);

  // Audio Playback Sync & Expiration handler
  useEffect(() => {
    if (audioRef.current) {
       audioRef.current.volume = localVolume;
       
       if (isExpired) {
         // Stop audio when timer expires
         audioRef.current.pause();
         setIsPlaying(false);
       } else if (isPlaying && audioSrc) {
           audioRef.current.play().catch(e => {
             console.warn("Audio play interrupted or failed:", e);
             setIsPlaying(false);
           });
       } else {
           audioRef.current.pause();
       }
    }
  }, [isPlaying, audioSrc, localVolume, isExpired]);

  // Buffering safety timeout (e.g. 3.5s limit) to avoid infinite loading screen
  useEffect(() => {
    if (isLiveWithAudio && showGate) {
      const timer = setTimeout(() => {
        setIsAudioBuffering(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isLiveWithAudio, showGate]);

  const handleVolumeChange = (val: number) => {
    setLocalVolume(val);
    if (props.onConfigChange) props.onConfigChange({ audioVolume: val });
  };

  const handleGateEnter = () => {
    setGateFading(true);
    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(e => {
            console.warn("Audio Context playback failed or blocked:", e);
            // Non-fatal, unblock visual experience
            setAudioError(true);
            setIsPlaying(false);
          });
        }
      } catch (err) {
        console.warn("Audio playback threw synchronously on start:", err);
        setAudioError(true);
        setIsPlaying(false);
      }
    }
    setTimeout(() => {
      setShowGate(false);
    }, 500);
  };

  const handleLoopChange = (val: boolean) => {
    setLocalLoop(val);
    if (props.onConfigChange) props.onConfigChange({ audioLoop: val });
  };

  const handleAudioError = () => {
    console.warn(`Primary audio source failed for event. Trying backup...`);
    setIsAudioBuffering(false);
    if (config.customAudioUrl && audioSrc === config.customAudioUrl) {
       setAudioError(true);
       setIsPlaying(false);
    } else if (config.music !== 'none' && audioSrc === PRIMARY_TRACKS[config.music]) {
      setAudioSrc(BACKUP_TRACKS[config.music]);
    } else {
      setAudioError(true);
      setIsPlaying(false);
    }
  };

  const toggleMusic = () => {
    if (audioError) {
      // Try reloading primary on user request
      setAudioError(false);
      setAudioSrc(config.customAudioUrl || PRIMARY_TRACKS[config.music] || '');
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Reset confetti flag if date changes to future
    if (!isExpired) {
      setHasFiredConfetti(false);
    }
  }, [isExpired, config.date, config.time]);

  useEffect(() => {
    if (isExpired && config.showConfetti && !hasFiredConfetti) {
      setHasFiredConfetti(true);
      
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: (Math.random() * 0.4) + 0.1, y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: (Math.random() * 0.4) + 0.5, y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isExpired, config.showConfetti, hasFiredConfetti]);

  const getFontFamily = () => {
    switch (config.font) {
      case 'Inter': return 'font-inter';
      case 'Montserrat': return 'font-montserrat';
      case 'JetBrains Mono': return 'font-jetbrains';
      case 'Playfair Display': return 'font-playfair';
      default: return 'font-inter';
    }
  };

  const msString = pad(Math.floor(timeLeft.milliseconds / 10), 2); // 2 digits for ms

  const renderDigitalCard = (value: number, label: string) => (
    <>
      <div className="flex sm:hidden flex-row items-center justify-between w-full px-6 py-6 relative group backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl overflow-hidden" style={{ backgroundColor: config.cardColor }}>
         <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <span className="text-[20vw] font-bold tracking-tighter leading-none relative z-10">
           {pad(value, 2)}
         </span>
         <span className="text-[4vw] font-bold uppercase tracking-widest opacity-80 text-right relative z-10" style={{ color: config.textColor }}>
           {label}
         </span>
      </div>
      <div className="hidden sm:flex flex-col items-center gap-2">
        <div className="w-24 h-28 md:w-32 md:h-36 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl relative group" style={{ backgroundColor: config.cardColor }}>
          <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-4xl md:text-6xl font-bold tracking-tighter">
            {pad(value, 2)}
          </span>
        </div>
        <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-80" style={{ color: config.textColor }}>
          {label}
        </span>
      </div>
    </>
  );

  const renderMinimalistBlock = (value: number, label: string) => (
    <>
      <div className="flex sm:hidden flex-row items-end justify-between w-full py-4 border-b border-white/10 last:border-0 relative">
        <span className="text-[24vw] font-light tracking-tighter leading-[0.8] opacity-90">
          {pad(value, 2)}
        </span>
        <span className="text-[4vw] font-light tracking-[0.3em] uppercase opacity-60 mb-2">
          {label}
        </span>
      </div>
      <div className="hidden sm:flex flex-col items-center mx-3 md:mx-6">
        <div className="text-5xl md:text-8xl font-light tracking-tighter opacity-90">
          {pad(value, 2)}
        </div>
        <div className="text-xs md:text-sm font-light tracking-[0.3em] uppercase opacity-60 mt-4">
          {label}
        </div>
      </div>
    </>
  );

  const renderBrutalistCard = (value: number, label: string) => (
    <>
      <div className="flex sm:hidden flex-row items-center justify-between w-full p-4 border-4 border-current" style={{ backgroundColor: config.cardColor, boxShadow: `6px 6px 0px ${config.textColor}` }}>
        <span className="text-[18vw] font-black tracking-tighter leading-none mb-[-5px]">
          {pad(value, 2)}
        </span>
        <span className="text-[4vw] font-bold uppercase tracking-widest border-l-4 border-current pl-4 flex items-center h-full">
          {label}
        </span>
      </div>
      <div className="hidden sm:flex flex-col items-center justify-center p-4 md:p-6 border-4 border-current" style={{ backgroundColor: config.cardColor, boxShadow: `8px 8px 0px ${config.textColor}` }}>
        <div className="text-5xl md:text-8xl font-black tracking-tighter mb-1">
          {pad(value, 2)}
        </div>
        <div className="text-sm md:text-base font-bold uppercase tracking-widest border-t-4 border-current w-full text-center pt-2 mt-2">
          {label}
        </div>
      </div>
    </>
  );

  const renderTimerBlocks = () => {
    return (
      <>
        {config.layout === 'digital' && (
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none mx-auto sm:px-0">
            {renderDigitalCard(timeLeft.days, 'Days')}
            {renderDigitalCard(timeLeft.hours, 'Hours')}
            {renderDigitalCard(timeLeft.minutes, 'Minutes')}
            {renderDigitalCard(timeLeft.seconds, 'Seconds')}
            {config.showMs && (
               <>
                 <div className="flex sm:hidden flex-row items-center justify-between w-full px-6 py-4 relative group backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl overflow-hidden opacity-70" style={{ backgroundColor: config.cardColor }}>
                   <span className="text-[14vw] font-bold tracking-tighter leading-none w-24 text-left">{msString}</span>
                   <span className="text-[4vw] font-bold uppercase tracking-widest opacity-80 text-right" style={{ color: config.textColor }}>MS</span>
                 </div>
                 <div className="hidden sm:flex flex-col items-center gap-2">
                   <div className="w-20 h-28 md:w-28 md:h-36 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl relative group opacity-80" style={{ backgroundColor: config.cardColor }}>
                     <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <span className="text-3xl md:text-5xl font-bold tracking-tighter">{msString}</span>
                   </div>
                   <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest opacity-80" style={{ color: config.textColor }}>MS</span>
                 </div>
               </>
            )}
          </div>
        )}
        
        {config.layout === 'minimalist' && (
          <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-end justify-center w-full px-4 sm:px-0 mx-auto max-w-sm sm:max-w-none">
            {renderMinimalistBlock(timeLeft.days, 'Days')}
            <div className="hidden sm:block text-4xl md:text-8xl font-light opacity-30 mx-2 -mt-10">:</div>
            {renderMinimalistBlock(timeLeft.hours, 'Hours')}
            <div className="hidden sm:block text-4xl md:text-8xl font-light opacity-30 mx-2 -mt-10">:</div>
            {renderMinimalistBlock(timeLeft.minutes, 'Minutes')}
            <div className="hidden sm:block text-4xl md:text-8xl font-light opacity-30 mx-2 -mt-10">:</div>
            {renderMinimalistBlock(timeLeft.seconds, 'Seconds')}
            {config.showMs && (
              <>
                <div className="hidden sm:block text-4xl md:text-8xl font-light opacity-10 mx-2 -mt-10">.</div>
                <div className="hidden sm:flex flex-col items-center mx-4 md:mx-8 scale-75 opacity-70">
                   <div className="text-4xl md:text-6xl font-light tracking-tighter w-16">{msString}</div>
                </div>
                <div className="flex sm:hidden flex-row items-end justify-between w-full py-2 border-white/10 relative opacity-50">
                  <span className="text-[14vw] font-light tracking-tighter leading-[0.8]">.{msString}</span>
                  <span className="text-[3vw] font-light tracking-[0.3em] uppercase mb-1">MS</span>
                </div>
              </>
            )}
          </div>
        )}

        {config.layout === 'brutalist' && (
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-sm sm:max-w-none mx-auto px-4 sm:px-0">
            {renderBrutalistCard(timeLeft.days, 'Days')}
            {renderBrutalistCard(timeLeft.hours, 'Hours')}
            {renderBrutalistCard(timeLeft.minutes, 'Minutes')}
            {renderBrutalistCard(timeLeft.seconds, 'Seconds')}
            {config.showMs && (
               <>
                 <div className="flex sm:hidden flex-row items-center justify-between w-full p-3 border-4 border-current opacity-90 transition-transform" style={{ backgroundColor: config.cardColor, boxShadow: `4px 4px 0px ${config.textColor}` }}>
                   <span className="text-[12vw] font-black tracking-tighter leading-none w-20 text-left">{msString}</span>
                   <span className="text-[4vw] font-bold uppercase tracking-widest border-l-4 border-current pl-3 flex items-center">MS</span>
                 </div>
                 <div className="hidden sm:flex flex-col items-center justify-center p-4 md:p-6 border-4 border-current transition-transform opacity-90" style={{ backgroundColor: config.cardColor, boxShadow: `4px 4px 0px ${config.textColor}` }}>
                   <div className="text-3xl md:text-5xl font-black mb-1 w-16 text-center">{msString}</div>
                   <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest border-t-4 border-current w-full text-center pt-2 mt-2">MS</div>
                 </div>
               </>
            )}
          </div>
        )}
      </>
    );
  };


  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center p-8 transition-colors duration-500 overflow-hidden relative ${getFontFamily()}`}
      style={{ backgroundColor: config.bgColor, color: config.textColor }}
    >
      {/* Mesh Gradient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      <AmbientCanvas 
        type={config.animation} 
        speed={config.animationSpeed ?? 3} 
        density={config.animationDensity ?? 50} 
        colorHex={config.textColor} 
        isPaused={showGate}
      />

      {showGate && (
        <div 
          className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 p-6 text-center ${gateFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          style={{ backgroundColor: config.bgColor, color: config.textColor }}
        >
          {/* Ambient pulsing light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10 max-w-xl w-full flex flex-col items-center">
            {/* Pulsing Tag */}
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-60 mb-3 animate-pulse">Incoming Countdown Broadcast</p>
            
            {/* Event Title */}
            <h1 className={`text-4xl md:text-6xl text-center mb-4 leading-tight ${config.layout === 'brutalist' ? 'font-black uppercase border-4 border-current p-6 shadow-[8px_8px_0px_currentColor] bg-black/40' : 'font-semibold tracking-tighter'}`}>
              {config.title || "ChronoSync Countdown"}
            </h1>

            {config.description && (
              <p className="text-sm opacity-70 mb-8 max-w-md tracking-wide leading-relaxed">
                {config.description}
              </p>
            )}

            {/* Audio Detail Status */}
            <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wider uppercase opacity-80 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              Audio: {config.customAudioUrl ? 'Custom Cloud Stream' : config.music.replace('_', ' ')}
            </div>

            {/* Main Interactive Button with Loader state */}
            <div className="relative flex flex-col items-center gap-3">
              <button 
                onClick={handleGateEnter}
                disabled={isAudioBuffering}
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold tracking-widest uppercase transition-all shadow-2xl ${
                  isAudioBuffering 
                    ? 'opacity-50 cursor-not-allowed scale-95'
                    : 'animate-pulse hover:scale-105 active:scale-95'
                } ${
                  config.layout === 'brutalist' 
                    ? 'border-4 border-current hover:bg-white/15 bg-black/20 text-white' 
                    : 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white'
                }`}
              >
                {isAudioBuffering ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Buffering Stream...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Enter Countdown</span>
                  </>
                )}
              </button>

              {isAudioBuffering && (
                <button
                  onClick={handleGateEnter}
                  className="text-[10px] uppercase tracking-wider text-white/40 hover:text-white/80 transition-colors mt-2 underline"
                >
                  Skip buffering and view
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center justify-center">
        <h2 className={`text-[8vw] leading-tight sm:text-3xl md:text-5xl text-center mb-2 md:mb-4 px-4 uppercase ${config.layout === 'brutalist' ? 'font-black border-4 border-current p-4' : 'font-bold tracking-tighter opacity-90'} ${config.layout === 'brutalist' ? 'shadow-[8px_8px_0px_currentColor]' : ''}`}
            style={config.layout === 'brutalist' ? { backgroundColor: config.cardColor } : {}}>
          {config.title || "Untitled Event"}
        </h2>
        {config.description && (
          <p className="text-sm sm:text-base md:text-lg text-center mb-8 md:mb-16 px-6 max-w-3xl opacity-70">
            {config.description}
          </p>
        )}
        
        {isExpired ? (
          <div className={`text-4xl md:text-7xl text-center animate-pulse uppercase ${config.layout === 'brutalist' ? 'font-black border-4 border-current p-8 px-12 shadow-[12px_12px_0px_currentColor]' : 'font-bold tracking-tighter'}`}
               style={config.layout === 'brutalist' ? {backgroundColor: config.cardColor} : {}}>
            {config.title ? `${config.title} is Here!` : "Time's up!"}
          </div>
        ) : (
          renderTimerBlocks()
        )}
      </div>

      {(config.music !== 'none' || config.customAudioUrl) && (
        <>
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex flex-col items-end gap-2 group">
             <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 shadow-2xl transition-all">
                {/* Loop Toggle */}
                <button 
                  onClick={() => handleLoopChange(!localLoop)}
                  title={localLoop ? "Looping Enabled" : "Looping Disabled"}
                  className={`hidden md:flex text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-colors ${localLoop ? 'bg-indigo-500/20 text-indigo-200' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >Loop</button>
                
                {/* Volume Slider */}
                <input 
                  type="range" 
                  min="0" max="1" step="0.01"
                  value={localVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  title="Volume"
                  className="hidden md:block w-20 accent-white h-1 bg-white/20 rounded-full appearance-none cursor-pointer hover:bg-white/30"
                />

                <button 
                  onClick={toggleMusic}
                  title={audioError ? "Audio load failed. Click to retry." : "Toggle Music"}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full backdrop-blur-md border text-white shadow-xl hover:scale-105 transition-all ${
                    audioError 
                    ? "bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-100" 
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                  }`}
                >
                   {audioError ? (
                     <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                   ) : isPlaying ? (
                     <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
                   ) : (
                     <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
                   )}
                </button>
             </div>
             {audioError ? (
               <div className="whitespace-nowrap px-3 py-1 bg-red-950/75 backdrop-blur-sm rounded-lg text-[10px] font-semibold uppercase tracking-widest text-red-300 border border-red-500/30">
                 Source Error (Click to retry)
               </div>
             ) : (!isPlaying && !isExpired) && (
               <div className="absolute top-1/2 right-[120%] -translate-y-1/2 whitespace-nowrap px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs font-semibold uppercase tracking-widest text-white/90 animate-pulse border border-white/10 pointer-events-none hidden md:block">
                 Play Audio
               </div>
             )}
          </div>
          <audio 
            ref={audioRef} 
            src={audioSrc || undefined} 
            loop={localLoop} 
            preload="auto" 
            onCanPlay={() => setIsAudioBuffering(false)}
            onLoadedMetadata={() => setIsAudioBuffering(false)}
            onError={handleAudioError} 
          />
        </>
      )}
    </div>
  );
}
