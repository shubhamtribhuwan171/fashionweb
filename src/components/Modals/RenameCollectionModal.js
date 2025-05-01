import React, { useState, useEffect } from 'react';
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
  useToast,
  Switch,
  HStack,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react';

export default function RenameCollectionModal({ isOpen, onClose, collection, onRenameCollection }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setIsPublic(collection.is_public || false);
    } else {
      setName('');
      setIsPublic(false);
    }
  }, [collection, isOpen]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({ title: 'Please enter a valid name.', status: 'warning', duration: 3000 });
      return;
    }
    
    if (trimmedName === collection?.name && isPublic === collection?.is_public) {
        handleClose();
        return;
    }
    
    setIsLoading(true);
    console.log(`Renaming collection ${collection?.id} to: ${trimmedName}, public: ${isPublic}`);
    
    try {
        await onRenameCollection(collection.id, { name: trimmedName, is_public: isPublic });
        toast({ title: "Collection updated!", status: "success", duration: 2000 });
        handleClose();
    } catch (error) {
        console.error("Failed to rename collection (from modal perspective):", error);
        toast({ title: "Failed to update collection", status: "error", duration: 3000 });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
      if (collection) {
         setName(collection.name || ''); 
         setIsPublic(collection.is_public || false);
      }
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
          Edit Collection
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Collection Name</FormLabel>
              <Input 
                placeholder="Enter new collection name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="md"
              />
            </FormControl>
            <FormControl display="flex" alignItems="center" pt={2}>
                <FormLabel htmlFor="collection-public-switch" mb="0" mr={4} fontSize="sm" fontWeight="medium">
                  Make Publicly Visible?
                </FormLabel>
                <Switch 
                  id="collection-public-switch"
                  isChecked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)} 
                  colorScheme="blue"
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
            <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSave} 
              isLoading={isLoading}
              isDisabled={isLoading || !name.trim() || (name.trim() === collection?.name && isPublic === collection?.is_public)} 
              loadingText="Saving..."
              borderRadius="md"
            >
              Save Changes
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 