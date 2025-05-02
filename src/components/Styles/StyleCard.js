import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import {
  Box,
  Image,
  Text,
  VStack,
  Heading,
  IconButton,
  HStack,
  useColorModeValue,
  useDisclosure,
  AspectRatio,
  useToast, // Import useToast
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaFolderPlus, FaTimes } from 'react-icons/fa';
// Import date-fns functions
import { format, isToday, isYesterday, differenceInCalendarWeeks, differenceInCalendarMonths } from 'date-fns';
// Corrected import path for AddToCollectionModal with capitalization
import AddToCollectionModal from '../Modals/AddToCollectionModal';
// Import mock API functions
// import { likeMockAsset, unlikeMockAsset } from '../../data/mockData';

// Helper function for relative date formatting
function formatRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';

    // Assuming week starts on Sunday (locale default)
    const weekDiff = differenceInCalendarWeeks(now, date, { weekStartsOn: 0 });
    if (weekDiff === 0) return 'This Week';
    if (weekDiff === 1) return 'Last Week';

    const monthDiff = differenceInCalendarMonths(now, date);
    // 'This Month' might overlap with 'This Week'/'Last Week', but acts as a fallback
    if (monthDiff === 0) return 'This Month';
    if (monthDiff === 1) return 'Last Month';

    // Fallback for older dates (e.g., Jan 5, 2023)
    return format(date, 'MMM d, yyyy');

  } catch (error) {
    console.error("Error formatting date:", error, "Input:", dateString);
    // Fallback to standard format or simple string on error
    try {
        return format(new Date(dateString), 'P'); // 'P' is locale-dependent short date format
    } catch {
        return 'Invalid Date';
    }
  }
}

export default function StyleCard({ style, onRemoveFromCollection }) {
  const navigate = useNavigate();
  const toast = useToast(); // Initialize toast
  // State for liking, defaults to style prop or false
  const [isLiked, setIsLiked] = useState(style?.is_liked || false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const { isOpen: isAddToCollectionOpen, onOpen: onAddToCollectionOpen, onClose: onAddToCollectionClose } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');

  if (!style) {
    return null;
  }

  const handleLikeToggle = async (e) => {
    e.stopPropagation(); // Prevent card click navigation
    setIsLoadingLike(true);
    const currentlyLiked = isLiked;
    setIsLiked(!currentlyLiked); // Optimistic UI update

    try {
      // Placeholder: Simulate API call
      await new Promise(res => setTimeout(res, 500));
      // Replace with axios.post/delete to /api/assets/{style.id}/like
      toast({ title: currentlyLiked ? "Unliked (Simulated)" : "Liked! (Simulated)", status: "info", duration: 1500 });
    } catch (error) {
      console.error("Failed to update like status:", error);
      setIsLiked(currentlyLiked); // Revert optimistic update on error
      toast({ title: "Error updating like", status: "error", duration: 3000 });
    } finally {
      setIsLoadingLike(false);
    }
  };

  // --- Updated image URL extraction logic ---
  let displayImageUrl = 'https://via.placeholder.com/300?text=Style'; // Default placeholder
  // PRIORITIZE thumbnail_url for card view
  if (style.thumbnail_url) {
      displayImageUrl = style.thumbnail_url;
  } else if (style.image_url) { // Fallback to image_url
      displayImageUrl = style.image_url;
  } else if (style.file_urls) { // Further fallback to file_urls (less common)
      const availableUrls = Object.values(style.file_urls);
      if (availableUrls.length > 0) {
          displayImageUrl = availableUrls[0];
      }
  }
  // --- End of updated logic ---

  const handleCardClick = () => {
    if (style && style.id) {
        console.log(`Navigating to details for asset: ${style.id}`);
        // Implement navigation to the Asset Detail Page
        navigate(`/app/asset/${style.id}`);
    } else {
        console.warn("StyleCard clicked but style or style.id is missing");
    }
  };

  // Handle Remove from Collection click
  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent card click navigation
    e.preventDefault();
    if (onRemoveFromCollection) {
      onRemoveFromCollection(); // Call the passed handler
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={cardBg}
        onClick={handleCardClick}
        _hover={{ shadow: 'md', cursor: 'pointer' }}
        position="relative"
      >
        {onRemoveFromCollection && (
            <IconButton
                icon={<FaTimes />}
                aria-label="Remove from collection"
                size="xs"
                colorScheme="red"
                variant="solid"
                isRound
                position="absolute"
                top={2}
                right={2}
                zIndex={2}
                onClick={handleRemoveClick}
            />
        )}
        <AspectRatio ratio={1}>
            <Image
              pointerEvents="none"
              src={displayImageUrl}
              alt={style.prompt || 'Generated Look'}
              objectFit="cover"
              loading="lazy"
              fallbackSrc="https://via.placeholder.com/150?text=Loading"
            />
        </AspectRatio>
        <VStack p={4} spacing={2} align="stretch" pointerEvents="none">
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
             Prompt: {style.prompt ? `${style.prompt.substring(0, 60)}...` : 'N/A'}
          </Text>
          <HStack justifyContent="space-between" pt={1}>
            <Text fontSize="xs" color="gray.500">
              {/* Use the helper function to format the date */}
              {formatRelativeDate(style.created_at)}
            </Text>
            <HStack spacing={1} onClick={(e) => e.stopPropagation()} pointerEvents="auto">
              <IconButton
                aria-label="Add to Collection"
                icon={<FaFolderPlus />}
                variant="ghost"
                size="sm"
                onClick={onAddToCollectionOpen}
                isDisabled={isLoadingLike}
              />
              <IconButton
                aria-label={isLiked ? 'Unlike' : 'Like'}
                icon={isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                isLoading={isLoadingLike}
              />
            </HStack>
          </HStack>
        </VStack>
      </Box>

      <AddToCollectionModal
        isOpen={isAddToCollectionOpen}
        onClose={onAddToCollectionClose}
        styleId={style.id}
      />
    </>
  );
} 