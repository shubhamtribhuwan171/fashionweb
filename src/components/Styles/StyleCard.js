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
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaFolderPlus } from 'react-icons/fa'; 
// Corrected import path for AddToCollectionModal with capitalization
import AddToCollectionModal from '../Modals/AddToCollectionModal';
// Import mock API functions
import { likeMockAsset, unlikeMockAsset } from '../../data/mockData'; 
import { useToast } from '@chakra-ui/react'; // Import useToast

export default function StyleCard({ style }) {
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
      if (!currentlyLiked) {
        await likeMockAsset(style.id);
        toast({ title: "Liked!", status: "success", duration: 1500 });
      } else {
        await unlikeMockAsset(style.id);
        toast({ title: "Unliked", status: "info", duration: 1500 });
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
      setIsLiked(currentlyLiked); // Revert optimistic update on error
      toast({ title: "Error updating like", status: "error", duration: 3000 });
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Use thumbnail_url for card view, fallback to image_url
  const displayImageUrl = style.thumbnail_url || style.image_url || 'https://via.placeholder.com/300?text=Style+Image';

  const handleCardClick = () => {
    if (style && style.id) {
        console.log(`Navigating to details for asset: ${style.id}`);
        // Implement navigation to the Asset Detail Page
        navigate(`/app/asset/${style.id}`); 
    } else {
        console.warn("StyleCard clicked but style or style.id is missing");
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
      >
        <AspectRatio ratio={1}>
            <Image
            pointerEvents="none" 
            src={displayImageUrl}
            // Use prompt as alt text if available
            alt={style.prompt || 'Generated Look'} 
            objectFit="cover"
            />
        </AspectRatio>
        <VStack p={4} spacing={2} align="stretch" pointerEvents="none"> 
          {/* Removed Heading as StyleCard doesn't have a name usually */}
          <Text fontSize="xs" color="gray.500" noOfLines={2}> 
             {/* Display prompt snippet */}
             Prompt: {style.prompt ? `${style.prompt.substring(0, 60)}...` : 'N/A'}
          </Text>
          <HStack justifyContent="space-between" pt={1}> 
            <Text fontSize="xs" color="gray.500">
              {new Date(style.created_at).toLocaleDateString() || 'Recently'}
            </Text>
            {/* Wrap interactive elements so they can capture clicks */}
            <HStack spacing={1} onClick={(e) => e.stopPropagation()} pointerEvents="auto">
              <IconButton
                aria-label="Add to Collection"
                icon={<FaFolderPlus />} 
                variant="ghost"
                size="sm"
                onClick={onAddToCollectionOpen} // Open the modal
                isDisabled={isLoadingLike} // Disable while liking
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

      {/* Ensure AddToCollectionModal is created and imported correctly */}
      <AddToCollectionModal 
        isOpen={isAddToCollectionOpen} 
        onClose={onAddToCollectionClose} 
        // Pass styleId based on API shape
        styleId={style.id} 
      />
    </>
  );
} 