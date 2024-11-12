import { WalletAccount } from "@roochnetwork/rooch-sdk-kit";

export interface WalletState {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setWalletDisconnected: () => void;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
  authorizedUsers: string[];
  cid: string;
  mimeType: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  description?: string;
  starred?: boolean;
  folderId: string | null;
  imageUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
}

export interface MultiSignConfig {
  id: string;
  name: string;
  addresses: string[];
  threshold: number;
  files?: FileMetadata[];
} 