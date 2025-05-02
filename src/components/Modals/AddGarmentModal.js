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
  VStack,
  useToast,
  Spacer,
  Flex,
  Image,
  Box,
} from '@chakra-ui/react';

export default function AddGarmentModal({ isOpen, onClose, onAddGarmentWithUpload }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !imageFile) {
      toast({ title: 'Please provide both a name and an image file.', status: 'warning', duration: 3000 });
      return;
    }

    setIsLoading(true);
    console.log('Attempting to add garment with upload:', { name, imageFile });
    
    try {
      await onAddGarmentWithUpload({ 
          name: name.trim(), 
          imageFile: imageFile, 
      });
      handleClose();
    } catch (error) {
      console.error("Error in add garment process (modal perspective):", error);
      toast({ title: 'Failed to Add Garment', description: error.message || 'An unexpected error occurred.', status: 'error', duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
      setName('');
      setImageFile(null);
      setPreviewUrl(null);
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
          py={4}
          px={6} 
        >
          Add New Apparel Item
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Apparel Name</FormLabel>
              <Input 
                placeholder="e.g., Black Cotton Hoodie" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                borderRadius="md"
                isDisabled={isLoading}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium">Reference Image</FormLabel>
              <Input 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                p={1.5}
                borderRadius="md"
                isDisabled={isLoading}
              />
            </FormControl>
            {previewUrl && (
              <Box mt={4} borderWidth="1px" borderRadius="md" p={2}>
                <Image src={previewUrl} alt="Image Preview" maxH="200px" borderRadius="sm" />
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter 
          borderTopWidth="1px"
          borderColor="gray.100"
          px={6}
          py={4}
        >
          <Flex justify="flex-end" width="full">
            <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              isLoading={isLoading}
              isDisabled={isLoading || !name.trim() || !imageFile}
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
              Add Apparel
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 