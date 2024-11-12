'use client'

import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown } from 'lucide-react';
import { useCurrentAddress, useWalletStore } from "@roochnetwork/rooch-sdk-kit";
import { useWallet } from '@/contexts/WalletProvider';
import { WalletState } from '@/types/wallet';
import { shortAddress } from '@/utils';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const currentAddress = useCurrentAddress();
  const connectionStatus = useWalletStore((state: WalletState) => state.connectionStatus);
  const { connectWallet, disconnectWallet, activeAccount } = useWallet();

  const handleConnect = async () => {
    if (connectionStatus === "connected") {
      disconnectWallet();
      return;
    }
    
    try {
      await connectWallet();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to connect:', error.message);
      } else {
        console.error('Failed to connect:', error);
      }
    }
  };

  const displayAddress = activeAccount
    ? shortAddress(activeAccount.bitcoinAddress, 8, 6)
    : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Secure Storage
          </h1>
          <span className="px-3 py-1 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
            Rooch Testnet
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {activeAccount ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleConnect}
                className="text-gray-700 border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{displayAddress}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}