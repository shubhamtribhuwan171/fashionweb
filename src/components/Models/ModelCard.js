import React from 'react';
import {
  Box,
  Image,
  Text,
  IconButton,
  AspectRatio,
  useColorModeValue,
  Tag,
  useDisclosure,
  Modal
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import ImagePreviewModal from '../Shared/ImagePreviewModal';

export default function ModelCard({ model, onDelete }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        bg={cardBg} 
        position="relative" 
        onClick={onOpen}
        cursor="pointer"
        _hover={{ shadow: 'md' }}
        transition="shadow 0.2s"
      >
        <AspectRatio ratio={1}>
          <Box>
            <Image 
              src={model.storage_url} 
              alt={model.name || 'Model Image'} 
              objectFit="cover" 
              fallbackSrc='https://via.placeholder.com/150?text=Model' 
            />
          </Box>
        </AspectRatio>
        <Box p={3}>
          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{model.name || 'Untitled Model'}</Text>
          {/* Optional: Could add a tag or other info here if needed in future */}
        </Box>
        <IconButton
          icon={<FaTrash />}
          aria-label="Delete model"
          colorScheme="red"
          variant="ghost"
          size="sm"
          position="absolute"
          top={2}
          right={2}
          onClick={(e) => { 
            e.stopPropagation();
            onDelete(model.id);
          }}
        />
      </Box>

      <ImagePreviewModal 
        isOpen={isOpen} 
        onClose={onClose} 
        imageUrl={model.storage_url} 
        altText={model.name || 'Model Image Preview'}
      />
    </>
  );
} 