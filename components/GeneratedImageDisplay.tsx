import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DownloadIcon, SparklesIcon, ArrowsRightLeftIcon, FoodioIcon } from './Icons';

interface GeneratedImageDisplayProps {
  isLoading: boolean;
  isTextLoading: boolean;
  generatedImage: string | null;
  finalImage: string | null;
  originalImage: string | null;
}

const imageLoadingMessages = [
  "Preparing the digital studio...",
  "Sourcing the freshest pixels...",
  "Adjusting the virtual lighting...",
  "Adding a dash of AI magic...",
  "Developing the final shot...",
];

const textLoadingMessages = [
    "Hiring an AI graphic designer...",
    "Choosing the perfect typography...",
    "Finding the best text placement...",
    "Applying the design...",
    "Finalizing the promotional image...",
];

const LoadingSkeleton: React.FC<{isTextLoading: boolean}> = ({ isTextLoading }) => {
    const loadingMessages = isTextLoading ? textLoadingMessages : imageLoadingMessages;
    const [message, setMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        let messageIndex = 0;
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setMessage(loadingMessages[messageIndex]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [loadingMessages]);

    return (
        <div className="w-full aspect-video bg-gray-200 rounded-lg animate-pulse flex flex-col items-center justify-center text-gray-500 p-4 text-center">
            <SparklesIcon className="w-16 h-16 text-gray-400 animate-pulse" />
            <p className="mt-4 text-lg font-semibold text-gray-700">{message}</p>
        </div>
    );
};

const Placeholder: React.FC = () => (
    <div className="w-full aspect-video bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 text-center p-4">
        <FoodioIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-xl font-bold text-gray-700">Your masterpiece awaits</p>
        <p>The generated photo will appear here.</p>
    </div>
);

const ImageCompareSlider: React.FC<{ before: string; after: string; beforeLabel: string; afterLabel: string }> = ({ before, after, beforeLabel, afterLabel }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    }, [isDragging]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const handleMouseUp = () => setIsDragging(false);
        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const handleTouchEnd = () => setIsDragging(false);
        const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            container?.addEventListener('touchmove', handleTouchMove);
            container?.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            container?.removeEventListener('touchmove', handleTouchMove);
            container?.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMove]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-video select-none rounded-lg overflow-hidden cursor-ew-resize group"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <img src={after} alt="After" className="w-full h-full object-contain pointer-events-none" />
            
            <div className="absolute top-0 left-0 h-full w-full pointer-events-none" style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}>
                <img src={before} alt="Before" className="w-full h-full object-contain pointer-events-none" />
            </div>
            
            <div className="absolute top-0 bottom-0 w-1 bg-white/75 backdrop-blur-sm pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ left: `calc(${sliderPosition}% - 0.5px)` }}>
                <div className="bg-white rounded-full p-1.5 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-2xl ring-2 ring-white/50">
                    <ArrowsRightLeftIcon className="w-5 h-5 text-gray-800" />
                </div>
            </div>
            
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">{beforeLabel}</div>
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold py-1 px-2 rounded pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">{afterLabel}</div>
        </div>
    );
};


export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ isLoading, isTextLoading, generatedImage, finalImage, originalImage }) => {
  if (isLoading || isTextLoading) {
    return <LoadingSkeleton isTextLoading={isTextLoading} />;
  }

  const beforeImage = finalImage ? generatedImage : originalImage;
  const afterImage = finalImage ? finalImage : generatedImage;
  
  const beforeLabel = finalImage ? 'STUDIO SHOT' : 'ORIGINAL';
  const afterLabel = finalImage ? 'WITH TEXT' : 'STUDIO SHOT';

  if (!afterImage || !beforeImage) {
    return <Placeholder />;
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <ImageCompareSlider 
        before={beforeImage} 
        after={afterImage} 
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
      />
      
      {generatedImage && (
        <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3 mt-2">
          {finalImage ? (
            <>
              <a
                href={generatedImage}
                download="foodio-shot.png"
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 transform hover:scale-105 text-center"
              >
                <DownloadIcon className="w-5 h-5" />
                <span>Studio Shot</span>
              </a>
              <a
                href={finalImage}
                download="foodio-promo.png"
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 transform hover:scale-105 text-center"
              >
                <DownloadIcon className="w-5 h-5" />
                <span>Promo (With Text)</span>
              </a>
            </>
          ) : (
            <a
              href={generatedImage}
              download="foodio-shot.png"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 transform hover:scale-105"
            >
              <DownloadIcon className="w-5 h-5" />
              Download Shot
            </a>
          )}
        </div>
      )}
    </div>
  );
};