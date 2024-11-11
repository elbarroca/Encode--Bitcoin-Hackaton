'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, X, Check, AlertCircle } from 'lucide-react';
import { MultiSignConfig } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MultiSignConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MultiSignConfig) => void;
  initialConfig?: MultiSignConfig;
}

export const MultiSignConfigModal: React.FC<MultiSignConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [configName, setConfigName] = React.useState(initialConfig?.name || '');
  const [addresses, setAddresses] = React.useState<string[]>(initialConfig?.addresses || []);
  const [newAddress, setNewAddress] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [threshold, setThreshold] = React.useState(initialConfig?.threshold || 1);
  const [pendingRemoval, setPendingRemoval] = React.useState<{
    address: string;
    signatures: string[];
  } | null>(null);

  React.useEffect(() => {
    // Ensure threshold is valid when addresses change
    if (threshold > addresses.length) {
      setThreshold(Math.max(1, addresses.length));
    }
  }, [addresses.length]);

  const handleAddAddress = () => {
    if (!newAddress) {
      setError('Please enter an address');
      return;
    }

    if (newAddress.length < 8) {
      setError('Address must be at least 8 characters');
      return;
    }

    if (addresses.includes(newAddress)) {
      setError('Address already added');
      return;
    }

    setAddresses([...addresses, newAddress]);
    setNewAddress('');
    setError(null);
  };

  const handleRemoveAddress = async (addressToRemove: string) => {
    if (initialConfig) {
      // If editing an existing config, require multi-sig process
    setPendingRemoval({
      address: addressToRemove,
      signatures: []
    });

    try {
      const requiredSignatures = Math.ceil(addresses.length / 2);
      const currentSignatures = pendingRemoval?.signatures.length || 0;

      if (currentSignatures >= requiredSignatures) {
        setAddresses(addresses.filter(a => a !== addressToRemove));
        setPendingRemoval(null);
        
        if (threshold > addresses.length - 1) {
          setThreshold(addresses.length - 1);
        }
      } else {
        alert(`Removal requires ${requiredSignatures} signatures. Currently have ${currentSignatures}`);
      }
    } catch (error) {
      console.error('Failed to remove address:', error);
      setError('Failed to remove address. Please try again.');
      }
    } else {
      // If creating a new config, allow direct removal
      setAddresses(addresses.filter(a => a !== addressToRemove));
      if (threshold > addresses.length - 1) {
        setThreshold(Math.max(1, addresses.length - 1));
      }
    }
  };

  const handleSave = () => {
    if (!configName) {
      setError('Please enter a configuration name');
      return;
    }

    onSave({
      id: initialConfig?.id || crypto.randomUUID(),
      name: configName,
      addresses,
      threshold,
      createdAt: initialConfig?.createdAt || new Date().toISOString()
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white border border-gray-200 shadow-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Shield className="h-5 w-5 text-orange-500" />
            </div>
            {initialConfig ? 'Edit Multi-Sign Config' : 'New Multi-Sign Config'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 py-2 px-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Configuration Name</label>
              <Input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., Team Approval"
              className="h-9 bg-white border-gray-200 text-gray-900 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Add Signer Address</label>
              <div className="flex space-x-2">
                <Input
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAddress();
                    }
                  }}
                  placeholder="Enter address..."
                className="h-9 bg-white border-gray-200 text-gray-900 focus:border-orange-500"
                />
                <Button
                  onClick={handleAddAddress}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 h-9"
                >
                  Add
                </Button>
              </div>
            </div>

            {addresses.length >= 2 && (
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Required Signatures</label>
              <div className="flex flex-wrap gap-1.5">
                  {[...Array(addresses.length)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setThreshold(i + 1)}
                      className={`py-1.5 px-3 rounded text-center text-sm transition-all ${
                        threshold === i + 1
                        ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-orange-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  {threshold} of {addresses.length} signatures required
                </p>
              </div>
            )}

            {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded">
              <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            {addresses.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Added Signers</label>
                  <span className="text-xs text-gray-500">
                    {addresses.length} total
                  </span>
                </div>
                <ScrollArea className="h-[180px] w-full rounded-md border border-gray-100">
                  <div className="p-2 space-y-1.5">
                  {addresses.map((address, index) => (
                    <div
                      key={address}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100 hover:border-orange-200 transition-all group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="h-5 w-5 flex-shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-xs text-gray-600 truncate">{address}</span>
                      </div>
                        {!initialConfig && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAddress(address)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                        )}
                    </div>
                  ))}
                </div>
                </ScrollArea>
              </div>
            )}

            {initialConfig && pendingRemoval && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Pending Removal: {pendingRemoval.address.slice(0, 6)}...
                  </span>
                  <span className="text-xs text-orange-600">
                    {pendingRemoval.signatures.length} of {Math.ceil(addresses.length / 2)} signatures
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPendingRemoval(null)}
                    className="text-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Simulate adding a signature
                      setPendingRemoval(prev => prev ? {
                        ...prev,
                        signatures: [...prev.signatures, 'new-signature']
                      } : null);
                    }}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Sign Removal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!configName || addresses.length < 1}
            className="h-9 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 