export type LayoutType = 'minimalist' | 'digital' | 'brutalist';
export type FontType = 'Inter' | 'Montserrat' | 'JetBrains Mono' | 'Playfair Display';
export type BackgroundAnimation = 'none' | 'music_notes' | 'matrix' | 'cyberpunk' | 'geometry';

export type MusicCategory = 
  | 'none' 
  | 'cinematic_epic'
  | 'cinematic_valkyries' 
  | 'cinematic_mars' 
  | 'emotional_piano'
  | 'emotional_moonlight' 
  | 'emotional_nocturne' 
  | 'energetic_upbeat'
  | 'energetic_summer' 
  | 'energetic_bumblebee';

export interface CountdownConfig {
  title: string;
  description: string;
  date: string;
  time: string;
  layout: LayoutType;
  font: FontType;
  bgColor: string;
  textColor: string;
  cardColor: string;
  showMs: boolean;
  showConfetti: boolean;
  music: MusicCategory;
  customAudioUrl?: string;
  audioVolume: number;
  audioLoop: boolean;
  animation: BackgroundAnimation;
  animationSpeed: number;
  animationDensity: number;
}

export const defaultConfig: CountdownConfig = {
  title: 'Global Product Launch',
  description: 'An upcoming spectacular event.',
  date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  time: '09:00',
  layout: 'digital',
  font: 'JetBrains Mono',
  bgColor: '#020617',
  textColor: '#f1f5f9',
  cardColor: '#ffffff1a',
  showMs: true,
  showConfetti: true,
  music: 'none',
  audioVolume: 0.5,
  audioLoop: true,
  animation: 'none',
  animationSpeed: 3,
  animationDensity: 50,
};
