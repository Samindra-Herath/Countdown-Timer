import React, { useState } from 'react';
import { CountdownConfig, defaultConfig } from './types';
import { Dashboard } from './Dashboard';
import { LiveView } from './LiveView';

export default function App() {
  const [config, setConfig] = useState<CountdownConfig>(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedConfig = params.get('config') || params.get('c');
    if (encodedConfig) {
      try {
        const decodedStr = decodeURIComponent(escape(atob(encodedConfig)));
        const decoded = JSON.parse(decodedStr);
        return { ...defaultConfig, ...decoded };
      } catch (e) {
        console.error("Invalid config URL parameter", e);
      }
    }
    return defaultConfig;
  });
  
  const [isLive, setIsLive] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('config') || params.get('c'));
  });

  const [isReady] = useState(true);

  const handleShare = () => {
    // Sanitize config - don't serialize local blob URLs
    const configToShare = { ...config };
    if (configToShare.customAudioUrl && configToShare.customAudioUrl.startsWith('blob:')) {
      delete configToShare.customAudioUrl;
    }

    // Compress layout to base64 with unicode support
    const minified = JSON.stringify(configToShare);
    const encoded = btoa(unescape(encodeURIComponent(minified)));
    
    // Dynamic Origin Detection: construct public sharing URL without hardcoding
    const productionUrl = window.location.origin + window.location.pathname;
    const url = `${productionUrl}?config=${encodeURIComponent(encoded)}`;
    
    // Copy to clipboard with robust fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          console.log('Public URL copied to clipboard:', url);
        })
        .catch((err) => {
          console.warn('Clipboard API failed, running fallback copy:', err);
          fallbackCopyText(url);
        });
    } else {
      fallbackCopyText(url);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        console.log('Fallback copying worked!');
      } else {
        console.error('Fallback copying failed');
      }
    } catch (err) {
      console.error('Fallback copying errored:', err);
    }
  };

  if (!isReady) return null;

  return (
    <>
      {isLive ? (
        <LiveView config={config} />
      ) : (
        <Dashboard 
          config={config} 
          onChange={setConfig} 
          onShare={handleShare} 
        />
      )}
    </>
  );
}
