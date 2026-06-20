import React, { useCallback } from 'react';
import { CountdownConfig } from './types';
import { CountdownLayout } from './CountdownLayout';
import { Maximize2, Minimize2 } from 'lucide-react';

interface Props {
  config: CountdownConfig;
}

export function LiveView({ config }: Props) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden group">
      
      <CountdownLayout config={config} isPreview={false} />

      {/* Floating UI Elements (fades out slightly if inactive, full opacity on hover) */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex justify-end items-end opacity-20 hover:opacity-100 transition-opacity duration-500 z-50">
        
        <button 
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black text-white p-4 rounded-full backdrop-blur-md border border-white/10 transition-all"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

      </div>
    </div>
  );
}
