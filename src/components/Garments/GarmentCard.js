import React from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  Heading,
  Button,
  HStack,
  LinkBox,
  LinkOverlay,
  useColorModeValue,
  AspectRatio,
  IconButton,
  Spacer
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

export default function GarmentCard({ garment, onDelete }) {
  const navigate = useNavigate();
  // Use reference_image_url from the API/mock data structure
  const imageUrl = garment.reference_image_url || 'https://via.placeholder.com/200?text=No+Image';
  // Link to the detail page within the /app structure (detail page not yet created)
  const detailLink = `/app/products/${garment.id}`;
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleUseForStyle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to create style with garment:', garment.id);
    // Correct the navigation path and state key
    navigate('/app/create', { state: { selectedGarmentId: garment.id } });
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent LinkOverlay navigation
    if (onDelete) {
      onDelete(); // Call the passed onDelete handler
    }
  };

  return (
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" overflow="hidden" bg={cardBg} _hover={{ shadow: 'md' }} position="relative">
      <AspectRatio ratio={1}>
        <Box>
          <Image
            src={imageUrl}
            alt={garment.name || 'Garment Image'}
            objectFit="cover"
            objectPosition="top"
          />
        </Box>
      </AspectRatio>
      {onDelete && (
        <IconButton
          icon={<FaTrash />}
          aria-label="Delete garment"
          variant="ghost"
          colorScheme="red"
          size="sm"
          position="absolute"
          top={2}
          right={2}
          onClick={handleDeleteClick}
        />
      )}
      <VStack p={4} spacing={3} align="stretch">
        <Heading size="sm" noOfLines={1} >
          <LinkOverlay as={RouterLink} to={detailLink}>
            {garment.name || 'Untitled Garment'}
          </LinkOverlay>
        </Heading>
        <Button size="sm" colorScheme="purple" onClick={handleUseForStyle} mt={2}>
          Use Apparel
        </Button>
      </VStack>
    </LinkBox>
  );
} 