import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Film, User, Video, Link as LinkIcon } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
  initialValues?: UserPreferences | null;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialValues }) => {
  const [formData, setFormData] = useState<UserPreferences>(initialValues || {
    favoriteMovie: '',
    favoriteDirector: '',
    favoriteActor: '',
    letterboxdUrl: ''
  });

  const handleInputChange = (field: keyof UserPreferences, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.favoriteMovie && formData.favoriteDirector && formData.favoriteActor) {
      onComplete(formData);
    }
  };

  const isFormValid = 
    formData.favoriteMovie.trim().length > 0 &&
    formData.favoriteDirector.trim().length > 0 &&
    formData.favoriteActor.trim().length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
            QueVeoHoy
          </h1>
          <p className="text-gray-400">Recomendaciones personalizadas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4 relative z-10">
            
            <AutocompleteInput
              label={<><Film className="w-4 h-4 mr-2 text-red-500" /> Película Favorita</>}
              name="favoriteMovie"
              placeholder="Ej: El Padrino"
              value={formData.favoriteMovie}
              onChange={(val) => handleInputChange('favoriteMovie', val)}
              type="movie"
            />

            <AutocompleteInput
              label={<><Video className="w-4 h-4 mr-2 text-red-500" /> Director Favorito</>}
              name="favoriteDirector"
              placeholder="Ej: Christopher Nolan"
              value={formData.favoriteDirector}
              onChange={(val) => handleInputChange('favoriteDirector', val)}
              type="person"
              filterRole="Directing"
            />

            <AutocompleteInput
              label={<><User className="w-4 h-4 mr-2 text-red-500" /> Actor/Actriz Favorito</>}
              name="favoriteActor"
              placeholder="Ej: Meryl Streep"
              value={formData.favoriteActor}
              onChange={(val) => handleInputChange('favoriteActor', val)}
              type="person"
              filterRole="Acting"
            />

            <div className="pt-4 border-t border-gray-700/50">
                <div className="space-y-2 relative">
                    <label className="flex items-center text-sm font-medium text-gray-300">
                        <LinkIcon className="w-4 h-4 mr-2 text-green-500" /> Perfil Letterboxd (Opcional)
                    </label>
                    <input
                        type="text"
                        placeholder="https://letterboxd.com/tu_usuario"
                        className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors text-sm"
                        value={formData.letterboxdUrl || ''}
                        onChange={(e) => handleInputChange('letterboxdUrl', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Ayudará a filtrar lo que ya has visto.</p>
                </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${
              isFormValid 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {initialValues ? 'Guardar Cambios' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;