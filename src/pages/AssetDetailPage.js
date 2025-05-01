import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Button,
  Tag,
  Divider,
  Spinner,
  useColorModeValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Link,
  Center,
  Alert,
  AlertIcon,
  AspectRatio,
  useDisclosure, // For AddToCollectionModal
  useToast, // For user feedback
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaDownload, FaTrash, FaPlus, FaEllipsisV, FaArrowLeft, FaImage, FaTshirt, FaFolderPlus } from 'react-icons/fa';
// Corrected import paths with capitalization
import AddToCollectionModal from '../components/Modals/AddToCollectionModal';
import { getMockAssetById, getMockProductById, likeMockAsset, unlikeMockAsset, deleteMockCollection } from '../data/mockData'; // Removed getMockCollections, AddToCollectionModal fetches its own

export default function AssetDetailPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [asset, setAsset] = useState(null);
  const [baseGarment, setBaseGarment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false); // State for like action loading
  const [isDeleting, setIsDeleting] = useState(false); // State for delete action loading
  const [error, setError] = useState(null);
  const { isOpen: isAddToCollectionOpen, onOpen: onAddToCollectionOpen, onClose: onAddToCollectionClose } = useDisclosure();

  // Theme colors
  const bgColor = useColorModeValue('gray.100', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const garmentLinkHoverBg = useColorModeValue('gray.200', 'gray.600');

  // Fetch asset details and related base garment if applicable
  const fetchAssetDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setBaseGarment(null);
    try {
      const data = await getMockAssetById(assetId);
      if (data) {
        setAsset(data);
        // Check if there's a linked base garment (product_id)
        if (data.product_id) {
          try {
            const garmentData = await getMockProductById(data.product_id);
            setBaseGarment(garmentData); // Set base garment if found
          } catch (garmentError) {
            console.warn(`Could not fetch base garment ${data.product_id}:`, garmentError);
          }
        }
      } else {
        setError('Asset not found');
      }
    } catch (err) {
      console.error("Error fetching asset:", err);
      setError(err.message || 'Failed to load asset details');
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  // Handle Like/Unlike Action
  const handleLikeToggle = async () => {
    if (!asset) return;
    const currentLikedStatus = asset.is_liked;
    const newLikedStatus = !currentLikedStatus;
    setIsLiking(true);
    
    // Optimistic UI update
    setAsset(prev => prev ? { ...prev, is_liked: newLikedStatus } : null);
    
    try {
      if (newLikedStatus) {
        await likeMockAsset(assetId);
        toast({ title: "Liked!", status: "success", duration: 1500 });
      } else {
        await unlikeMockAsset(assetId);
        toast({ title: "Unliked", status: "info", duration: 1500 });
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
      // Revert optimistic update on error
      setAsset(prev => prev ? { ...prev, is_liked: currentLikedStatus } : null);
      toast({ title: "Error updating like", status: "error", duration: 3000 });
    } finally {
      setIsLiking(false);
    }
  };

  // Handle Download Action
  const handleDownload = () => {
    if (!asset?.image_url) return;
    console.log(`Downloading asset ${assetId}`);
    const link = document.createElement('a');
    link.href = asset.image_url; // Use image_url from API response
    link.download = `ai-fashion-asset-${asset.id}.png`; // Suggest a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete Action (Placeholder - API doesn't support asset delete yet)
  const handleDelete = async () => {
      toast({ title: "Delete Not Supported", description: "Deleting individual assets is not currently available via the API.", status: "info", duration: 4000 });
      // If API supported delete:
      // if (window.confirm('Are you sure you want to delete this asset?')) {
      //     setIsDeleting(true);
      //     try {
      //         // await deleteMockAsset(assetId); // Replace with actual API call
      //         toast({ title: "Asset deleted", status: "success" });
      //         navigate('/app/generations'); // Or dashboard/wherever appropriate
      //     } catch (error) {
      //         console.error("Failed to delete asset:", error);
      //         toast({ title: "Failed to delete asset", status: "error" });
      //         setIsDeleting(false);
      //     }
      // }
  };

  // --- Render Logic --- 

  if (isLoading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => navigate('/app/dashboard')}>Go Back to Dashboard</Button>
      </Container>
    );
  }

  if (!asset) {
    return <Center py={10}><Text>Asset data is unavailable.</Text></Center>;
  }

  // Determine source type text/icon based on available IDs
  let sourceTypeIcon = null;
  let sourceTypeText = "Text Only";
  if (asset.product_id && asset.input_image_id) {
    sourceTypeIcon = FaTshirt; // Or combine icons?
    sourceTypeText = "Garment + Ref Image";
  } else if (asset.product_id) {
    sourceTypeIcon = FaTshirt;
    sourceTypeText = "Base Garment";
  } else if (asset.input_image_id) {
    sourceTypeIcon = FaImage;
    sourceTypeText = "Reference Image";
  }

  return (
    <>
      <Container maxW="container.xl" py={8}>
        {/* Back Button */} 
        <Button 
          leftIcon={<FaArrowLeft />} 
          onClick={() => navigate(-1)} 
          mb={6}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>

        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}> 
          {/* Left Side: Image */}
          <Box flex={{ base: 'none', lg: 3 }} bg={cardBgColor} p={4} borderRadius="lg" shadow="md" overflow="hidden" alignSelf="flex-start">
             <AspectRatio ratio={1} maxW="70vh" mx="auto">
                <Image
                  src={asset.image_url} // Use the main image_url
                  alt={`Generated Asset ${asset.id}`}
                  objectFit="contain"
                  borderRadius="md"
                />
             </AspectRatio>
          </Box>

          {/* Right Side: Details & Actions */}
          <VStack flex={{ base: 'none', lg: 2 }} align="stretch" spacing={5} bg={cardBgColor} p={6} borderRadius="lg" shadow="md" alignSelf="flex-start">
            <Heading size="lg" color={headingColor}>Asset Details</Heading>
            <Divider />

            {/* Source Info */} 
            <VStack align="stretch" spacing={2}>
                <HStack>
                   {sourceTypeIcon && <Icon as={sourceTypeIcon} color={textColor} />}
                   <Text fontWeight="bold">Source Type:</Text>
                   <Text color={textColor}>{sourceTypeText}</Text>
                </HStack>
                {/* Link to Base Garment if exists */} 
                {baseGarment && (
                     <Link as={RouterLink} to={`/app/products/${baseGarment.id}`} _hover={{ textDecoration: 'none' }}>
                        <HStack bg={bgColor} p={2} borderRadius="md" spacing={3} _hover={{bg: garmentLinkHoverBg}}>
                        <Image 
                            src={baseGarment.reference_image_url} 
                            alt={baseGarment.name} 
                            boxSize="40px" 
                            objectFit="cover" 
                            borderRadius="sm" 
                        />
                        <Text fontSize="sm" fontWeight="medium">Base: {baseGarment.name}</Text>
                        </HStack>
                    </Link>
                )}
                 {/* Display Ref Image ID if exists (no image fetched here) */} 
                 {asset.input_image_id && (
                    <Text fontSize="xs" color={textColor}>Ref Image ID: {asset.input_image_id}</Text>
                 )}
            </VStack>
            
            <Divider />

            {/* Prompt */}
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="bold">Prompt:</Text>
              <Text fontSize="sm" color={textColor} maxH="200px" overflowY="auto">{asset.prompt || "No prompt provided."}</Text>
            </VStack>
            
            <Divider />

            {/* Generation Params (if available) */} 
             {asset.generation_params && (
                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="bold" fontSize="sm">Generation Details:</Text>
                    <Text fontSize="xs" color={textColor}>Model: {asset.generation_params.model || 'N/A'}</Text>
                    <Text fontSize="xs" color={textColor}>Quality: {asset.generation_params.quality || 'N/A'}</Text>
                    <Text fontSize="xs" color={textColor}>Size: {asset.generation_params.size || 'N/A'}</Text>
                </VStack>
             )}

            <VStack align="stretch" spacing={1}>
                <Text fontSize="xs" color={textColor}>Asset ID: {asset.id}</Text>
                <Text fontSize="xs" color={textColor}>Job ID: {asset.job_id}</Text>
                <Text fontSize="xs" color={textColor}>Created: {new Date(asset.created_at).toLocaleString()}</Text>
                <Text fontSize="xs" color={textColor}>Public: {asset.is_public ? 'Yes' : 'No'}</Text>
            </VStack>

            <Spacer />
            <Divider />

            {/* Action Buttons */} 
            <HStack spacing={2} justify="flex-end"> 
              <IconButton
                icon={asset.is_liked ? <FaHeart /> : <FaRegHeart />} 
                colorScheme={asset.is_liked ? 'red' : 'gray'}
                variant="outline"
                onClick={handleLikeToggle}
                aria-label={asset.is_liked ? 'Unlike' : 'Like'}
                isLoading={isLiking}
                size="sm"
              />
              <IconButton
                icon={<FaFolderPlus />} 
                variant="outline"
                onClick={onAddToCollectionOpen} // Open the AddToCollectionModal
                aria-label="Add to Collection"
                size="sm"
                isDisabled={isLiking || isDeleting}
              />
              <IconButton
                icon={<FaDownload />} 
                variant="outline"
                onClick={handleDownload}
                aria-label="Download Image"
                size="sm"
                isDisabled={isLiking || isDeleting}
              />
               <IconButton
                  icon={<FaTrash />} 
                  variant="outline"
                  colorScheme="red"
                  onClick={handleDelete}
                  aria-label="Delete Asset"
                  size="sm"
                  isLoading={isDeleting}
                  isDisabled={isLiking} // Disable if liking in progress
                />
            </HStack>
          </VStack>
        </Flex>
      </Container>

      {/* AddToCollectionModal */} 
      {asset && (
        <AddToCollectionModal 
          isOpen={isAddToCollectionOpen} 
          onClose={onAddToCollectionClose} 
          styleId={asset.id} 
        />
      )}
    </>
  );
} 