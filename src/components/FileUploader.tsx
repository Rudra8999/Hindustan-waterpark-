import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onUpload: (base64: string) => void;
  label?: string;
  className?: string;
}

export default function FileUploader({ onUpload, label = "Upload Image", className }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit for Base64 storage in Firestore
      alert('Image size should be less than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onUpload(base64String);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeImage = () => {
    setPreview(null);
    onUpload('');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 group">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={removeImage}
              className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            "relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer",
            isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
          )}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-600">Click or drag to upload</p>
            <p className="text-xs text-slate-400">PNG, JPG up to 1MB</p>
          </div>
          <input 
            id="file-upload"
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}
