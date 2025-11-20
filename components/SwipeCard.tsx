import React, { useState, useEffect } from 'react';
import { Movie } from '../types';

interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right') => void;
  active: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ movie, onSwipe, active }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);

  // Reset state when movie changes
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setOpacity(1);
  }, [movie.id]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!active) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !active) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    setOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    if (!active) return;
    setIsDragging(false);
    
    const threshold = 100; // px to trigger swipe
    
    if (offset.x > threshold) {
      // Swipe Right
      setOffset({ x: 500, y: offset.y });
      setOpacity(0);
      setTimeout(() => onSwipe('right'), 200);
    } else if (offset.x < -threshold) {
      // Swipe Left
      setOffset({ x: -500, y: offset.y });
      setOpacity(0);
      setTimeout(() => onSwipe('left'), 200);
    } else {
      // Reset
      setOffset({ x: 0, y: 0 });
      setRotation(0);
    }
  };

  const overlayColor = offset.x > 0 ? 'bg-green-500' : 'bg-red-500';
  const overlayOpacity = Math.min(Math.abs(offset.x) / 200, 0.5);

  // Fallback image if TMDB fails
  const backgroundImage = movie.posterUrl || `https://picsum.photos/seed/${movie.title.replace(/\s/g,'')}/600/900`;

  return (
    <div
      className="absolute top-0 left-0 w-full h-full transition-transform duration-0 ease-linear cursor-grab active:cursor-grabbing"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        opacity: opacity,
        transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
        zIndex: active ? 10 : 0,
        pointerEvents: active ? 'auto' : 'none',
      }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Card Container */}
      <div className="relative w-full h-[75vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 select-none">
        
        {/* Poster Background */}
        <div className="absolute inset-0 bg-gray-900 z-0">
            <img 
                src={backgroundImage} 
                alt={movie.title} 
                className="w-full h-full object-cover"
                draggable={false}
            />
            {/* Gradient Overlay: Transparent at top, Dark at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
        </div>

        {/* Swipe Overlay Indicator */}
        <div 
            className={`absolute inset-0 ${overlayColor} z-10 transition-opacity pointer-events-none`}
            style={{ opacity: overlayOpacity }} 
        />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pb-10">
            <div className="flex items-start justify-between mb-2">
                <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-lg max-w-[80%]">
                    {movie.title}
                </h2>
                <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-white/20">
                    {movie.year}
                </span>
            </div>
            
            <p className="text-red-400 font-medium text-sm mb-3 uppercase tracking-wide drop-shadow-sm">
                {movie.director}
            </p>
            
            <p className="text-gray-100 text-sm mb-4 line-clamp-3 drop-shadow-md leading-relaxed font-medium">
                {movie.description}
            </p>

            <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-3 border border-gray-700/50 shadow-lg">
                <div className="flex items-center text-xs text-yellow-400 mb-1 font-bold">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    ¿Por qué verla?
                </div>
                <p className="text-xs text-gray-300 italic">"{movie.reason}"</p>
            </div>
        </div>

        {/* Action Hints (visible only when swiping) */}
        {active && (
            <>
                <div 
                    className="absolute top-8 left-8 border-4 border-green-500 text-green-500 rounded-lg px-4 py-2 font-bold text-2xl transform -rotate-12 opacity-0 transition-opacity bg-black/20 backdrop-blur-sm"
                    style={{ opacity: offset.x > 50 ? 1 : 0 }}
                >
                    LIKE
                </div>
                <div 
                    className="absolute top-8 right-8 border-4 border-red-500 text-red-500 rounded-lg px-4 py-2 font-bold text-2xl transform rotate-12 opacity-0 transition-opacity bg-black/20 backdrop-blur-sm"
                    style={{ opacity: offset.x < -50 ? 1 : 0 }}
                >
                    NOPE
                </div>
            </>
        )}

      </div>
    </div>
  );
};

const SparklesIcon = ({className}: {className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M9.75 12.75l1.5 4.5 1.5-4.5 4.5-1.5-4.5-1.5-1.5-4.5-1.5 4.5-4.5 1.5 4.5 1.5z" />
    </svg>
);

export default SwipeCard;