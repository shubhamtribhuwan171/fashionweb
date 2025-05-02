import React, { useState, useEffect, useCallback } from 'react';
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
import axios from 'axios';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

export default function RenameCollectionModal({ isOpen, onClose, collection, onRenameSuccess }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setIsPublic(collection.is_public || false);
    } else {
      setName('');
      setIsPublic(false);
    }
    setError(null);
  }, [collection, isOpen]);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in again.", status: "error" });
        setError("Authentication token not found.");
        return null;
    }
    setError(null);
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

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
    setError(null);
    const config = getAuthConfig();
    if (!config || !collection?.id) {
        setError("Cannot update: Missing auth or collection ID.");
        setIsLoading(false);
        return;
    }

    console.log(`API: Updating collection ${collection.id} to: ${trimmedName}, public: ${isPublic}`);
    const payload = { name: trimmedName, is_public: isPublic };
    
    try {
        const response = await axios.put(`${API_BASE_URL}/api/collections/${collection.id}`, payload, config);
        
        toast({ title: "Collection updated!", status: "success", duration: 2000 });
        if (onRenameSuccess) {
            await onRenameSuccess(collection.id, response.data);
        }
        handleClose();

    } catch (err) {
        console.error("Failed to rename collection:", err);
        const errorMsg = err.response?.data?.message || "Failed to update collection";
        setError(errorMsg);
        toast({ title: "Update Failed", description: errorMsg, status: "error", duration: 3000 });
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
      setError(null);
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

            {error && (
                 <Text color="red.500" fontSize="sm" mt={2}>Error: {error}</Text>
            )}
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
              onClick={handleSave}
              isLoading={isLoading}
              isDisabled={isLoading || !name.trim() || (name.trim() === collection?.name && isPublic === collection?.is_public)}
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
              Save Changes
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 