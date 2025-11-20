import React, { useState, useEffect } from 'react';
import { AppStep, UserPreferences, Movie } from './types';
import Onboarding from './components/Onboarding';
import GenreSelector from './components/GenreSelector';
import Deck from './components/Deck';
import Matches from './components/Matches';
import { getMovieRecommendations } from './services/geminiService';
import { getPreferences, savePreferences, getLikedMovies, saveLikedMovies } from './services/storageService';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // Initialize preferences from storage if available
  const [preferences, setPreferences] = useState<UserPreferences | null>(getPreferences());
  
  // Skip onboarding if we already have preferences
  const [step, setStep] = useState<AppStep>(() => {
    return getPreferences() ? AppStep.GENRE_SELECTION : AppStep.ONBOARDING;
  });

  // Load liked movies from storage
  const [likedMovies, setLikedMovies] = useState<Movie[]>(getLikedMovies());
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist liked movies whenever they change
  useEffect(() => {
    saveLikedMovies(likedMovies);
  }, [likedMovies]);

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    savePreferences(prefs); // Persist to localStorage
    setPreferences(prefs);
    setStep(AppStep.GENRE_SELECTION);
  };

  const handleGenreSelect = async (genre: string) => {
    if (!preferences) return;
    
    setStep(AppStep.SWIPING);
    setIsLoading(true);
    setError(null);
    
    try {
        const movies = await getMovieRecommendations(preferences, genre);
        if (movies.length === 0) {
            setError("No pudimos encontrar recomendaciones. Por favor, intenta con otro género o verifica tu API Key.");
        } else {
            setRecommendations(movies);
        }
    } catch (e: any) {
        console.error("App Error:", e);
        let msg = "Ocurrió un problema al conectar con la IA.";
        if (e.message === 'API_KEY_MISSING') {
            msg = "No se encontró la API Key. Verifica la configuración en Vercel (VITE_API_KEY).";
        }
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSwipeRight = (movie: Movie) => {
    setLikedMovies((prev) => {
        // Prevent duplicates just in case
        if (prev.some(m => m.title === movie.title)) return prev;
        return [movie, ...prev];
    });
  };

  const handleSwipeLeft = (movie: Movie) => {
    // Discard logic if needed
  };

  const handleDeckFinished = () => {
    setStep(AppStep.MATCHES);
  };

  const handleBackToMenu = () => {
    // Don't clear likedMovies, just go back to genre selection
    setRecommendations([]);
    setStep(AppStep.GENRE_SELECTION);
  };

  const handleOpenSettings = () => {
    setStep(AppStep.ONBOARDING);
  };

  const handleOpenMyList = () => {
      setStep(AppStep.MATCHES);
  };

  const handleRemoveMovie = (id: string) => {
      setLikedMovies(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white mx-auto max-w-md md:max-w-full overflow-hidden">
      {step === AppStep.ONBOARDING && (
        <Onboarding 
            onComplete={handleOnboardingComplete} 
            initialValues={preferences}
        />
      )}
      
      {step === AppStep.GENRE_SELECTION && (
        <GenreSelector 
            onSelectGenre={handleGenreSelect} 
            onSettingsClick={handleOpenSettings}
            onMyListClick={handleOpenMyList}
        />
      )}
      
      {step === AppStep.SWIPING && (
        <div className="h-screen p-4 pt-8 flex items-center justify-center">
            {error ? (
                <div className="text-center max-w-xs p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Ups, algo falló</h3>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
                    <button 
                        onClick={() => setStep(AppStep.GENRE_SELECTION)}
                        className="w-full py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                    >
                        Volver al menú
                    </button>
                </div>
            ) : (
                <Deck 
                    movies={recommendations} 
                    onSwipeRight={handleSwipeRight} 
                    onSwipeLeft={handleSwipeLeft}
                    onFinish={handleDeckFinished}
                    isLoading={isLoading}
                />
            )}
        </div>
      )}

      {step === AppStep.MATCHES && (
        <Matches 
            matches={likedMovies} 
            onBack={handleBackToMenu} 
            onRemove={handleRemoveMovie}
        />
      )}
    </div>
  );
};

export default App;