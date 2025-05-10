import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  VStack,
  AspectRatio,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';

export default function InputPreviewModal({ isOpen, onClose, inputDetails }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const placeholderBg = useColorModeValue('gray.100', 'gray.700');

  if (!inputDetails) {
    return null; // Don't render if no details are provided
  }

  const { label, name, imageUrl } = inputDetails;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered motionPreset="slideInBottom">
      <ModalOverlay bg="blackAlpha.700" /> 
      <ModalContent borderRadius="lg" overflow="hidden" bg={cardBg}>
        <ModalHeader 
          bg={headerBg} 
          fontSize="lg" 
          fontWeight="semibold" 
          px={6} 
          py={4}
          borderBottomWidth="1px"
        >
          {label || 'Input Preview'}
        </ModalHeader>
        <ModalCloseButton top={3} right={4} />
        <ModalBody py={6} px={6}>
          <VStack spacing={4} align="center">
            {imageUrl ? (
               <Image 
                 src={imageUrl}
                 alt={name || label || 'Input Image'}
                 objectFit="contain"
                 borderRadius="md"
                 width="100%"
                 maxW="400px"
                 maxH="80vh"
               />
            ) : (
              <Center h="200px" w="100%" bg={placeholderBg} borderRadius="md">
                <Text color="gray.500">No Image Available</Text>
              </Center>
            )}
            <Text fontSize="xl" fontWeight="medium" textAlign="center">{name || 'Unnamed Input'}</Text>
          </VStack>
        </ModalBody>
        {/* Optional Footer - removed for cleaner look */}
        {/* <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
} 