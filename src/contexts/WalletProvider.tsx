'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWallets, useConnectWallet, useCurrentAddress, useWalletStore, WalletAccount } from "@roochnetwork/rooch-sdk-kit";
import { WalletState } from '../types';

interface WalletContextType {
  activeAccount: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  shortAddress: (address: string, start?: number, end?: number) => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const wallets = useWallets();
  const currentAddress = useCurrentAddress();
  const { mutateAsync: connect } = useConnectWallet();
  const connectionStatus = useWalletStore((state: WalletState) => state.connectionStatus);
  const setWalletDisconnected = useWalletStore((state: WalletState) => state.setWalletDisconnected);

  const shortAddress = useCallback((address: string, start = 6, end = 4): string => {
    try {
      if (!address) return "";
      if (address.length <= start + end) return address;
      return `${address.substring(0, start)}...${address.substring(
        address.length - end,
        address.length
      )}`;
    } catch (error) {
      return "";
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (connectionStatus === 'connected') return;
    try {
      setIsConnecting(true);
      if (wallets && wallets.length > 0) {
        const selectedWallet = wallets[0];
        const accounts = await selectedWallet.getAccounts();
        if (accounts && accounts.length > 0) {
          await connect({ wallet: selectedWallet });
        } else {
          throw new Error('No accounts available');
        }
      } else {
        throw new Error('No wallets available');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [connect, wallets, connectionStatus]);

  const disconnectWallet = useCallback(() => {
    if (connectionStatus === 'connected') {
      setWalletDisconnected();
    }
  }, [setWalletDisconnected, connectionStatus]);

  const value = {
    activeAccount: currentAddress?.genRoochAddress().toStr() ?? null,
    isConnecting,
    connectWallet,
    disconnectWallet,
    shortAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}