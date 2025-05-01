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
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Collection</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired mb={4}>
            <FormLabel>Collection Name</FormLabel>
            <Input 
              placeholder="Enter new collection name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="collection-public-switch" mb="0">
                Make Publicly Visible?
              </FormLabel>
              <Switch 
                id="collection-public-switch"
                isChecked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)} 
              />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave} 
            isLoading={isLoading}
            isDisabled={isLoading || !name.trim() || (name.trim() === collection?.name && isPublic === collection?.is_public)} 
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 