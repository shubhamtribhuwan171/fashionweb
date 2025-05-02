import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  AspectRatio,
  Text,
  Center,
  Box
} from '@chakra-ui/react';

export default function ImagePreviewModal({ isOpen, onClose, imageUrl, altText }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl"> {/* Adjust size as needed */} 
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{altText || 'Image Preview'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}> {/* Add padding bottom */} 
          {imageUrl ? (
            <AspectRatio ratio={1} maxW="500px" mx="auto">
              <Box>
                <Image 
                  src={imageUrl} 
                  alt={altText || 'Preview'} 
                  objectFit="contain" 
                  fallbackSrc='https://via.placeholder.com/500?text=Preview'
                />
              </Box>
            </AspectRatio>
          ) : (
            <Center h="300px">
              <Text>Image not available.</Text>
            </Center>
          )}
        </ModalBody>
        {/* No Footer needed, just viewing */}
      </ModalContent>
    </Modal>
  );
} 