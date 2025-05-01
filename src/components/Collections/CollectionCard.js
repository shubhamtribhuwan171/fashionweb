import React from 'react';
import {
  Box,
  Image,
  Text,
  VStack,
  Heading,
  AspectRatio, // Use AspectRatio to maintain image shape
  useColorModeValue,
  LinkBox,      // Import LinkBox
  LinkOverlay,  // Import LinkOverlay
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // For linking to collection details later

export default function CollectionCard({ collection }) {
  // Use thumbnailUrl (camelCase) to match mockData function
  const thumbnailUrl = collection.thumbnailUrl || 'https://via.placeholder.com/200?text=Collection';
  const cardBg = useColorModeValue('white', 'gray.800');

  // Link to the detail page within the /app structure
  const collectionLink = `/app/collections/${collection.id}`;

  return (
    // Use LinkBox to make the entire card clickable
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" overflow="hidden" bg={cardBg} _hover={{ shadow: 'md' }}>
      <AspectRatio ratio={1}>
        {/* Image remains the direct child of AspectRatio */}
        <Image
          src={thumbnailUrl}
          alt={`${collection.name || 'Collection'} thumbnail`}
          objectFit="cover"
        />
      </AspectRatio>
      <VStack p={4} spacing={1} align="stretch">
        <Heading size="sm" noOfLines={1}>
          {/* LinkOverlay wraps the heading, making it the primary link target */}
          {/* The overlay will implicitly cover the whole LinkBox */}
          <LinkOverlay as={RouterLink} to={collectionLink}>
            {collection.name || 'Untitled Collection'}
          </LinkOverlay>
        </Heading>
        <Text fontSize="xs" color="gray.500">
          {/* Use asset_count as per API reference */}
          {collection.asset_count !== undefined ? `${collection.asset_count} items` : ''}
        </Text>
      </VStack>
    </LinkBox>
  );
} 