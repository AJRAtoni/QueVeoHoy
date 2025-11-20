import React from 'react';
import { Movie } from '../types';
import { ArrowLeft, Calendar, User, Trash2 } from 'lucide-react';

interface MatchesProps {
  matches: Movie[];
  onBack: () => void;
  onRemove: (id: string) => void;
}

const Matches: React.FC<MatchesProps> = ({ matches, onBack, onRemove }) => {
  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0f0f0f]/90 backdrop-blur-md py-4 z-30">
        <button 
            onClick={onBack}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold">Mi Lista</h2>
        <div className="w-9"></div> {/* Spacer for alignment */}
      </div>

      {matches.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
            <p className="text-4xl mb-4">🎬</p>
            <p>Tu lista está vacía.</p>
            <p className="text-sm text-gray-600 mt-2">Dale "Like" a las películas para guardarlas aquí.</p>
            <button onClick={onBack} className="mt-6 px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                Buscar películas
            </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((movie) => (
            <div key={movie.id} className="bg-gray-800 rounded-xl overflow-hidden flex shadow-lg border border-gray-700/50 relative group">
              <img 
                src={movie.posterUrl || `https://picsum.photos/seed/${movie.title.replace(/\s/g,'')}/200/300`} 
                className="w-24 min-h-[140px] object-cover bg-gray-900" 
                alt={movie.title}
              />
              <div className="p-4 flex flex-col justify-center flex-1 pr-12">
                <h3 className="font-bold text-lg leading-tight mb-1">{movie.title}</h3>
                <div className="flex items-center text-xs text-gray-400 mb-2 space-x-3">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {movie.year}</span>
                    <span className="flex items-center"><User className="w-3 h-3 mr-1"/> {movie.director}</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{movie.description}</p>
              </div>
              
              <button 
                onClick={() => movie.id && onRemove(movie.id)}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-700/50 rounded-full transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;