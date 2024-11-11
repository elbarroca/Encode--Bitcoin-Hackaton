import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWallet } from './WalletProvider';

// Types for our multi-signature implementation
interface MultiSignConfig {
  threshold: number;
  participants: string[]; // Array of participant public keys
  multisigAddress: string;
  multisigBitcoinAddress: string;
}

interface Transaction {
  id: string;
  sender: string;
  content: string;
  signatures: string[];
  status: 'pending' | 'executed' | 'failed';
  threshold: number;
  createdAt: number;
}

interface MultiSignContextType {
  createMultiSignConfig: (threshold: number, publicKeys: string[]) => Promise<MultiSignConfig>;
  signTransaction: (transactionId: string) => Promise<boolean>;
  submitTransaction: (transactionId: string) => Promise<boolean>;
  getPendingTransactions: () => Transaction[];
  currentConfig: MultiSignConfig | null;
  transactions: Transaction[];
}

const MultiSignContext = createContext<MultiSignContextType | undefined>(undefined);

export function MultiSignProvider({ children }: { children: ReactNode }) {
  const { account, signMessage } = useWallet();
  const [currentConfig, setCurrentConfig] = useState<MultiSignConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Create a new multi-signature configuration
  const createMultiSignConfig = useCallback(async (
    threshold: number, 
    publicKeys: string[]
  ): Promise<MultiSignConfig> => {
    try {
      // Following Rooch's implementation pattern
      const response = await fetch('/api/rooch/create-multisign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threshold,
          publicKeys,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create multi-signature configuration');
      }

      const config = await response.json();
      setCurrentConfig(config);
      return config;
    } catch (error) {
      console.error('Error creating multi-signature config:', error);
      throw error;
    }
  }, []);

  // Sign a pending transaction
  const signTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      if (!account || !currentConfig) {
        throw new Error('Wallet not connected or no multi-signature config');
      }

      // Following Rooch's signing pattern
      const response = await fetch('/api/rooch/sign-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          signer: account.address,
          config: currentConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign transaction');
      }

      // Update local transaction state
      setTransactions(prev => prev.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            signatures: [...tx.signatures, account.address],
          };
        }
        return tx;
      }));

      return true;
    } catch (error) {
      console.error('Error signing transaction:', error);
      return false;
    }
  }, [account, currentConfig, signMessage]);

  // Submit a fully signed transaction
  const submitTransaction = useCallback(async (transactionId: string): Promise<boolean> => {
    try {
      const transaction = transactions.find(tx => tx.id === transactionId);
      
      if (!transaction || !currentConfig) {
        throw new Error('Transaction not found or no config');
      }

      if (transaction.signatures.length < currentConfig.threshold) {
        throw new Error('Not enough signatures');
      }

      // Following Rooch's submission pattern
      const response = await fetch('/api/rooch/submit-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          config: currentConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transaction');
      }

      // Update local transaction state
      setTransactions(prev => prev.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'executed',
          };
        }
        return tx;
      }));

      return true;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      return false;
    }
  }, [transactions, currentConfig]);

  // Get pending transactions
  const getPendingTransactions = useCallback((): Transaction[] => {
    return transactions.filter(tx => tx.status === 'pending');
  }, [transactions]);

  const value = {
    createMultiSignConfig,
    signTransaction,
    submitTransaction,
    getPendingTransactions,
    currentConfig,
    transactions,
  };

  return (
    <MultiSignContext.Provider value={value}>
      {children}
    </MultiSignContext.Provider>
  );
}

// Custom hook to use the multi-signature context
export function useMultiSign() {
  const context = useContext(MultiSignContext);
  if (context === undefined) {
    throw new Error('useMultiSign must be used within a MultiSignProvider');
  }
  return context;
}