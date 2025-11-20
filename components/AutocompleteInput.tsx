import React, { useState, useEffect, useRef } from 'react';
import { searchTMDB, TMDBResult, getImageUrl } from '../services/tmdbService';
import { Loader2, Search, Film, User } from 'lucide-react';

interface AutocompleteInputProps {
  label: React.ReactNode;
  name: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  type: 'movie' | 'person';
  filterRole?: string; // 'Acting' | 'Directing'
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type,
  filterRole
}) => {
  const [suggestions, setSuggestions] = useState<TMDBResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const skipFetchRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // If we just selected an item, skip the fetch to avoid reopening the menu
      if (skipFetchRef.current) {
        skipFetchRef.current = false;
        return;
      }

      if (value.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      const results = await searchTMDB(value, type, filterRole);
      
      // Filter out persons without profile image if you want cleaner UI, optional
      // const validResults = results.filter(r => r.poster_path || r.profile_path);
      
      setSuggestions(results.slice(0, 5)); // Limit to 5 results
      setLoading(false);
      
      if (results.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [value, type, filterRole]);

  const handleSelect = (result: TMDBResult) => {
    const text = result.title || result.name || '';
    skipFetchRef.current = true; // Prevent the effect from fetching immediately
    onChange(text);
    setShowSuggestions(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <label className="flex items-center text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type="text"
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
          value={value}
          onChange={handleChange}
          onFocus={() => {
             if(suggestions.length > 0 && value.length >= 2) setShowSuggestions(true);
          }}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-[#1a1a1a] border border-gray-700 rounded-xl mt-1 overflow-hidden z-50 shadow-2xl animate-fade-in-up">
          {suggestions.map((item) => {
            const title = item.title || item.name;
            const subtitle = item.release_date 
                ? item.release_date.split('-')[0] 
                : item.known_for_department;
            const imgUrl = getImageUrl(item.poster_path || item.profile_path);

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800/50 last:border-none"
              >
                {imgUrl ? (
                  <img 
                    src={imgUrl} 
                    alt={title} 
                    className="w-10 h-14 object-cover rounded bg-gray-700" 
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-800 rounded flex items-center justify-center text-gray-600">
                    {type === 'movie' ? <Film size={16}/> : <User size={16}/>}
                  </div>
                )}
                
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-medium text-sm truncate">{title}</span>
                  <span className="text-gray-500 text-xs truncate">{subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;