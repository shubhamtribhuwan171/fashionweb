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
  VStack,
  useToast,
} from '@chakra-ui/react';

export default function AddGarmentModal({ isOpen, onClose, onAddGarment }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Changed from imageFile/previewUrl
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => { // Make async to potentially await onAddGarment
    if (!name.trim() || !imageUrl.trim()) {
      toast({ title: 'Please provide both a name and an image URL.', status: 'warning', duration: 3000 });
      return;
    }

    // Basic URL validation (optional but recommended)
    try {
        new URL(imageUrl);
    } catch (_) {
        toast({ title: 'Invalid Image URL', description: 'Please enter a valid URL.', status: 'warning', duration: 3000 });
        return;
    }
    
    setIsLoading(true);
    console.log('Adding new garment:', { name, reference_image_url: imageUrl });
    
    try {
        // Call the parent function to handle the actual adding (API or mock)
        await onAddGarment({ 
            name, 
            reference_image_url: imageUrl, 
        }); 
        // Success is handled by the parent (toast, close)
        handleClose(); // Close modal after successful add call returns
    } catch (error) { 
        // Error should be handled by the parent (toast)
        console.error("Error adding garment (from modal perspective):", error);
    } finally {
        setIsLoading(false); // Ensure loading state is turned off
    }
  };

  const handleClose = () => {
      setName('');
      setImageUrl(''); // Reset URL state
      setIsLoading(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Base Garment</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Garment Name</FormLabel>
              <Input 
                placeholder="e.g., Black Cotton Hoodie" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Reference Image URL</FormLabel>
              <Input 
                type="url" // Use URL type
                placeholder="https://example.com/image.jpg" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              {/* Remove image preview as we are using URL now */}
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave} 
            isLoading={isLoading}
            loadingText="Adding..."
            isDisabled={isLoading || !name.trim() || !imageUrl.trim()}
          >
            Add Garment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 