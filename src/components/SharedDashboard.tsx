'use client';

import { useState } from 'react';
import { FileCard } from './FileCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Share2, Search, ArrowLeft } from 'lucide-react';

interface SharedFile {
  id: string;
  title: string;
  size: string;
  sharedWith: string;
  sharedAt: string;
  description?: string;
  uploadedBy: string;
}

interface SharedDashboardProps {
  onBackToMyDrive: () => void;
}

export const SharedDashboard = ({ onBackToMyDrive }: SharedDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([
    {
      id: '1',
      title: 'Shared Document 1',
      size: '2.4 MB',
      sharedWith: '5CUiis...D8gr',
      sharedAt: '2024-02-20',
      description: 'Shared with external collaborator',
      uploadedBy: '5CUiis...D8gr'
    }
  ]);

  const handleDeleteFile = (id: string) => {
    setSharedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBackToMyDrive}
            className="text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to My Drive
          </Button>
          <h2 className="text-3xl font-bold text-gray-900">
            Shared Files
          </h2>
        </div>
        <div className="max-w-xs w-full">
          <Input
            placeholder="Search shared files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-gray-200 text-gray-700 focus:border-orange-500"
          />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {sharedFiles.map((file) => (
          <FileCard
            key={file.id}
            id={file.id}
            title={file.title}
            size={file.size}
            description={file.description}
            uploadedBy={file.uploadedBy}
            onDelete={handleDeleteFile}
          >
            <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-600 rounded-full">
              Shared
            </span>
          </FileCard>
        ))}
      </div>
    </div>
  );
}; 