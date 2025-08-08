
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageLoaded: (imageDataUrl: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageLoaded(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onImageLoaded]);
  
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  const borderClass = isDragging ? 'border-blue-500' : 'border-gray-600';
  const backgroundClass = isDragging ? 'bg-gray-700' : 'bg-gray-800';

  return (
    <div
      className={`w-full max-w-lg p-8 sm:p-12 text-center border-4 border-dashed ${borderClass} ${backgroundClass} rounded-2xl cursor-pointer transition-all duration-300`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept="image/*"
        onChange={onInputChange}
      />
      <div className="flex flex-col items-center justify-center text-gray-400">
        <UploadIcon />
        <p className="mt-4 text-xl font-semibold">
          Drag & drop your image here
        </p>
        <p className="mt-2 text-sm">or <span className="text-blue-400 font-semibold">click to browse</span></p>
        <p className="mt-4 text-xs text-gray-500">Supports JPG, PNG, WEBP, etc.</p>
      </div>
    </div>
  );
};
