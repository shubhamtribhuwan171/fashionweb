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
  HStack, // Import HStack for layout
  IconButton, // Import IconButton for delete
  Spacer, // Import Spacer
  Center // Added for empty state centering
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom'; // For linking to collection details later
import { FaTrash, FaImage } from 'react-icons/fa'; // Added FaImage for empty state

const PLACEHOLDER_URL = 'https://via.placeholder.com/200?text=Collection';

// Accept onDelete prop
export default function CollectionCard({ collection, onDelete }) {
  // Determine thumbnail URL, default to null if none exists
  const thumbnailUrl = collection.thumbnail_urls?.length > 0 
                      ? collection.thumbnail_urls[0] 
                      : null; // Use null instead of placeholder URL

  const cardBg = useColorModeValue('white', 'gray.800');
  const emptyBg = useColorModeValue('gray.100', 'gray.700'); // Background for empty state
  const emptyColor = useColorModeValue('gray.500', 'gray.400'); // Color for empty state text/icon

  // Link to the detail page within the /app structure
  const collectionLink = `/app/collections/${collection.id}`;

  // Handle delete click
  const handleDeleteClick = (e) => {
      e.stopPropagation(); // Prevent LinkBox navigation
      e.preventDefault();
      if (onDelete) {
          onDelete();
      }
  };

  return (
    // Use LinkBox to make the entire card clickable
    <LinkBox as="article" borderWidth="1px" borderRadius="lg" overflow="hidden" bg={cardBg} _hover={{ shadow: 'md' }}>
      <AspectRatio ratio={1}>
        {/* Conditional rendering based on thumbnailUrl */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={`${collection.name || 'Collection'} thumbnail`}
            objectFit="cover"
            // No fallback needed as we handle the empty state explicitly
          />
        ) : (
          // Empty State Placeholder
          <Center bg={emptyBg} h="100%">
            <VStack spacing={1}>
              <FaImage color={emptyColor} size="24px" />
              <Text fontSize="xs" color={emptyColor}>No image</Text>
            </VStack>
          </Center>
        )}
      </AspectRatio>
      <VStack p={4} spacing={1} align="stretch">
        {/* Use HStack to position delete button next to heading */}
        <HStack justify="space-between" align="flex-start">
            <VStack align="stretch" flexGrow={1}> 
                <Heading size="sm" noOfLines={1}>
                <LinkOverlay as={RouterLink} to={collectionLink}>
                    {collection.name || 'Untitled Collection'}
                </LinkOverlay>
                </Heading>
                <Text fontSize="xs" color="gray.500">
                {collection.asset_count !== undefined ? `${collection.asset_count} items` : ''}
                </Text>
            </VStack>
            {/* Delete button */}
            {onDelete && (
                <IconButton
                icon={<FaTrash />}
                aria-label="Delete collection"
                variant="ghost"
                colorScheme="red"
                size="sm"
                onClick={handleDeleteClick}
                // Keep button compact
                ml={1} 
                />
            )}
        </HStack>
      </VStack>
    </LinkBox>
  );
} 