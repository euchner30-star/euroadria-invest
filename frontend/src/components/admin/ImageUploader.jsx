import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

const ImageUploader = ({ 
  onImageUploaded, 
  credentials, 
  currentImage = null,
  label = "Bild hochladen",
  acceptedFormats = ".jpg,.jpeg,.png,.webp,.gif",
  hidePreview = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(currentImage);
  const [error, setError] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP, GIF');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei zu groß. Maximum: 10MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload fehlgeschlagen');
      }

      const data = await response.json();
      setUploadedImage(data.url);
      setUploadInfo(data);
      
      if (onImageUploaded) {
        onImageUploaded(data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }, [credentials, onImageUploaded]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setUploadInfo(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-ea-dark/80 text-sm font-medium">{label}</label>
      
      {/* Preview */}
      {uploadedImage && !hidePreview && (
        <div className="relative group">
          <img 
            src={uploadedImage.startsWith('/') ? uploadedImage : uploadedImage}
            alt="Vorschau" 
            className="w-full h-48 object-cover rounded-xl border border-gray-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x200?text=Bild+nicht+gefunden';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-white rounded-full hover:bg-ea-gold transition-colors"
              title="Ersetzen"
            >
              <Upload className="w-5 h-5 text-ea-dark" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
              title="Entfernen"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          {/* Upload Info */}
          {uploadInfo && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs rounded-lg px-3 py-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                Optimiert
              </span>
              <span>
                {(uploadInfo.optimizedSize / 1024).toFixed(0)} KB 
                <span className="text-green-400 ml-1">(-{uploadInfo.reduction})</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload Zone */}
      {!uploadedImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-ea-gold bg-ea-gold/10' 
              : 'border-gray-300 hover:border-ea-gold hover:bg-ea-light'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-ea-gold animate-spin mb-3" />
              <p className="text-ea-dark/70">Wird hochgeladen & optimiert...</p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-ea-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-7 h-7 text-ea-gold" />
              </div>
              <p className="text-ea-dark font-medium mb-1">
                {isDragging ? 'Hier ablegen' : 'Bild hochladen'}
              </p>
              <p className="text-ea-dark/50 text-sm">
                Drag & Drop oder klicken • JPG, PNG, WebP • Max 10MB
              </p>
              <p className="text-ea-gold text-xs mt-2">
                Bilder werden automatisch optimiert (WebP)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL Input as Alternative */}
      {!uploadedImage && (
        <div className="relative">
          <input
            type="url"
            placeholder="Oder Bild-URL eingeben..."
            onBlur={(e) => {
              if (e.target.value) {
                setUploadedImage(e.target.value);
                if (onImageUploaded) {
                  onImageUploaded(e.target.value);
                }
              }
            }}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
          />
        </div>
      )}
    </div>
  );
};

// Multi-Image Gallery Uploader
export const ImageGalleryUploader = ({ 
  images = [], 
  onImagesChange, 
  credentials,
  maxImages = 10 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (file) => {
    if (!file || images.length >= maxImages) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const data = await response.json();
      onImagesChange([...images, data.url]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img 
              src={url} 
              alt={`Galerie ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-gray-200"
              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Fehler'}
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-ea-gold hover:bg-ea-light transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-ea-gold animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-ea-dark/40 mb-1" />
                <span className="text-xs text-ea-dark/40">Hinzufügen</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        className="hidden"
      />
      
      <p className="text-xs text-ea-dark/50">
        {images.length} von {maxImages} Bildern • Bilder werden automatisch optimiert
      </p>
    </div>
  );
};

export default ImageUploader;
