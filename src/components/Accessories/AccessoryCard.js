import React from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  AspectRatio,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import ImagePreviewModal from '../Shared/ImagePreviewModal';

export default function AccessoryCard({ accessory, onDelete }) {
  const cardBg = useColorModeValue('white', 'gray.700');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(accessory.id);
  };

  const handleCardClick = () => {
    onOpen();
  };

  return (
    <>
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        bg={cardBg} 
        position="relative" 
        onClick={handleCardClick}
        cursor="pointer"
        _hover={{ shadow: 'md' }}
        transition="shadow 0.2s"
      >
        <AspectRatio ratio={1}>
          <Image 
            src={accessory.storage_url} 
            alt={accessory.name || 'Accessory Image'} 
            objectFit="cover" 
          />
        </AspectRatio>
        <Box p={3}> 
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{accessory.name || 'Untitled Accessory'}</Text>
        </Box>
        
        <IconButton
          icon={<FaTrash />}
          aria-label="Delete accessory"
          colorScheme="red"
          variant="ghost"
          size="sm"
          position="absolute"
          top={2}
          right={2}
          onClick={handleDeleteClick}
        />
      </Box>

      <ImagePreviewModal 
        isOpen={isOpen} 
        onClose={onClose} 
        imageUrl={accessory.storage_url} 
        altText={accessory.name || 'Accessory Image Preview'}
      />
    </>
  );
} 