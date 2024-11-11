'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { UploadModalProps, FileMetadata, Folder, MultiSignConfig } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileManager } from '@/hooks/useFileManager';
import { Switch } from "@/components/ui/switch";
import { Shield } from 'lucide-react';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen, 
  onClose, 
  onUploadComplete,
  walletAddress,
  folders,
  multiSignConfigs
}: UploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const encryptionKey = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingToServer, setUploadingToServer] = useState(false);
  const uploadId = useRef<string>(uuidv4());
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [isMultiSign, setIsMultiSign] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('');

  const { uploadFile } = useFileManager();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    // Validate file size (e.g., max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 50MB limit');
      return;
    }

    setFile(selectedFile);
  }, []);

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
            
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (isMultiSign && !selectedConfigId) {
      setError('Please select a multi-signature configuration');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Upload file using FileManager
      const fileMetadata = await uploadFile(file);

      // Update metadata with additional info
      const updatedMetadata: FileMetadata = {
        ...fileMetadata,
        name: fileName || file.name,
        description: description,
        folderId: selectedFolder || null,
        multiSignConfig: isMultiSign ? multiSignConfigs.find(c => c.id === selectedConfigId) || null : null
      };
      
      if (onUploadComplete) {
        onUploadComplete(updatedMetadata);
      }
      
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Upload className="h-5 w-5 text-orange-500 rounded-xl" />
            </div>
            Upload File
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">File Name</label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              className="bg-white border-gray-200 text-gray-900 focus:border-orange-500 h-9"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter file description"
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-md px-3 py-2 focus:border-orange-500 outline-none min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Select Folder</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-md px-3 h-9 focus:border-orange-500 outline-none appearance-none"
            >
              <option value="">Root Directory</option>
              {folders?.map((folder: Folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                <label className="text-sm font-medium text-gray-600">
                  Enable Multi-Signature
                </label>
              </div>
              <Switch
                checked={isMultiSign}
                onCheckedChange={setIsMultiSign}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>

            {isMultiSign && (
              <div className="space-y-2 bg-orange-50 p-3 rounded-lg">
                <label className="text-sm font-medium text-gray-600">
                  Select Multi-Sign Configuration
                </label>
                <select
                  value={selectedConfigId}
                  onChange={(e) => setSelectedConfigId(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-md px-3 h-9 focus:border-orange-500 outline-none"
                >
                  <option value="">Select a configuration</option>
                  {multiSignConfigs.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} ({config.threshold} of {config.addresses.length} signatures)
                    </option>
                  ))}
                </select>
                {!selectedConfigId && isMultiSign && (
                  <p className="text-xs text-orange-600 mt-1">
                    Please select a multi-signature configuration
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-all duration-300 bg-gray-50 group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-gray-200 bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-300 h-24 rounded-lg group"
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-8 w-8 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                {file ? (
                  <div className="text-center">
                    <p className="text-orange-500 font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm">Choose a file or drag it here</p>
                    <p className="text-xs text-gray-500">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                  Uploading...
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}