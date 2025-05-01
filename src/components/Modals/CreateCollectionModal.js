import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';

export default function CreateCollectionModal({ isOpen, onClose, onCreateCollection }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState(''); // Description isn't directly supported by the simplified API, but keep for future
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: 'Please enter a collection name.', status: 'warning', duration: 3000 });
      return;
    }
    
    setIsLoading(true);
    // Pass data back to the parent page to handle actual creation
    // The API expects { name: string, is_public?: boolean, initialAssetId?: string }
    // We only have `name` here for now.
    onCreateCollection({ name /*, description */ }) // Pass name back
        .then(() => {
            setIsLoading(false);
            handleClose(); // Close and reset on success
        })
        .catch((err) => {
            console.error("Failed to create collection (from modal perspective):", err);
            toast({ title: 'Failed to create collection', description: err?.message || 'Please try again.', status: 'error', duration: 3000 });
            setIsLoading(false); // Allow retry
        });
  };

  const handleClose = () => {
      // Reset form state on close
      setName('');
      setDescription('');
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Collection</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Collection Name</FormLabel>
              <Input 
                placeholder="e.g., Spring Lookbook 2025" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            {/* Keep description input for potential future use, though API doesn't directly support it */}
            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea 
                placeholder="A brief description of this collection..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleCreate} 
            isLoading={isLoading}
            loadingText="Creating..."
            isDisabled={isLoading || !name.trim()}
          >
            Create Collection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 