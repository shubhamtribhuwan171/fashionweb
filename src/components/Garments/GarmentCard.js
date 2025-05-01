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
  AspectRatio
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function GarmentCard({ garment }) {
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
    // Navigate to the create style page, passing the garment ID in state
    navigate('/app/create-style', { state: { preselectedGarmentId: garment.id } });
  };

  return (
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" overflow="hidden" bg={cardBg} _hover={{ shadow: 'md' }}>
       <AspectRatio ratio={1} >
            <Image
            src={imageUrl}
            alt={garment.name || 'Garment Image'}
            objectFit="cover" 
            />
       </AspectRatio>
      <VStack p={4} spacing={3} align="stretch">
        <Heading size="sm" noOfLines={1} textAlign="center">
          <LinkOverlay as={RouterLink} to={detailLink}>
            {garment.name || 'Untitled Garment'}
          </LinkOverlay>
        </Heading>
        {/* Removed View Details button for simplicity, LinkOverlay handles click */}
        <Button size="sm" colorScheme="blue" onClick={handleUseForStyle} mt={2}>
            Visualize with Garment
        </Button>
      </VStack>
    </LinkBox>
  );
} 