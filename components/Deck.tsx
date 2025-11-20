import React, { useState } from 'react';
import { Movie } from '../types';
import SwipeCard from './SwipeCard';
import { X, Heart, Loader2 } from 'lucide-react';

interface DeckProps {
  movies: Movie[];
  onSwipeRight: (movie: Movie) => void;
  onSwipeLeft: (movie: Movie) => void;
  onFinish: () => void;
  isLoading: boolean;
}

const Deck: React.FC<DeckProps> = ({ movies, onSwipeRight, onSwipeLeft, onFinish, isLoading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentMovie = movies[currentIndex];
    if (direction === 'right') {
      onSwipeRight(currentMovie);
    } else {
      onSwipeLeft(currentMovie);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= movies.length) {
      onFinish();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // Simulate swipe via buttons
  const triggerSwipe = (dir: 'left' | 'right') => {
     // In a real app with framer-motion, we'd drive the animation here.
     // For this implementation, we force the index update immediately 
     // effectively skipping the animation for button clicks, or we could ref the card.
     // To keep it simple:
     handleSwipe(dir);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
            <Loader2 className="w-16 h-16 text-red-500 animate-spin relative z-10" />
        </div>
        <h3 className="mt-8 text-xl font-bold text-white">Analizando tus gustos...</h3>
        <p className="text-gray-400 mt-2">Nuestra IA está buscando las mejores películas para ti.</p>
      </div>
    );
  }

  if (currentIndex >= movies.length) {
     return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
            <h3 className="text-2xl font-bold text-white mb-4">¡Eso es todo!</h3>
            <p className="text-gray-400">No tenemos más recomendaciones por ahora.</p>
            <button onClick={onFinish} className="mt-6 px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition">
                Ver mis matches
            </button>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md h-full">
      <div className="relative w-full h-[75vh] mb-6">
        {movies.map((movie, index) => {
          // Only render current and next card for performance
          if (index < currentIndex) return null;
          if (index > currentIndex + 1) return null; 
          
          return (
            <SwipeCard
              key={movie.id || index}
              movie={movie}
              active={index === currentIndex}
              onSwipe={handleSwipe}
            />
          );
        })}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-8 w-full px-8">
        <button 
            onClick={() => triggerSwipe('left')}
            className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 text-red-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-gray-700"
        >
            <X className="w-8 h-8" />
        </button>
        
        <button 
            onClick={() => triggerSwipe('right')}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-red-900/50 active:scale-90 transition-transform hover:brightness-110"
        >
            <Heart className="w-8 h-8 fill-current" />
        </button>
      </div>
    </div>
  );
};

export default Deck;