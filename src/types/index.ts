export interface MultiSignConfig {
  id: string;
  name: string;
  addresses: string[];
  threshold: number;
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  title: string;
  size: string;
  uploadedBy: string;
  description: string;
  folderId: string | null;
  starred: boolean;
  imageUrl: string; // Added as required by the type system
}

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
}

export interface FileMetadata {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  description: string;
  uploadedAt: string;
  authorizedUsers: string[];
  cid: string;
  mimeType: string;
} 