import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../Button';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  error?: string;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5,
  label = 'Upload Image',
  error,
  preview = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setUploadError('Invalid file type');
      return;
    }

    setUploadError(null);
    setUploading(true);

    try {
      // For now, convert to base64 and store locally
      // TODO: Replace with actual upload to Cloudinary/ImgBB/MinIO
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setUploading(false);
      };
      reader.readAsDataURL(file);

      // Example: Upload to ImgBB (if you have API key)
      /*
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', 'YOUR_IMGBB_API_KEY');

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onChange(data.data.url);
      } else {
        throw new Error('Upload failed');
      }
      setUploading(false);
      */
    } catch (err) {
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-text-main block">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {value && preview ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg border-2 border-border-light overflow-hidden bg-background-light">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="border-2 border-dashed border-border-light rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-text-muted">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-text-muted" />
                <div>
                  <p className="text-sm font-medium text-text-main">
                    Click to upload
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Max size: {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {value && !preview && (
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-text-main truncate flex-1">Image uploaded</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {(uploadError || error) && (
          <p className="text-sm text-red-500">{uploadError || error}</p>
        )}
      </div>
    </div>
  );
};
