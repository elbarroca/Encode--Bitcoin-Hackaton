import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { MultiSignConfig } from '../../types';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  configName: z.string().min(1, { message: 'Configuration name is required.' }),
  newAddress: z.string().min(8, { message: 'Address must be at least 8 characters.' }),
});

interface MultiSignConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MultiSignConfig) => void;
  initialConfig: MultiSignConfig | null;
}

export const MultiSignConfigModal: React.FC<MultiSignConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [addresses, setAddresses] = useState<string[]>(initialConfig?.addresses || []);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      configName: initialConfig?.name || '',
      newAddress: '',
    },
  });

  const handleAddAddress = (address: string) => {
    if (addresses.includes(address)) {
      setError('Address already added');
      return;
    }

    setAddresses([...addresses, address]);
    form.setValue('newAddress', ''); // Clear the input field
    setError(null);
  };

  const handleSave = async (data: z.infer<typeof formSchema>) => {
    const { configName } = data;
    const threshold = Math.min(addresses.length, 3); // Set threshold based on addresses

    try {
        // Call your API to create the multi-signature account
        /*const response = await fetch('/api/createMultisig', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                threshold,
                publicKeys: addresses,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create multi-signature account');
        }*/

        // If the API call is successful, save the configuration
        onSave({
            id: initialConfig?.id || crypto.randomUUID(),
            name: configName,
            addresses,
            threshold,
            createdAt: initialConfig?.createdAt || new Date().toISOString(),
        });

        // Close the modal
        onClose();
    } catch (error) {
        console.error('Error creating multi-signature account:', error);
        setError('Failed to create multi-signature account. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg text-black">
      <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
            Create New Multi-Sign Config
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="configName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Team Approval" {...field} />
                  </FormControl>
                  <FormDescription>This is the name of your multi-signature configuration.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Signer Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address..." {...field} />
                  </FormControl>
                  <FormDescription>Enter the address of the signer you want to add.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onClose} className="border-gray-200 hover:bg-gray-50 text-gray-700">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleAddAddress(form.getValues('newAddress'))}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Address
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};