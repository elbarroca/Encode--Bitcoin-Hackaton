'use client';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { NETWORKS } from '../config/cereNetwork';
import { AccountInfo } from '@polkadot/types/interfaces';
import type { AccountData } from '@polkadot/types/interfaces/balances';
import { 
    addLocalExtension, 
    getLocalActiveAccount, 
    setLocalActiveAccount, 
    removeLocalActiveAccount, 
    removeLocalExtension 
} from '../localStorage';
import { Web3Signer } from '@cere-ddc-sdk/blockchain';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

export interface ImportedAccount {
  address: string;
  name?: string;
  source: string;
  signer?: any;
}

export interface WalletContextInterface {
  activeAccount: string | null;
  connectWallet: () => Promise<void>;
  account: {
    address: string;
  } | null;
  signMessage: (message: string) => Promise<string>;
}

const defaultContext: WalletContextInterface = {
  activeAccount: null,
  connectWallet: async () => {},
  account: null,
  signMessage: async () => '',
};

const WalletContext = createContext<WalletContextInterface>(defaultContext);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<ImportedAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<InjectedExtension[]>([]);
  const [web3Signer, setWeb3Signer] = useState<Web3Signer | null>(null); // State for Web3Signer

  const accountsRef = useRef(accounts);
  const activeAccountRef = useRef(activeAccount);

  const initializeApi = async (networkKey: string) => {
    const network = NETWORKS[networkKey];
    if (!network) throw new Error('Network not supported');

    try {
      const provider = new WsProvider(network.endpoints.rpc);
      const api = await ApiPromise.create({ provider });
      await api.isReady;
      
      setApi(api);
      setActiveNetwork(networkKey);
      return api;
    } catch (error) {
      console.error('Failed to connect to network:', error);
      throw error;
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      const injectedExtensions = await web3Enable('PolkaDrive');
      if (!injectedExtensions.length) {
        throw new Error('No extension found');
      }
      
      injectedExtensions.forEach(ext => addLocalExtension(ext.name));
      setExtensions(injectedExtensions);
  
      const allAccounts = await web3Accounts();
      const formattedAccounts: ImportedAccount[] = allAccounts.map(account => ({
        address: account.address,
        name: account.meta.name || undefined,
        source: account.meta.source || 'unknown',
        signer: account.meta.source
      }));
  
      setAccounts(formattedAccounts);
      accountsRef.current = formattedAccounts;
  
      const network = 'cereMainnet';
      const accountToUse = formattedAccounts[0]?.address;
  
      if (accountToUse) {
        setActiveAccount(accountToUse);
        activeAccountRef.current = accountToUse;
        setLocalActiveAccount(network, accountToUse);
        const activeExtension = injectedExtensions.find(ext => ext.signer && ext.signer.signRaw);
        if (activeExtension) {
          const signerInstance = new Web3Signer();
          await signerInstance.connect();
          setWeb3Signer(signerInstance); 
        }
      }
  
      if (!api) {
        await initializeApi('cereMainnet');
      }
  
      return {
        address: accountToUse || '',
        network: network
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [api, activeAccount]);
  
const convertAddress = (address: string, expectedFormat: number) => {
  try {
    const decoded = decodeAddress(address, true, 54);
    const ss58Format = decoded[0]; // Get the SS58 format from the decoded address

    if (ss58Format !== expectedFormat) {
      // Convert to the expected format
      return encodeAddress(decoded, expectedFormat);
    }

    return address; // Return the original address if it matches
  } catch (error) {
    console.error('Invalid address:', error);
    throw new Error('Invalid address format');
  }
};

  const disconnectWallet = useCallback(async () => {
    if (api) {
      await api.disconnect();
      setApi(null);
    }
    
    if (activeNetwork && activeAccount) {
      removeLocalActiveAccount(activeNetwork);
    }
    
    extensions.forEach(ext => removeLocalExtension(ext.name));
    
    setActiveAccount(null);
    setAccounts([]);
    setExtensions([]);
    setWeb3Signer(null); // Reset the Web3Signer on disconnect
  }, [api, activeNetwork, activeAccount, extensions]);

  const switchNetwork = useCallback(async (networkKey: string) => {
    if (api) {
      await api.disconnect();
    }
    await initializeApi(networkKey);
  }, [api]);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!api) throw new Error('API not initialized');
    
    try {
        const result = await api.query.system.account<AccountInfo>(address);
        const accountInfo = result as unknown as { data: AccountData };
        return accountInfo.data.free.toString();
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }, [api]);

  const signMessage = useCallback(async (message: string) => {
    if (!activeAccount || !web3Signer) {
      throw new Error('No active account or Web3Signer available');
    }

    const signature = await web3Signer.sign(message); // Use the Web3Signer instance

    return signature.toString();
  }, [activeAccount, web3Signer]);

  return (
    <WalletContext.Provider
      value={{
        activeAccount,
        connectWallet,
        account: {
          address: activeAccount || '',
        },
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};