'use client';

import { useState } from 'react';
import { FileText, Download, Image as ImageIcon, X, Shield, Check, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileCardProps {
  id: string;
  title: string;
  size: string;
  uploadedBy?: string;
  description?: string;
  onDelete: (id: string) => void;
  status?: {
    type: 'multisig';
    signed: number;
    required: number;
    total: number;
  };
  children?: React.ReactNode;
  uploadedAt?: string;
}

export const FileCard: React.FC<FileCardProps> = ({
  id,
  title,
  size,
  uploadedBy,
  description,
  onDelete,
  status,
  children,
  uploadedAt = new Date().toISOString(),
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const isImage = title.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  const dummyImageUrl = "https://picsum.photos/800/600"; // For demo purposes

  return (
    <>
      <div
        className="group relative rounded-lg border border-gray-200 bg-white p-4 hover:border-orange-200 hover:shadow-lg transition-all duration-200 cursor-pointer animate-slideUp"
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="relative z-10">
          {children}
          
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors duration-200">
              {isImage ? (
                <ImageIcon className="h-8 w-8 text-orange-500 rounded-xl" />
              ) : (
                <FileText className="h-8 w-8 text-orange-500 rounded-xl" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-500 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-gray-500 truncate mt-1">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-gray-600">
                  {uploadedBy ? `${uploadedBy.slice(0, 6)}...${uploadedBy.slice(-4)}` : 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(uploadedAt))} ago</span>
              </div>
            </div>
            {size && (
              <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                {size}
              </span>
            )}
          </div>

          {status && status.type === 'multisig' && (
            <div className="mt-3 flex items-center justify-between text-sm border-t pt-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-gray-600">
                  {status.signed} of {status.required} signatures
                </span>
              </div>
              <span className="text-gray-400">
                {status.signed}/{status.total} signed
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-50">
          <div className="h-full bg-orange-500 transition-all duration-500 w-full transform origin-left scale-x-0 group-hover:scale-x-100" />
        </div>
      </div>

      {/* File Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 bg-white overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="sr-only">
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          
          <div className="relative h-48 bg-gradient-to-r from-orange-500 to-orange-600 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/90 hover:bg-black text-white z-10 rounded-full shadow-lg backdrop-blur-sm"
              onClick={() => setIsDetailsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="absolute inset-0 flex items-center justify-center">
              {isImage ? (
                <div 
                  className="w-32 h-32 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPreviewOpen(true);
                  }}
                >
                  <img 
                    src={dummyImageUrl} 
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-8 left-6 p-2 bg-white rounded-xl shadow-lg">
              {isImage ? (
                <ImageIcon className="h-12 w-12 text-orange-500" />
              ) : (
                <FileText className="h-12 w-12 text-orange-500" />
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 pt-12 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>Uploaded {formatDistanceToNow(new Date(uploadedAt))} ago</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500">Size</p>
                  <p className="text-sm text-gray-900 mt-1">{size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Uploaded By</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {uploadedBy ? `${uploadedBy.slice(0, 6)}...${uploadedBy.slice(-4)}` : 'Anonymous'}
                  </p>
                </div>
              </div>

              {status && status.type === 'multisig' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Signature Status</h4>
                    <span className="text-sm text-orange-600 font-medium">
                      {status.signed}/{status.total} signed
                    </span>
                  </div>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-1.5">
                      {[...Array(status.total)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-colors ${
                              i < status.signed 
                                ? 'bg-green-500 ring-2 ring-green-200' 
                                : 'bg-gray-200'
                            }`}>
                              <Check className={`h-3 w-3 ${
                                i < status.signed ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>
                            <span className="text-sm text-gray-600 font-medium">Signer {i + 1}</span>
                          </div>
                          <span className={`text-xs ${
                            i < status.signed ? 'text-green-500' : 'text-gray-400'
                          }`}>
                            {i < status.signed ? '2 hours ago' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 p-4 border-t bg-white">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-gray-200"
            >
              Close
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog - Remove the close button since we're using the Dialog's built-in one */}
      {isImage && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            
            <div className="relative w-full h-full">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/90 hover:bg-black text-white z-10 rounded-full shadow-lg backdrop-blur-sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <ScrollArea className="h-[85vh] w-full">
                <div className="relative min-h-full w-full flex items-center justify-center p-4">
              <img 
                src={dummyImageUrl} 
                alt={title}
                    className="max-w-full h-auto object-contain rounded-lg shadow-2xl"
                    style={{
                      minHeight: '50vh', // Ensure minimum height for small images
                      maxHeight: '85vh'  // Prevent image from being too large
                    }}
                  />
                </div>

                {/* Optional: Add image details below */}
                <div className="bg-black/80 text-white p-4 absolute bottom-0 left-0 right-0 backdrop-blur-sm">
                  <h3 className="text-lg font-medium">{title}</h3>
                  <p className="text-sm text-gray-300">{description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    <span>{size}</span>
                    <span>•</span>
                    <span>Uploaded by {uploadedBy}</span>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};