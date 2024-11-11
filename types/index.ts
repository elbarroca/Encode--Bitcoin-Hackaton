export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  authorizedUsers: string[];
  cid: string;
  mimeType: string;
  description?: string;
  folderId?: string | null;
  multiSignConfig?: MultiSignConfig | null;
  imageUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  files: FileMetadata[];
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (fileMetadata: FileMetadata) => void;
  walletAddress: string;
  folders: Folder[];
  multiSignConfigs: MultiSignConfig[];
}

export interface FileUploadState {
  file: File | null;
  progress: {
    upload: number;
    server: number;
  };
  error: string | null;
  isLoading: boolean;
  fileName: string;
  description: string;
  selectedFolder: string;
}

export interface MultiSignConfig {
  id: string;
  name: string;
  addresses: string[];
  threshold: number;
  createdAt: string;
}

export interface FileCardProps {
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
}

export interface FileItem {
  id: string;
  title: string;
  size: string;
  uploadedBy: string;
  description: string;
  folderId: string | null;
  name: string;
  starred: boolean;
  imageUrl?: string;
}