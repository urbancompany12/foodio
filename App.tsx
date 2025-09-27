import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { enhanceImage, addTextToImage } from './services/geminiService';
import { ArrowRightIcon, EyeLevelIcon, Angle45Icon, TopDownIcon, TypeIcon, SparklesIcon } from './components/Icons';

const presetPrompts = [
    { name: '✨ Cinematic', prompt: 'Cinematic lighting, dramatic shadows, professional food photography' },
    { name: '🌲 Rustic', prompt: 'On a rustic wooden table, with natural lighting from a window, earthy tones' },
    { name: '☀️ Bright & Airy', prompt: 'Bright and airy style, minimalist, clean background, soft light' },
    { name: '🌙 Dark & Moody', prompt: 'Dark and moody atmosphere, deep shadows, rich colors, elegant' },
    { name: '🌿 Fresh & Natural', prompt: 'Vibrant, fresh and natural setting, with green herbs and fresh ingredients around, daylight' },
    { name: '❤️ Homemade Look', prompt: 'Warm, cozy, homemade look, on a kitchen counter with a checkered napkin, comfortable feeling' },
];

const textPresetPrompts = [
    { name: 'Minimalist White', prompt: 'Simple, clean, modern sans-serif font in white. Place it elegantly.' },
    { name: 'Bold & Punchy', prompt: 'Thick, bold, impactful font. Use bright colors like yellow or red, possibly with a subtle dark outline to make it pop. Great for sales.' },
    { name: 'Elegant Script', prompt: 'A beautiful, flowing script font. Looks handwritten and classy. Good for premium products.' },
];

const cameraAngles = [
    { name: 'Eye-Level', value: 'Eye-Level View', icon: <EyeLevelIcon className="w-8 h-8 mx-auto mb-2" /> },
    { name: '45-Degree', value: '45-Degree Angle', icon: <Angle45Icon className="w-8 h-8 mx-auto mb-2" /> },
    { name: 'Top-Down', value: 'Top-Down View', icon: <TopDownIcon className="w-8 h-8 mx-auto mb-2" /> },
];

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-orange-600">
                {number}
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-wide">{title}</h2>
        </div>
        <div>{children}</div>
    </div>
);

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [cameraAngle, setCameraAngle] = useState<string>('45-Degree Angle');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTextLoading, setIsTextLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [promoHeadline, setPromoHeadline] = useState('');
  const [promoDetails, setPromoDetails] = useState('');
  const [promoStyle, setPromoStyle] = useState('');

  const handleImageUpload = (file: File) => {
    setOriginalImage(file);
    setGeneratedImage(null);
    setFinalImage(null);
    setError(null);
  };

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setFinalImage(null);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(originalImage);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      const mimeType = originalImage.type;
      const result = await enhanceImage(base64Image, mimeType, prompt, cameraAngle);
      setGeneratedImage(`data:image/png;base64,${result}`);
    } catch (err) {
      console.error(err);
      setError('Failed to generate image. Please check your connection or try a different image.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, cameraAngle]);

  const handleAddTextClick = useCallback(async () => {
    if (!generatedImage) {
        setError('Please generate an image first.');
        return;
    }

    setIsTextLoading(true);
    setError(null);
    setFinalImage(null);

    try {
        const base64Image = generatedImage.split(',')[1];
        const mimeType = 'image/png'; 
        const result = await addTextToImage(base64Image, mimeType, promoHeadline, promoDetails, promoStyle);
        setFinalImage(`data:image/png;base64,${result}`);
    } catch (err) {
        console.error(err);
        setError('Failed to add text to the image. Please try again.');
    } finally {
        setIsTextLoading(false);
    }
}, [generatedImage, promoHeadline, promoDetails, promoStyle]);


  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${presetPrompt}` : presetPrompt);
  };
  
  const handleTextPresetClick = (presetPrompt: string) => {
    setPromoStyle(prev => prev ? `${prev}, ${presetPrompt}` : presetPrompt);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans antialiased">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Input Panel */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col gap-8">
            <Step number={1} title="Upload Your Food Photo">
                <ImageUploader onImageUpload={handleImageUpload} />
            </Step>
            
            <Step number={2} title="Choose a Camera Angle">
                <div className="grid grid-cols-3 gap-4">
                    {cameraAngles.map((angle) => (
                        <button
                            key={angle.value}
                            onClick={() => setCameraAngle(angle.value)}
                            className={`p-4 text-center rounded-lg border-2 transition-all duration-200 group ${cameraAngle === angle.value ? 'bg-orange-100 border-orange-500 text-orange-600' : 'bg-white border-gray-300 hover:border-orange-400 text-gray-600 hover:text-gray-800'}`}
                        >
                            <div className={`transition-transform duration-200 ${cameraAngle === angle.value ? 'scale-110' : 'group-hover:scale-105'}`}>{angle.icon}</div>
                            <span className="text-sm font-semibold">{angle.name}</span>
                        </button>
                    ))}
                </div>
            </Step>
            
            <Step number={3} title="Add a Creative Touch">
                <div className="flex flex-col gap-4">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., 'Make it look like it's on a rustic wooden table' or 'Add cinematic lighting'"
                      className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 h-28 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 placeholder-gray-400"
                      aria-label="Creative prompt for image generation"
                    />
                    <div>
                        <p className="text-sm text-gray-600 mb-3">Or start with a Style Idea:</p>
                        <div className="flex flex-wrap gap-2">
                            {presetPrompts.map((p) => (
                                <button
                                    key={p.name}
                                    onClick={() => handlePresetClick(p.prompt)}
                                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-orange-500 hover:text-white transition-colors duration-200"
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Step>
            
            <div>
                <button
                  onClick={handleGenerateClick}
                  disabled={!originalImage || isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-orange-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/50 disabled:shadow-none"
                >
                  <SparklesIcon className="w-6 h-6" />
                  {isLoading ? 'Generating...' : 'Generate Studio Shot'}
                </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 min-h-[300px] flex flex-col sticky top-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide mb-6">Result</h2>
            <GeneratedImageDisplay
              isLoading={isLoading}
              isTextLoading={isTextLoading}
              generatedImage={generatedImage}
              finalImage={finalImage}
              originalImage={originalImage ? URL.createObjectURL(originalImage) : null}
            />
            
            {generatedImage && !isLoading && (
                 <div className="mt-6 border-t-2 border-gray-200 pt-6 flex flex-col gap-4 animate-fade-in">
                    <Step number={4} title="Add Promotional Text">
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={promoHeadline}
                                onChange={(e) => setPromoHeadline(e.target.value)}
                                placeholder="Headline (e.g., 'Bakso Special')"
                                className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 placeholder-gray-400"
                            />
                             <input
                                type="text"
                                value={promoDetails}
                                onChange={(e) => setPromoDetails(e.target.value)}
                                placeholder="Details (e.g., 'Isi 20 Pcs')"
                                className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 placeholder-gray-400"
                            />
                            <textarea
                                value={promoStyle}
                                onChange={(e) => setPromoStyle(e.target.value)}
                                placeholder="Describe the text style... e.g., 'Bold yellow text with a thin black outline at the top'"
                                className="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-300 placeholder-gray-400"
                            />
                             <div>
                                <p className="text-sm text-gray-600 mb-3">Or start with a Text Style Idea:</p>
                                <div className="flex flex-wrap gap-2">
                                    {textPresetPrompts.map((p) => (
                                        <button
                                            key={p.name}
                                            onClick={() => handleTextPresetClick(p.prompt)}
                                            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-orange-500 hover:text-white transition-colors duration-200"
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddTextClick}
                            disabled={isTextLoading || !promoHeadline}
                            className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/50 disabled:shadow-none mt-2"
                        >
                           {isTextLoading ? 'Designing...' : 'Add Text to Image'}
                           {!isTextLoading && <TypeIcon className="w-6 h-6" />}
                        </button>
                    </Step>
                 </div>
            )}
             {error && <div role="alert" className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center mt-4">{error}</div>}
          </div>
        </div>
      </main>
       <footer className="text-center py-8 text-gray-500 text-sm">
        <p>Powered by Gemini AI. Created by Foodio.</p>
      </footer>
    </div>
  );
};

export default App;