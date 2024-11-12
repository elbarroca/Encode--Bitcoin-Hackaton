'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { RoochClient } from '@roochnetwork/rooch-sdk';
import { 
    addLocalExtension, 
    getLocalActiveAccount, 
    setLocalActiveAccount, 
    removeLocalActiveAccount, 
    removeLocalExtension 
} from '../localStorage';
import { GetBalanceParams as RoochGetBalanceParams } from '@roochnetwork/rooch-sdk/dist/cjs/client/types/params';

// Rooch specific types
export interface RoochAddress {
  bech32: string;
  hex: string;
  bitcoinAddress?: string;
}

export interface ImportedAccount {
  address: RoochAddress;
  name?: string;
  source: string;
}

export interface GetBalanceParams extends RoochGetBalanceParams {
  address: string;
  coinType: string;
  owner: string;
}

export interface WalletContextInterface {
  connectWallet: () => Promise<{ address: RoochAddress; network: string }>;
  disconnectWallet: () => Promise<void>;
  getBalance: (address: string) => Promise<string>;
  switchNetwork: (network: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  roochClient: RoochClient | null;
  activeAccount: RoochAddress | null;
  accounts: ImportedAccount[];
}

const defaultContext: WalletContextInterface = {
  connectWallet: async () => ({ address: { bech32: '', hex: '' }, network: '' }),
  disconnectWallet: async () => {},
  getBalance: async () => '0',
  switchNetwork: async () => {},
  signMessage: async () => '',
  roochClient: null,
  activeAccount: null,
  accounts: [],
};

const WalletContext = createContext<WalletContextInterface>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roochClient, setRoochClient] = useState<RoochClient | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<RoochAddress | null>(null);

  const accountsRef = useRef(accounts);
  const activeAccountRef = useRef(activeAccount);

  const initializeClient = async () => {
    try {
      // Initialize with proper Network type
      const client = new RoochClient({
        url: 'https://dev-seed.rooch.network:443'
      });
      
      setRoochClient(client);
      return client;
    } catch (error) {
      console.error('Failed to connect to network:', error);
      throw error;
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      // Check if UniSat wallet is available
      if (typeof window.unisat === 'undefined') {
        throw new Error('UniSat wallet not found');
      }

      // Request wallet connection
      const connected = await window.unisat.requestAccounts();
      if (!connected || !connected.length) {
        throw new Error('No accounts found');
      }

      const bitcoinAddress = connected[0];
      const network = 'testnet';

      // Format account for Rooch with proper address conversion
      const formattedAccount: ImportedAccount = {
        address: {
          bech32: `rooch1${bitcoinAddress.slice(5)}`,
          hex: `0x${bitcoinAddress}`,
          bitcoinAddress: bitcoinAddress
        },
        name: 'UniSat Wallet',
        source: 'unisat'
      };

      setAccounts([formattedAccount]);
      accountsRef.current = [formattedAccount];
      
      if (formattedAccount.address) {
        setActiveAccount(formattedAccount.address);
        activeAccountRef.current = formattedAccount.address;
        setLocalActiveAccount(network, formattedAccount.address.hex);
      }

      if (!roochClient) {
        await initializeClient();
      }

      return {
        address: formattedAccount.address,
        network: network
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [roochClient]);

  const disconnectWallet = useCallback(async () => {
    if (roochClient) {
      // Cleanup Rooch client connection if needed
      setRoochClient(null);
    }
        
    setActiveAccount(null);
    setAccounts([]);
  }, [roochClient, activeAccount]);

  const switchNetwork = useCallback(async (networkKey: string) => {
    if (roochClient) {
      setRoochClient(null);
    }
    await initializeClient();
  }, [roochClient]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!roochClient) throw new Error('Client not initialized');
    
    try {
      const params: GetBalanceParams = {
        address,
        owner: address,
        coinType: '0x3::gas_coin::RGas'
      };
      const balance = await roochClient.getBalance(params);
      return balance.toString();
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }, [roochClient]);

  const signMessage = useCallback(async (message: string) => {
    if (!activeAccount) {
      throw new Error('No active account');
    }

    try {
      const signature = await window.unisat.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [activeAccount]);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        getBalance,
        switchNetwork,
        signMessage,
        roochClient,
        activeAccount,
        accounts,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Add type declaration for UniSat wallet
declare global {
  interface Window {
    unisat: {
      requestAccounts: () => Promise<string[]>;
      signMessage: (message: string) => Promise<string>;
    };
  }
}