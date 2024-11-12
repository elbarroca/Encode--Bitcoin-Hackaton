export interface WalletState {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  setWalletDisconnected: () => void;
} 