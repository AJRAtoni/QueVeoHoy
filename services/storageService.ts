import { UserPreferences, Movie } from '../types';

const PREFS_KEY = 'queveohoy_prefs';
const LIKED_MOVIES_KEY = 'queveohoy_liked';

export const savePreferences = (prefs: UserPreferences) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};

export const getPreferences = (): UserPreferences | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(PREFS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing preferences", e);
    return null;
  }
};

export const saveLikedMovies = (movies: Movie[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LIKED_MOVIES_KEY, JSON.stringify(movies));
  }
};

export const getLikedMovies = (): Movie[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LIKED_MOVIES_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    // Basic validation to ensure it's an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error parsing liked movies", e);
    return [];
  }
};

export const addLikedMovie = (movie: Movie) => {
  const current = getLikedMovies();
  // Avoid duplicates based on title + year
  if (!current.some(m => m.title === movie.title && m.year === movie.year)) {
    const updated = [movie, ...current];
    saveLikedMovies(updated);
    return updated;
  }
  return current;
};

export const removeLikedMovie = (movieId: string) => {
    const current = getLikedMovies();
    const updated = current.filter(m => m.id !== movieId);
    saveLikedMovies(updated);
    return updated;
}