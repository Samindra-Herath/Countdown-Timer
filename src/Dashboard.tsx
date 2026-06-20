import React, { useState } from 'react';
import { CountdownConfig, FontType, LayoutType, MusicCategory } from './types';
import { CountdownLayout } from './CountdownLayout';
import { Link2, LayoutTemplate, Type, Palette, Sparkles, Wand2, AlertCircle } from 'lucide-react';

interface Props {
  config: CountdownConfig;
  onChange: (config: CountdownConfig) => void;
  onShare: () => void;
}

export function Dashboard({ config, onChange, onShare }: Props) {
  const [showToast, setShowToast] = useState(false);

  const handleShareClick = () => {
    onShare();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateField = <K extends keyof CountdownConfig>(key: K, value: CountdownConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden relative">
      
      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100 animate-bounce' : 'translate-y-4 opacity-0 pointer-events-none'}`}
      >
        <div className="bg-slate-900 border border-green-500/30 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 shadow-green-500/10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Link2 className="w-4 h-4 text-slate-900" />
          </div>
          <span className="font-medium text-sm">Public link copied to clipboard!</span>
        </div>
      </div>

      {/* Editor Panel (Left) */}
      <div className="w-full lg:w-[360px] h-[50vh] lg:h-full bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 bg-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
              <h1 className="text-lg font-bold tracking-tight uppercase">ChronoSync <span className="text-indigo-400 font-light text-xs ml-1">Studio</span></h1>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Custom Countdown Platform</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 custom-scrollbar">
          
          {/* Event Details */}
          <section className="space-y-2">
            <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2">Event Definition</label>
            <div className="space-y-2">
              <input 
                type="text" 
                value={config.title} 
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 shadow-sm transition-colors text-slate-100 placeholder:text-slate-500"
                placeholder="e.g. Product Launch"
              />
              <textarea 
                value={config.description} 
                onChange={(e) => updateField('description', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 shadow-sm transition-colors text-slate-100 placeholder:text-slate-500 min-h-[60px] resize-y"
                placeholder="Event description..."
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={config.date} 
                  onChange={(e) => updateField('date', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono text-slate-100 [color-scheme:dark]"
                />
                <input 
                  type="time" 
                  value={config.time} 
                  onChange={(e) => updateField('time', e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono text-slate-100 [color-scheme:dark]"
                />
              </div>
            </div>
          </section>

          {/* Aesthetics */}
          <section className="space-y-2">
            <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2">Clock Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {(['minimalist', 'digital', 'brutalist'] as LayoutType[]).map((layout) => (
                <button
                  key={layout}
                  onClick={() => updateField('layout', layout)}
                  className={`p-2 rounded-md text-[10px] flex flex-col items-center gap-2 transition-all ${
                    config.layout === layout 
                      ? 'bg-white/10 border border-white/40 ring-1 ring-indigo-500 text-slate-100' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {layout === 'minimalist' && <div className="w-full h-1 bg-white/20 rounded-full mt-1"></div>}
                  {layout === 'digital' && <div className="grid grid-cols-2 gap-1 w-full mt-1"><div className="h-1 bg-white/40 rounded"></div><div className="h-1 bg-white/40 rounded"></div></div>}
                  {layout === 'brutalist' && <div className="w-full h-2 border border-white/40 bg-white/10 mt-1"></div>}
                  <span className="capitalize mt-auto">{layout}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Typography & Colors */}
          <section className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2">Typography Engine</label>
              <select 
                 value={config.font}
                 onChange={(e) => updateField('font', e.target.value as FontType)}
                 className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="Inter" className="bg-slate-900 border-none outline-none">Inter (Modern)</option>
                <option value="Montserrat" className="bg-slate-900">Montserrat (Bold)</option>
                <option value="JetBrains Mono" className="bg-slate-900">JetBrains Mono (Digital)</option>
                <option value="Playfair Display" className="bg-slate-900">Playfair Display (Elegant)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 mb-1">Text</label>
                <div className="relative h-8 w-full rounded bg-white border border-white/20 cursor-pointer overflow-hidden">
                  <input 
                    type="color" 
                    value={config.textColor} 
                    onChange={(e) => updateField('textColor', e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
              </div>
              <div className={`transition-opacity ${config.layout === 'minimalist' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-[9px] text-slate-400 mb-1">Card</label>
                <div className="relative h-8 w-full rounded border border-white/20 cursor-pointer overflow-hidden">
                  <input 
                    type="color" 
                    value={config.cardColor} 
                    onChange={(e) => updateField('cardColor', e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 mb-1">Base</label>
                <div className="relative h-8 w-full rounded border border-white/20 cursor-pointer overflow-hidden">
                  <input 
                    type="color" 
                    value={config.bgColor} 
                    onChange={(e) => updateField('bgColor', e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Audio & VFX */}
          <section>
            <label className="block text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-3">Audio & VFX</label>
            <div className="space-y-4">
              
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
                <label className="block text-[10px] text-slate-400 mb-2 uppercase tracking-wide">Background Music</label>
                <select 
                   value={config.music}
                   onChange={(e) => updateField('music', e.target.value as MusicCategory)}
                   className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer mb-3"
                >
                  <option value="none">None (Silent)</option>
                  <optgroup label="Cinematic & Epic (Hans Zimmer Style)">
                    <option value="cinematic_epic">Modern Epic Trailer</option>
                    <option value="cinematic_valkyries">Classical: Ride of the Valkyries</option>
                    <option value="cinematic_mars">Classical: Mars, the Bringer of War</option>
                  </optgroup>
                  <optgroup label="Emotional & Expressive">
                    <option value="emotional_piano">Modern Emotional Piano</option>
                    <option value="emotional_moonlight">Classical: Moonlight Sonata</option>
                    <option value="emotional_nocturne">Classical: Chopin Nocturne</option>
                  </optgroup>
                  <optgroup label="Energetic & Fast">
                    <option value="energetic_upbeat">Modern Energetic Indie Rock</option>
                    <option value="energetic_summer">Classical: Vivaldi - Summer</option>
                    <option value="energetic_bumblebee">Classical: Flight of the Bumblebee</option>
                  </optgroup>
                </select>

                <div className="bg-white/10 h-[1px] w-full my-3"></div>

                <label className="block text-[10px] text-slate-400 mb-2 uppercase tracking-wide group">
                  Custom Audio Source
                  <span className="invisible group-hover:visible absolute bg-slate-800 text-xs text-white p-2 rounded w-48 -mt-1 ml-2 z-50 shadow-xl border border-white/10">
                    Because this platform is database-free to protect your data, shared visitors will be prompted to select their own local audio track, or the countdown will play standard ambient audio if available.
                  </span>
                </label>
                
                <div className="space-y-4">
                  {/* Public URL Input */}
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase mb-1">Public Audio URL <span className="text-indigo-400">(Best for sharing)</span></label>
                    <input 
                      type="text"
                      placeholder="e.g. https://domain.com/audio.mp3"
                      value={config.customAudioUrl && !config.customAudioUrl.startsWith('blob:') ? config.customAudioUrl : ''}
                      onChange={(e) => updateField('customAudioUrl', e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-colors text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  
                  {/* Local File Input */}
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase mb-1 hidden">Local Test Audio</label>
                    <div className="relative overflow-hidden w-full bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg py-2 text-center cursor-pointer transition-colors mt-2">
                      <span className="text-xs font-medium text-slate-200">Import Local Audio File</span>
                      <input 
                        type="file" 
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            updateField('customAudioUrl', url);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    {config.customAudioUrl?.startsWith('blob:') && (
                       <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                         <div className="text-[10px] text-amber-400 flex justify-between items-center mb-1">
                           <span className="font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Local Audio Loaded</span>
                           <button className="text-slate-400 hover:text-white underline" onClick={() => updateField('customAudioUrl', '')}>Clear</button>
                         </div>
                         <p className="text-[9px] text-amber-500/70 leading-tight">Local files cannot be transferred via URL links. Use a Public Audio URL for sharing.</p>
                       </div>
                    )}
                  </div>

                  {/* Volume Control */}
                  <div className="border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] text-slate-500 uppercase">Volume Level</label>
                      <span className="text-[10px] text-indigo-300 font-mono">{Math.round((config.audioVolume ?? 0.5) * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05"
                      value={config.audioVolume ?? 0.5} 
                      onChange={(e) => updateField('audioVolume', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>

                  {/* Loop Toggle */}
                  <div className="flex items-center justify-between py-1 border-t border-white/5 pt-3">
                    <span className="text-[9px] text-slate-500 uppercase">Loop Audio Playback</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.audioLoop ?? true}
                        onChange={(e) => updateField('audioLoop', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl mb-4">
                <label className="block text-[10px] text-slate-400 mb-2 uppercase tracking-wide">Background Animation</label>
                <select 
                   value={config.animation || 'none'}
                   onChange={(e) => updateField('animation', e.target.value as any)}
                   className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer mb-4"
                >
                  <option value="none">None (Clear canvas)</option>
                  <option value="music_notes">Melody Float</option>
                  <option value="matrix">Matrix Digital Rain</option>
                  <option value="cyberpunk">Cyberpunk Grid Drift</option>
                  <option value="geometry">Abstract Geometry Orbit</option>
                </select>

                <div className={`space-y-3 transition-opacity duration-300 ${config.animation === 'none' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-slate-400 uppercase">Speed Multiplier</label>
                      <span className="text-[10px] text-indigo-300 font-mono">{config.animationSpeed ?? 3}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="0.5"
                      value={config.animationSpeed ?? 3} 
                      onChange={(e) => updateField('animationSpeed', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] text-slate-400 uppercase">Particle Density</label>
                      <span className="text-[10px] text-indigo-300 font-mono">{config.animationDensity ?? 50}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      step="5"
                      value={config.animationDensity ?? 50} 
                      onChange={(e) => updateField('animationDensity', parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/10 h-[1px] w-full my-2"></div>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">Show Milliseconds</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors border border-white/20 ${config.showMs ? 'bg-indigo-600' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-transform ${config.showMs ? 'bg-white translate-x-[18px]' : 'bg-white/40 translate-x-[2px]'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={config.showMs} 
                  onChange={(e) => updateField('showMs', e.target.checked)} 
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">End State Confetti</span>
                <div className={`w-8 h-4 rounded-full relative transition-colors border border-white/20 ${config.showConfetti ? 'bg-indigo-600' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full transition-transform ${config.showConfetti ? 'bg-white translate-x-[18px]' : 'bg-white/40 translate-x-[2px]'}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={config.showConfetti} 
                  onChange={(e) => updateField('showConfetti', e.target.checked)} 
                />
              </label>
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <button 
            onClick={handleShareClick}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mb-2"
          >
            <Link2 className="w-4 h-4" />
            Generate Public Link
          </button>
          <p className="text-[9px] text-center text-slate-500">No Database • Shared via URL Data</p>
        </div>
      </div>

      {/* Preview Panel (Right) */}
      <div className="flex-1 relative overflow-hidden min-h-[50vh]">
        <div className="absolute top-8 left-8 text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 z-20">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Live Canvas Preview
        </div>
        
        {/* Safe Area wrapper for precise preview context */}
        <div className="w-full h-full relative" style={{ isolation: 'isolate' }}>
           <CountdownLayout 
             config={config} 
             isPreview={true} 
             onConfigChange={(updates) => onChange({ ...config, ...updates })}
           />
        </div>
      </div>
      
    </div>
  );
}
