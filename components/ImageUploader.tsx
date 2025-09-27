import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Simple validation for image types
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative w-full aspect-video border-2 border-dashed rounded-xl flex items-center justify-center text-center p-4 cursor-pointer transition-all duration-300 ${isDragging ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-500 hover:bg-gray-50'}`}
      role="button"
      aria-label="Image uploader"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
      />
      {preview ? (
        <img src={preview} alt="Uploaded food" className="max-h-full w-full object-contain rounded-md" />
      ) : (
        <div className="flex flex-col items-center text-gray-500 pointer-events-none">
          <UploadIcon className="w-12 h-12 mb-2" />
          <p className="font-semibold text-gray-700">Click to upload or drag & drop</p>
          <p className="text-sm text-gray-500">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};