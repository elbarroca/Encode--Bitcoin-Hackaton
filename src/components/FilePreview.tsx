'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

interface FilePreviewProps {
  fileId: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileId }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">File Preview</h4>
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.WkHWiqa8PtzvtrPGixIwLAHaEo%26pid%3DApi&f=1&ipt=dc6dea07ae69f614ee2a3f9b9425a1198fcf28c677fa9ecc1617673523f97511&ipo=images")`,
              backgroundSize: '30px 30px',
            }} />
          </div>
          
          <div className="text-center z-10">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Preview not available</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">File ID: {fileId}</p>
      </div>
    </div>
  );
}; 