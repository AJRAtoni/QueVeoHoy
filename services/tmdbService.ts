const API_KEY = 'd3aea9c9b1bb387d2e83a4bb0c923ab3';
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBResult {
  id: number;
  title?: string; // for movies
  name?: string; // for people
  release_date?: string; // movies
  known_for_department?: string; // people
  poster_path?: string;
  profile_path?: string;
}

export const searchTMDB = async (query: string, type: 'movie' | 'person', roleFilter?: string): Promise<TMDBResult[]> => {
  if (!query || query.length < 2) return [];
  
  const endpoint = type === 'movie' ? 'search/movie' : 'search/person';
  const url = `${BASE_URL}/${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-ES&page=1&include_adult=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    let results: TMDBResult[] = data.results || [];

    // Filter by role if provided (e.g. 'Directing' or 'Acting')
    if (type === 'person' && roleFilter) {
      results = results.filter(person => person.known_for_department === roleFilter);
    }

    return results;
  } catch (error) {
    console.error("Error fetching TMDB data:", error);
    return [];
  }
};

export const getImageUrl = (path: string | null | undefined, size: 'w92' | 'w154' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};