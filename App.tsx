
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { CropIcon } from './components/icons/CropIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { ResetIcon } from './components/icons/ResetIcon';

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Failed to get 2D context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    resolve(canvas.toDataURL('image/png'));
  });
}

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

function App() {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
        setError(`Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`);
        setImgSrc('');
        return;
    }
    const newCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, ASPECT_RATIO, width, height),
      width,
      height
    );
    setCrop(newCrop);
  }, []);

  const handleCropImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }
    try {
      const dataUrl = await getCroppedImg(imgRef.current, completedCrop);
      setCroppedImageUrl(dataUrl);
    } catch (e) {
      console.error(e);
      setError("An error occurred while cropping the image.");
    }
  }, [completedCrop]);

  const handleReset = useCallback(() => {
    setImgSrc('');
    setCroppedImageUrl('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setError(null);
  }, []);

  const onSelectFile = useCallback((imageDataUrl: string) => {
    setError(null);
    setImgSrc(imageDataUrl);
  }, []);

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">Image Cropping Tool</h1>
          <p className="mt-2 text-lg text-gray-400">Upload, crop, and download your images with ease.</p>
        </header>

        {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-6 text-center" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
        )}

        <main className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all duration-300">
          {!imgSrc ? (
            <ImageUploader onImageLoaded={onSelectFile} />
          ) : !croppedImageUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-lg mb-6">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={ASPECT_RATIO}
                  minWidth={MIN_DIMENSION}
                  minHeight={MIN_DIMENSION}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    className="w-full h-auto rounded-lg"
                  />
                </ReactCrop>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleCropImage}
                  disabled={!completedCrop?.width || !completedCrop?.height}
                  icon={<CropIcon />}
                >
                  Crop Image
                </Button>
                 <Button onClick={handleReset} variant="secondary" icon={<ResetIcon />}>
                  Choose Another Image
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4 text-center">Your Cropped Image</h2>
              <div className="mb-6 border-4 border-blue-500 rounded-lg shadow-lg">
                <img alt="Cropped" src={croppedImageUrl} className="rounded-md" style={{ maxWidth: '100%', maxHeight: '60vh' }}/>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                 <a href={croppedImageUrl} download="cropped-image.png" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors">
                  <DownloadIcon />
                  <span className="ml-2">Download Image</span>
                </a>
                <Button onClick={handleReset} variant="secondary" icon={<ResetIcon />}>
                  Crop Another
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
