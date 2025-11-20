import React from 'react';
import { GENRES } from '../types';
import { Sparkles, Settings, List } from 'lucide-react';

interface GenreSelectorProps {
  onSelectGenre: (genre: string) => void;
  onSettingsClick: () => void;
  onMyListClick: () => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ onSelectGenre, onSettingsClick, onMyListClick }) => {
  return (
    <div className="flex flex-col items-center min-h-screen p-6 pt-12 relative">
      
      {/* Header Buttons */}
      <div className="absolute top-6 left-6 right-6 flex justify-between">
          <button 
            onClick={onMyListClick}
            className="p-3 bg-gray-800/50 backdrop-blur rounded-full border border-gray-700 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white flex items-center gap-2 px-4"
            aria-label="Mi Lista"
          >
            <List className="w-5 h-5" />
            <span className="hidden md:inline font-medium text-sm">Mi Lista</span>
          </button>

          <button 
            onClick={onSettingsClick}
            className="p-3 bg-gray-800/50 backdrop-blur rounded-full border border-gray-700 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            aria-label="Configuración"
          >
            <Settings className="w-5 h-5" />
          </button>
      </div>

      <div className="text-center mb-8 mt-12">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-400" /> ¿Qué te apetece hoy?
        </h2>
        <p className="text-gray-400 text-sm mt-2">Selecciona un estado de ánimo o género</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-8">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelectGenre(genre.label)}
            className="aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 bg-gray-800/50 hover:bg-gray-700/80 border border-gray-700 hover:border-red-500/50 transition-all duration-300 group active:scale-95"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
              {genre.icon}
            </span>
            <span className="font-semibold text-lg text-gray-200 group-hover:text-white">
              {genre.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GenreSelector;