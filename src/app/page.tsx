'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { UploadModal } from '../components/UploadModal';
import { useWallet } from '../contexts/WalletProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Folder as FolderIcon, 
  Users, 
  Wallet,
  Upload,
  Lock,
  Layout,
  FolderPlus,
  ArrowLeft,
  Shield,
  X
} from 'lucide-react';
import { Header } from '../components/Header';
import { FileCard } from '../components/FileCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import { SharedDashboard } from '../components/SharedDashboard';
import { FileMetadata, Folder, MultiSignConfig } from '@/types';
import { FileItem } from '@/types';
import { MultiSignConfigModal } from '@/components/MultiSignConfigModal';
import { MultiSignProvider } from '../contexts/multisig';

const DUMMY_FILES = [
  {
    title: "Project Documentation",
    size: "2.4 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "Complete project documentation including architecture diagrams and technical specifications."
  },
  {
    title: "Design Assets",
    size: "5.1 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "UI/UX design assets and brand guidelines for the platform."
  },
  {
    title: "Technical Whitepaper",
    size: "1.8 MB",
    uploadedBy: "5CUiis...D8gr",
    description: "Detailed technical whitepaper explaining the system architecture and protocols."
  }
];

function HomePage() {
  const { activeAccount, connectWallet } = useWallet();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showStarred, setShowStarred] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [dummyFiles, setDummyFiles] = useState<FileItem[]>(() => 
    DUMMY_FILES.map(file => ({
      ...file,
      id: uuidv4(),
      folderId: null as string | null,
      name: file.title,
      starred: false,
      imageUrl: '',
    }))
  );
  const [currentView, setCurrentView] = useState<'myDrive' | 'shared' | 'multiSign'>('myDrive');
  const [refetchFolders, setRefetchFolders] = useState<(() => Promise<void>) | null>(null);
  const [isMultiSignConfigModalOpen, setIsMultiSignConfigModalOpen] = useState(false);
  const [multiSignConfigs, setMultiSignConfigs] = useState<MultiSignConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<MultiSignConfig | null>(null);

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const handleCreateFolder = (folderName: string) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name: folderName,
      files: []
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setFiles(files.map(file => {
      if (file.id === id) {
        return {
          ...file,
          starred: !(file.starred ?? false)
        };
      }
      return file;
    }));
  };

  const updatedClasses = {
    folderIcon: "h-12 w-12 text-orange-500 transform transition-transform hover:scale-110 duration-200",
    fileIcon: "h-12 w-12 text-orange-400 transform transition-transform hover:scale-110 duration-200",
    fileCard: "flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-orange-50 transition-all duration-200 hover:shadow-lg hover:border-orange-200",
    uploadButton: "bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:shadow-lg",
  };

  const handleUploadComplete = async (metadata: FileMetadata) => {
    console.log('File uploaded:', metadata);
    setIsUploadModalOpen(false);
    
    if (refetchFolders) {
      try {
        await refetchFolders();
      } catch (error) {
        console.error('Failed to refresh folders:', error);
      }
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const AddFolderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [folderName, setFolderName] = useState('');
    const [error, setError] = useState('');

    const handleCreateFolder = () => {
      if (!folderName.trim()) {
        setError('Folder name is required');
        return;
      }

      if (folders.some(f => f.name.toLowerCase() === folderName.trim().toLowerCase())) {
        setError('A folder with this name already exists');
        return;
      }

      const newFolder: Folder = { 
        id: uuidv4(), 
        name: folderName.trim(),
        files: [] 
      };
      
      setFolders(prev => [...prev, newFolder]);
      setFolderName('');
      setError('');
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FolderPlus className="h-6 w-6 text-orange-500" />
              </div>
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Folder Name</label>
              <Input
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError('');
                }}
                placeholder="Enter folder name"
                className="bg-white border-gray-200 text-gray-900 focus:border-orange-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-200 hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!folderName.trim()}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const handleFileDelete = (fileId: string) => {
    setDummyFiles(prev => prev.filter(file => file.id !== fileId));
  };

  useEffect(() => {
    console.log('Folders updated:', folders);
  }, [folders]);

  const getCurrentFiles = () => {
    if (!selectedFolder) {
      return dummyFiles.filter(file => !file.folderId);
    }
    return dummyFiles.filter(file => file.folderId === selectedFolder);
  };

  // Add this function to handle moving files between folders
  const handleMoveFile = (fileId: string, targetFolderId: string | null) => {
    setDummyFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          folderId: targetFolderId
        };
      }
      return file;
    }));
  };

  const handleSaveConfig = (config: MultiSignConfig) => {
    if (selectedConfig) {
      // Update existing config
      setMultiSignConfigs(prev => 
        prev.map(c => c.id === config.id ? config : c)
      );
    } else {
      // Add new config
      setMultiSignConfigs(prev => [...prev, config]);
    }
    setSelectedConfig(null);
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      {activeAccount ? (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 border-r border-gray-200 bg-white">
            <ScrollArea className="h-full">
              <div className="space-y-6 py-8">
                <div className="px-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">
                    Menu
                  </h2>
                    <Button 
                      variant="ghost" 
                      className="text-gray-600 hover:text-orange-400"
                      onClick={() => setIsAddFolderModalOpen(true)}
                    >
                      <FolderPlus className="h-5 w-5" />
                      <span className="ml-2">New Folder</span>
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Button 
                      variant="secondary" 
                      className={`w-full justify-start ${
                        currentView === 'myDrive' 
                          ? 'bg-orange-50 text-orange-500' 
                          : 'bg-white text-gray-900'
                      } hover:bg-orange-100 py-8 text-xl`}
                      onClick={() => {
                        setCurrentView('myDrive');
                        setSelectedFolder(null);
                      }}
                    >
                      <FolderIcon className="mr-4 h-8 w-8 text-orange-400" />
                      My Drive
                    </Button>

                    {/* Folders List */}
                    <div className="space-y-2 pl-4">
                      {folders.map((folder) => (
                        <Button
                          key={folder.id}
                          variant="ghost"
                          className={`w-full justify-start py-2 ${
                            selectedFolder === folder.id 
                              ? 'bg-orange-50 text-orange-500' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
                          }`}
                          onClick={() => setSelectedFolder(folder.id)}
                        >
                          <FolderIcon className="mr-2 h-5 w-5" />
                          <span className="truncate">{folder.name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {folder.files.length} files
                          </span>
                        </Button>
                      ))}
                    </div>

                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${
                        currentView === 'shared' 
                          ? 'bg-orange-50 text-orange-500 font-medium' 
                          : 'text-gray-700 hover:text-orange-500'
                      } hover:bg-orange-50/80 py-6 text-lg transition-all duration-200`}
                      onClick={() => setCurrentView('shared')}
                    >
                      <Users className="mr-4 h-6 w-6 text-orange-500" />
                      Shared with me
                    </Button>

                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start ${
                        currentView === 'multiSign' 
                          ? 'bg-orange-50 text-orange-500 font-medium' 
                          : 'text-gray-700 hover:text-orange-500'
                      } hover:bg-orange-50/80 py-6 text-lg transition-all duration-200`}
                      onClick={() => setCurrentView('multiSign')}
                    >
                      <Shield className="mr-4 h-6 w-6 text-orange-500" />
                      Multi-Sign Configs
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
          <main className="flex-1 overflow-auto bg-white p-8">
            {currentView === 'myDrive' && (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedFolder 
                      ? folders.find(f => f.id === selectedFolder)?.name 
                      : "My Drive"}
                  </h2>
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload
                  </Button>
                </div>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
                  {getCurrentFiles().map((file) => (
                    <FileCard
                      key={file.id}
                      id={file.id}
                      title={file.title}
                      size={file.size}
                      uploadedBy={file.uploadedBy}
                      description={file.description}
                      onDelete={handleFileDelete}
                    />
                  ))}
                </div>
              </>
            )}
            
            {currentView === 'shared' && (
              <SharedDashboard onBackToMyDrive={() => setCurrentView('myDrive')} />
            )}

            {currentView === 'multiSign' && (
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-shrink-0 px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900">Multi-Sign Configurations</h2>
                    <Button 
                      onClick={() => {
                        setSelectedConfig(null);
                        setIsMultiSignConfigModalOpen(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      New Config
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {multiSignConfigs.map((config) => (
                      <div 
                        key={config.id}
                        className="bg-white rounded-lg border border-gray-200 hover:border-orange-200 transition-all duration-200 animate-slideUp overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                            <p className="text-sm text-gray-500">
                              {config.threshold} of {config.addresses.length} signatures required
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedConfig(config);
                                setIsMultiSignConfigModalOpen(true);
                              }}
                              className="text-gray-600 hover:text-orange-500"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this configuration?')) {
                                  setMultiSignConfigs(prev => prev.filter(c => c.id !== config.id));
                                }
                              }}
                              className="text-red-500 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Signers List */}
                        <div className="max-h-[150px] overflow-y-auto">
                          {config.addresses.map((address: string, index: number) => (
                            <div 
                              key={address}
                              className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-600">
                                  {index + 1}
                                </div>
                                <span className="text-sm text-gray-600 font-medium">
                                  {address.slice(0, 8)}...{address.slice(-6)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this configuration?')) {
                                    setMultiSignConfigs(prev => prev.filter(c => c.id !== config.id));
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Files Section */}
                        <div className="border-t border-gray-100">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Files</h4>
                            <div className="space-y-2">
                              {[1, 2].map((_, i) => (
                                <FileCard
                                  key={i}
                                  id={`${config.id}-file-${i}`}
                                  title={i === 0 ? "Project Proposal.pdf" : "Technical Specs.pdf"}
                                  description={`Requires ${config.threshold} of ${config.addresses.length} signatures`}
                                  size={i === 0 ? "2.4 MB" : "1.8 MB"}
                                  uploadedBy={config.addresses[0]}
                                  onDelete={() => {}}
                                  status={{
                                    type: 'multisig',
                                    signed: i + 1,
                                    required: config.threshold,
                                    total: config.addresses.length
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <h1 className="text-6xl font-extrabold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent leading-tight pb-4 drop-shadow-sm">
                Secure, Decentralized File Sharing
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Unlock the future of privacy with blockchain-based file storage and sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {[
                {
                  icon: <Wallet className="h-8 w-8 text-orange-500 rounded-xl" />,
                  title: "Blockchain Login",
                  description: "Connect your wallet for secure, password-free access"
                },
                {
                  icon: <Lock className="h-8 w-8 text-orange-500" />,
                  title: "Encrypted Storage",
                  description: "Auto-encryption with decentralized storage"
                },
                {
                  icon: <Users className="h-8 w-8 text-orange-500" />,
                  title: "Access Control",
                  description: "Choose who can view your files"
                },
                {
                  icon: <Layout className="h-8 w-8 text-orange-500" />,
                  title: "File Dashboard",
                  description: "Track and manage your files easily"
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative p-8 bg-white rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  <div className="relative space-y-4">
                    <div className="p-3 bg-orange-50 rounded-xl w-fit group-hover:bg-orange-100/80 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 space-y-8">
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-8 py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <Wallet className="mr-2 h-6 w-6" />
                {isConnecting ? "Connecting..." : "Connect Wallet to Start"}
              </Button>
              
            </div>

            <div className="mt-20 p-8 bg-orange-50 rounded-xl border border-orange-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8">
                Simple Upload Process
              </h3>
              <div className="flex items-center justify-center space-x-8">
                {[
                  { step: "1", text: "Select File" },
                  { step: "2", text: "Specify Viewers" },
                  { step: "3", text: "Upload & Encrypt" }
                ].map((step, i, arr) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                      <p className="mt-3 text-gray-700 font-medium">{step.text}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="h-px w-16 bg-orange-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        walletAddress={activeAccount ?? ''}
        folders={folders}
        onUploadComplete={handleUploadComplete}
        multiSignConfigs={multiSignConfigs}
      />
      <AddFolderModal 
        isOpen={isAddFolderModalOpen} 
        onClose={() => setIsAddFolderModalOpen(false)} 
      />

      <MultiSignConfigModal
        isOpen={isMultiSignConfigModalOpen}
        onClose={() => {
          setIsMultiSignConfigModalOpen(false);
          setSelectedConfig(null);
        }}
        onSave={handleSaveConfig}
        initialConfig={selectedConfig}
      />
    </div>
  );
}

// Wrap the HomePage component with providers
export default function Home() {
  return (
    <MultiSignProvider>
      <HomePage />
    </MultiSignProvider>
  );
}