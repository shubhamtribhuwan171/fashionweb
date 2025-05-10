import React, { useState, useEffect, useRef } from 'react';
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
const HOVER_INTERVAL_MS = 700; // Time in ms between image changes on hover

// Accept onDelete prop
export default function CollectionCard({ collection, onDelete }) {
  // Determine thumbnail URL array, default to empty array if none exists
  const thumbnailUrls = collection.thumbnail_urls || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null); // Ref to store the interval ID

  const cardBg = useColorModeValue('white', 'gray.800');
  const emptyBg = useColorModeValue('gray.100', 'gray.700'); // Background for empty state
  const emptyColor = useColorModeValue('gray.500', 'gray.400'); // Color for empty state text/icon

  // Link to the detail page within the /app structure
  const collectionLink = `/app/collections/${collection.id}`;

  // Preload images when the component mounts or thumbnails change
  useEffect(() => {
    thumbnailUrls.forEach(url => {
      if (url) { // Ensure URL is not null/empty
        const img = new window.Image(); // Use window.Image to avoid naming conflict
        img.src = url;
      }
    });
  }, [thumbnailUrls]); // Dependency array ensures this runs if thumbnails change

  // Handle delete click
  const handleDeleteClick = (e) => {
      e.stopPropagation(); // Prevent LinkBox navigation
      e.preventDefault();
      if (onDelete) {
          onDelete();
      }
  };

  // Function to clear the interval
  const clearHoverInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (thumbnailUrls.length > 1) { // Only start interval if there's more than one image
      clearHoverInterval(); // Clear any existing interval first
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % thumbnailUrls.length);
      }, HOVER_INTERVAL_MS);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    clearHoverInterval();
    setCurrentImageIndex(0); // Reset to the first image
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => clearHoverInterval();
  }, []);

  return (
    // Use LinkBox to make the entire card clickable
    <LinkBox
      as="article"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      _hover={{ shadow: 'md' }}
      onMouseEnter={handleMouseEnter} // Add mouse enter handler
      onMouseLeave={handleMouseLeave} // Add mouse leave handler
    >
      <AspectRatio ratio={1}>
        {/* Conditional rendering based on thumbnailUrls */}
        {thumbnailUrls.length > 0 ? (
          <Image
            src={thumbnailUrls[currentImageIndex]} // Use the current index
            alt={`${collection.name || 'Collection'} thumbnail ${currentImageIndex + 1}`}
            objectFit="cover"
            objectPosition="top"
            // Add a subtle transition
            transition="opacity 0.3s ease-in-out"
            key={thumbnailUrls[currentImageIndex]} // Add key to help React detect src change for transition
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