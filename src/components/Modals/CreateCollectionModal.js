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
  Flex,
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
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Create New Collection
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Collection Name</FormLabel>
              <Input 
                placeholder="e.g., Spring Lookbook 2025" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="md"
              />
            </FormControl>
            {/* Keep description input for potential future use, though API doesn't directly support it */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Description (Optional)</FormLabel>
              <Textarea 
                placeholder="A brief description of this collection..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                borderRadius="md"
                size="sm"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter 
          borderTopWidth="1px"
          borderColor="gray.100"
          px={6} py={4}
        >
          <Flex justify="flex-end" width="full">
            <Button variant='ghost' mr={3} onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleCreate}
              isLoading={isLoading}
              bgGradient="linear(to-r, teal.400, purple.500, blue.500)"
              color="white"
              fontWeight="semibold"
              _hover={{
                bgGradient: "linear(to-r, teal.500, purple.600, blue.600)",
                boxShadow: "lg",
                transform: "translateY(-3px) scale(1.03)",
              }}
              _active={{
                bgGradient: "linear(to-r, teal.600, purple.700, blue.700)",
                transform: "translateY(-1px) scale(1.00)"
              }}
              boxShadow="md"
              transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
              borderRadius="md"
            >
              Create
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 