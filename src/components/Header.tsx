'use client'

import { Folder, Search, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletProvider';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Header = ({ onSearch, searchQuery }: HeaderProps) => {
  const { connectWallet, disconnectWallet, activeAccount } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

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

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 opacity-30 blur group-hover:opacity-50 transition duration-200"></div>
            <Folder className="relative h-12 w-12 text-orange-500 group-hover:text-orange-400 transition-colors rounded-xl" />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600 bg-clip-text text-transparent">
            RoochDrive
          </h1>
        </div>
        
        <div className="flex-1 px-8">
          <div className="relative group max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            <Input 
              placeholder="Search files" 
              className="w-full pl-11 bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 focus:border-orange-500 hover:border-orange-300 transition-all"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
            />
          </div>
        </div>

        {activeAccount ? (
          <div className="flex items-center space-x-5">
            <span className="text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              {truncateAddress(activeAccount)}
            </span>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="text-sm border-gray-200 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all duration-200"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            onClick={handleConnect}
            disabled={isConnecting}
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-6 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
    </header>
  );
};