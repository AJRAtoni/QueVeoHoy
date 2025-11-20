export interface UserPreferences {
  favoriteMovie: string;
  favoriteDirector: string;
  favoriteActor: string;
  letterboxdUrl?: string;
}

export interface Movie {
  title: string;
  year: string;
  director: string;
  description: string;
  reason: string; // Why it was recommended
  id?: string;
  posterUrl?: string | null;
}

export enum AppStep {
  ONBOARDING = 'ONBOARDING',
  GENRE_SELECTION = 'GENRE_SELECTION',
  SWIPING = 'SWIPING',
  MATCHES = 'MATCHES'
}

export const GENRES = [
  { id: 'action', label: 'Acción', icon: '💥' },
  { id: 'romance', label: 'Romance', icon: '❤️' },
  { id: 'scifi', label: 'Sci-Fi', icon: '👽' },
  { id: 'horror', label: 'Terror', icon: '👻' },
  { id: 'comedy', label: 'Comedia', icon: '😂' },
  { id: 'drama', label: 'Drama', icon: '🎭' },
  { id: 'thriller', label: 'Suspense', icon: '🔪' },
  { id: 'war', label: 'Bélico', icon: '⚔️' },
];