import { GoogleGenAI } from "@google/genai";
import { UserPreferences, Movie } from "../types";
import { searchTMDB, getImageUrl } from "./tmdbService";

// Helper to safely get the API Key in different environments (Vite, Vercel, Node)
const getApiKey = (): string | undefined => {
  try {
    // Check for Vite environment variable (Vercel/Client-side)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }
  
  // Fallback to standard process.env
  return process.env.API_KEY;
};

export const getMovieRecommendations = async (
  prefs: UserPreferences,
  genreLabel: string
): Promise<Movie[]> => {
  
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("API Key not found. Please check your configuration (VITE_API_KEY or API_KEY).");
    // We throw so the UI can catch it and show an error instead of hanging
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let letterboxdContext = "";
  let filmsUrl = "";

  if (prefs.letterboxdUrl) {
    // Normalize URL to ensure we point to the /films/ section (watched movies)
    let baseUrl = prefs.letterboxdUrl.trim();
    // Simple check if it's just a username
    if (!baseUrl.includes('letterboxd.com') && !baseUrl.includes('/')) {
        baseUrl = `https://letterboxd.com/${baseUrl}`;
    } else if (!baseUrl.includes('letterboxd.com')) {
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
    }
    
    // Remove trailing slashes
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // If the url doesn't end in /films, append it
    if (!baseUrl.endsWith('/films')) {
        filmsUrl = `${baseUrl}/films/`;
    } else {
        filmsUrl = baseUrl;
    }

    letterboxdContext = `
      El usuario tiene un perfil de Letterboxd.
      URL de películas vistas: ${filmsUrl}
      
      INSTRUCCIÓN CRÍTICA:
      Utiliza la herramienta de búsqueda (Google Search) para buscar si el usuario asociado a esa URL ya ha visto las películas que piensas recomendar.
      Si encuentras evidencia de que ya vio una película, DESCÁRTALA y busca otra.
      Queremos descubrir cosas nuevas.
    `;
  }

  const prompt = `
    Actúa como un experto crítico de cine. 
    El usuario tiene estos gustos:
    - Película favorita: ${prefs.favoriteMovie}
    - Director favorito: ${prefs.favoriteDirector}
    - Actor/Actriz favorito: ${prefs.favoriteActor}
    
    ${letterboxdContext}
    
    El usuario quiere ver una película del género: ${genreLabel}.
    
    Genera una lista de 5 recomendaciones de películas EXCELENTES que crucen estos datos.
    
    FORMATO DE RESPUESTA:
    Debes responder SOLAMENTE con un array JSON válido. No incluyas bloques de código markdown (\`\`\`json).
    El JSON debe tener esta estructura exacta para cada película:
    [
      {
        "title": "Título en Español",
        "year": "Año",
        "director": "Nombre Director",
        "description": "Sinopsis emocionante (max 150 chars)",
        "reason": "Por qué encaja con sus gustos (breve)"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // IMPORTANT: When using googleSearch, we CANNOT use responseMimeType: "application/json" or responseSchema.
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    if (response.text) {
      // Extract JSON from text (Gemini might add conversational text or search metadata)
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        console.error("No JSON found in response:", response.text);
        return [];
      }

      let data;
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON from response", e);
        return [];
      }
      
      if (!Array.isArray(data)) {
        return [];
      }

      // Enhance with TMDB images
      const moviesWithPosters = await Promise.all(data.map(async (movie: Movie, index: number) => {
        let posterUrl = null;
        try {
            const results = await searchTMDB(movie.title, 'movie');
            if (results && results.length > 0) {
                posterUrl = getImageUrl(results[0].poster_path, 'original'); // High quality for background
            }
        } catch (e) {
            console.error("Failed to fetch image for", movie.title);
        }

        return {
            ...movie,
            id: `rec-${Date.now()}-${index}`,
            posterUrl
        };
      }));

      return moviesWithPosters;
    }
    return [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    // Throw error up so UI can handle it
    throw error;
  }
};