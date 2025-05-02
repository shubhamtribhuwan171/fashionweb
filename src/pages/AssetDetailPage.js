import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  useDisclosure,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Wrap,
  WrapItem,
  SimpleGrid
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaTrash, FaPlus, FaEllipsisV, FaArrowLeft, FaImage, FaTshirt, FaFolderPlus, FaChevronRight, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import AddToCollectionModal from '../components/Modals/AddToCollectionModal';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Helper to simplify aspect ratio
const simplifyAspectRatio = (ratio) => {
  if (!ratio || typeof ratio !== 'string') return 'N/A';
  const parts = ratio.split(':').map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1]) || parts[0] === 0 || parts[1] === 0) {
    return ratio; // Return original if format is unexpected
  }
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const commonDivisor = gcd(parts[0], parts[1]);
  return `${parts[0] / commonDivisor}:${parts[1] / commonDivisor}`;
};

// Helper to format date/time
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Example format: May 2, 2025, 7:59:04 PM - Adjust options as needed
    return date.toLocaleString(undefined, { 
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', second: 'numeric' 
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string
  }
};

export default function AssetDetailPage() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [asset, setAsset] = useState(null);
  const [baseGarment, setBaseGarment] = useState(null);
  const [modelImage, setModelImage] = useState(null);
  const [accessoryImages, setAccessoryImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { isOpen: isAddToCollectionOpen, onOpen: onAddToCollectionOpen, onClose: onAddToCollectionClose } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.800'); // Lighter bg for links
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');
  const garmentLinkHoverBg = useColorModeValue('gray.200', 'gray.600');

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // --- Fetch asset details (Simplified using nested data) ---
  const fetchAssetDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setBaseGarment(null);
    setModelImage(null);
    setAccessoryImages([]);
    const config = getAuthConfig();
    if (!config) {
      setError('Authentication required. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching asset details for ID: ${assetId}`);
      const response = await axios.get(`${API_BASE_URL}/api/assets/${assetId}`, config);
      const assetData = response.data;

      if (!assetData) {
        throw new Error('No data received for asset.');
      }
      console.log('>>> Asset API Response Data:', assetData);
      setAsset(assetData);

      // Set related data directly from nested details
      if (assetData.input_product_details) {
        console.log('Setting base garment from nested details:', assetData.input_product_details);
        setBaseGarment(assetData.input_product_details); 
      }
      
      if (assetData.input_model_details) {
        console.log('Setting model image from nested details:', assetData.input_model_details);
        // Map storage_url to url if needed by the component
        setModelImage({ 
            ...assetData.input_model_details, 
            url: assetData.input_model_details.storage_url 
        });
      }

      if (assetData.input_accessories_details && assetData.input_accessories_details.length > 0) {
        console.log('Setting accessories from nested details:', assetData.input_accessories_details);
        // Map storage_url to url if needed by the component
        setAccessoryImages(assetData.input_accessories_details.map(acc => ({ 
            ...acc, 
            url: acc.storage_url 
        })));
      }

    } catch (err) {
      console.error("Error fetching asset details:", err);
      setError(err.message || err.response?.data?.message || 'Failed to load asset details');
      setAsset(null); // Clear asset on error
    } finally {
      setIsLoading(false);
    }
  }, [assetId, getAuthConfig, toast]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  // --- Handle Like/Unlike Action (Using API) ---
  const handleLikeToggle = async () => {
    if (!asset) return;
    const config = getAuthConfig();
    if (!config) return;

    const currentLikedStatus = asset.is_liked;
    const newLikedStatus = !currentLikedStatus;
    setIsLiking(true);
    const url = `${API_BASE_URL}/api/assets/${assetId}/like`;

    // Optimistic update
    setAsset(prev => prev ? { ...prev, is_liked: newLikedStatus, like_count: (prev.like_count || 0) + (newLikedStatus ? 1 : -1) } : null);

    try {
      if (newLikedStatus) {
        await axios.post(url, {}, config);
        toast({ title: "Liked!", status: "success", duration: 1500 });
      } else {
        await axios.delete(url, config);
        toast({ title: "Unliked", status: "info", duration: 1500 });
      }
    } catch (error) {
      console.error("Failed to update like status:", error);
      // Revert optimistic update on failure
      setAsset(prev => prev ? { ...prev, is_liked: currentLikedStatus, like_count: (prev.like_count || 0) + (currentLikedStatus ? 1 : -1) } : null);
      toast({ title: "Error updating like", description: error.response?.data?.message || "Could not update like status.", status: "error", duration: 3000 });
    } finally {
      setIsLiking(false);
    }
  };

  // --- Handle Delete Action ---
  const handleDelete = () => {
      onDeleteOpen();
  };

  // --- Confirm Delete Action ---
  const confirmDelete = async () => {
      setIsDeleting(true);
      const config = getAuthConfig();
      if (!config || !assetId) {
         toast({ title: "Error", description: "Cannot delete asset. Missing info or auth.", status: "error" });
         setIsDeleting(false);
         onDeleteClose();
         return;
      }

      try {
         await axios.delete(`${API_BASE_URL}/api/assets/${assetId}`, config);
         toast({ title: "Asset Deleted", status: "success", duration: 2000 });
         navigate(-1); 
      } catch (err) {
         console.error("Error deleting asset:", err);
         const errorMsg = err.response?.data?.message || "Failed to delete asset.";
         toast({ title: "Delete Failed", description: errorMsg, status: "error", duration: 3000 });
      } finally {
         setIsDeleting(false);
         onDeleteClose();
      }
   };

  // --- Get Image URL for Display ---
  const getDisplayImageUrl = () => {
      if (asset?.file_urls) {
        return asset.file_urls['1024:1024'] || Object.values(asset.file_urls)[0];
      }
      return asset?.image_url || 'https://via.placeholder.com/500?text=No+Image';
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
        <Button mt={4} onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  if (!asset) {
    return <Center py={10}><Text>Asset data is unavailable.</Text></Center>;
  }

  const displayImageUrl = getDisplayImageUrl();
  const simplifiedRatio = simplifyAspectRatio(asset.aspect_ratio);
  const formattedCreationDate = formatDateTime(asset.created_at);
  // Get generation params (handle potentially missing keys)
  const generationParams = asset.generation_params || {};
  const size = generationParams.size || asset.size || 'N/A'; // Prefer generation_params.size, fallback

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumbs and Back Button */}
        <Flex justify="space-between" align="center">
          <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/app/my-looks">My Looks</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#" isTruncated maxW="300px">Asset Details</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
          >
            Back
          </Button>
        </Flex>

        {/* Main Content Layout (Image on Left, Details on Right) */}
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Image Section */}
          <Box flex={1} bg={cardBgColor} p={4} borderRadius="lg" boxShadow="md">
            <AspectRatio ratio={1} maxW="500px" mx="auto">
                <Image
                    src={displayImageUrl}
                    alt={asset.alt_text || "Generated fashion asset"}
                    objectFit="contain"
                    borderRadius="md"
                />
            </AspectRatio>
          </Box>

          {/* Details Section */}
          <VStack flex={1} align="stretch" spacing={4} bg={cardBgColor} p={6} borderRadius="lg" boxShadow="md">
            <Heading size="lg" color={headingColor}>Asset Details</Heading>

            {/* Action Buttons */}
            <HStack spacing={2}>
              <IconButton
                aria-label={asset.is_liked ? 'Unlike' : 'Like'}
                icon={asset.is_liked ? <FaHeart color="red"/> : <FaRegHeart />}
                onClick={handleLikeToggle}
                isLoading={isLiking}
                size="sm"
                variant="ghost"
              />
              <Button
                leftIcon={<Icon as={FaFolderPlus} />}
                onClick={onAddToCollectionOpen}
                size="sm"
                bgGradient="linear(to-r, teal.400, purple.500, blue.500)"
                color="white"
                fontWeight="semibold"
                _hover={{
                  bgGradient: "linear(to-r, teal.500, purple.600, blue.600)",
                  boxShadow: "lg",
                  transform: "translateY(-3px) scale(1.03)",
                }}
                _active={{
                  bgGradient: "linear(to-r, teal.600, purple.700, blue.700)",
                  transform: "translateY(-1px) scale(1.00)"
                }}
                boxShadow="md"
                transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
                borderRadius="md"
              >
                Add to Collection
              </Button>
              <Spacer />
              <Menu>
                <MenuButton as={IconButton} icon={<FaEllipsisV />} size="sm" variant="ghost" aria-label="Options" />
                <MenuList>
                  <MenuItem icon={<FaTrash />} onClick={handleDelete} color="red.500">
                    Delete Asset
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            <Divider />

            {/* Prompt */}
            <Box>
              <Heading size="sm" mb={2}>Prompt</Heading>
              <Text fontSize="sm" color={textColor}>{asset.prompt || 'No prompt provided.'}</Text>
            </Box>

            <Divider />

            {/* Details Grid */}
            <SimpleGrid columns={2} spacing={4}>
                <Box>
                    <Text fontWeight="bold">Created:</Text>
                    <Text fontSize="sm" color={textColor}>{formattedCreationDate}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Size:</Text>
                    <Text fontSize="sm" color={textColor}>{size}</Text>
                </Box>
                <Box>
                    <Text fontWeight="bold">Aspect Ratio:</Text>
                    <Text fontSize="sm" color={textColor}>{simplifiedRatio}</Text>
                </Box>
                 {asset.is_public && (
                     <Box>
                        <Text fontWeight="bold">Visibility:</Text>
                        <Tag size="sm" colorScheme="green">Public</Tag>
                    </Box>
                 )}
            </SimpleGrid>

            {/* Model Used Link */}
            {modelImage && (
              <>
                <Divider />
                <Box>
                  <Heading size="sm" mb={2}>Model Used</Heading>
                  <HStack p={2} bg={bgColor} borderRadius="md" >
                      <Image
                          src={modelImage.url}
                          alt={modelImage.name || 'Model'}
                          boxSize="40px"
                          objectFit="cover"
                          borderRadius="sm"
                      />
                      <Text fontSize="sm" fontWeight="medium">{modelImage.name || 'Unnamed Model'}</Text>
                  </HStack>
                </Box>
              </>
            )}

            {/* Base Garment Link -> Apparel Item Link */}
            {baseGarment && (
              <>
                <Divider />
                <Box>
                  <Heading size="sm" mb={2}>Apparel Item Used</Heading>
                  <Link as={RouterLink} to={`/app/products`} _hover={{ textDecoration: 'none' }}>
                    <HStack p={2} bg={bgColor} borderRadius="md" _hover={{ bg: garmentLinkHoverBg }}>
                       {baseGarment.reference_image_url && (
                           <Image
                              src={baseGarment.reference_image_url}
                              alt={baseGarment.name || 'Apparel item'}
                              boxSize="40px"
                              objectFit="cover"
                              borderRadius="sm"
                          />
                       )}
                       {!baseGarment.reference_image_url && (
                           <Icon as={FaTshirt} />
                       )}
                        <Text fontSize="sm" fontWeight="medium">{baseGarment.name || 'Unnamed Apparel'}</Text>
                    </HStack>
                  </Link>
                </Box>
              </>
            )}

            {/* Accessories Used Section */}
            {accessoryImages && accessoryImages.length > 0 && (
                <>
                    <Divider />
                    <Box>
                        <Heading size="sm" mb={2}>Accessories Used</Heading>
                        <Wrap spacing={2}>
                            {accessoryImages.map((accessory) => (
                                <WrapItem key={accessory.id}>
                                    <HStack p={1} bg={bgColor} borderRadius="md" >
                                        <Image
                                            src={accessory.url}
                                            alt={accessory.name || 'Accessory'}
                                            boxSize="30px"
                                            objectFit="cover"
                                            borderRadius="sm"
                                        />
                                        <Text fontSize="xs" fontWeight="medium">{accessory.name || 'Unnamed Accessory'}</Text>
                                    </HStack>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                </>
            )}

             {/* Collections Section */}
             {asset.collections && asset.collections.length > 0 && (
                <>
                    <Divider />
                    <Box>
                        <Heading size="sm" mb={2}>In Collections</Heading>
                        <Wrap spacing={2}>
                            {asset.collections.map((collection) => (
                                <WrapItem key={collection.id}>
                                    <Link as={RouterLink} to={`/app/collections/${collection.id}`} _hover={{ textDecoration: 'none' }}>
                                        <Tag size="sm" colorScheme="blue" variant="subtle">{collection.name}</Tag>
                                    </Link>
                                </WrapItem>
                            ))}
                        </Wrap>
                    </Box>
                </>
             )}

          </VStack>
        </Flex>
      </VStack>

      {/* Add to Collection Modal */}
      {asset && (
         <AddToCollectionModal
           isOpen={isAddToCollectionOpen}
           onClose={onAddToCollectionClose}
           assetId={asset.id}
           assetName={asset.prompt?.substring(0, 30) || asset.id}
         />
      )}

       {/* Delete Confirmation Dialog */}
       <AlertDialog
           isOpen={isDeleteDialogOpen}
           leastDestructiveRef={cancelRef}
           onClose={onDeleteClose}
           isCentered
       >
           <AlertDialogOverlay>
               <AlertDialogContent borderRadius="lg">
                   <AlertDialogHeader fontSize="lg" fontWeight="bold">
                       Delete Asset
                   </AlertDialogHeader>

                   <AlertDialogBody>
                       Are you sure you want to delete this generated look? This action cannot be undone.
                   </AlertDialogBody>

                   <AlertDialogFooter>
                       <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={isDeleting}>
                           Cancel
                       </Button>
                       <Button 
                        onClick={confirmDelete} 
                        ml={3} 
                        isLoading={isDeleting}
                        bgGradient="linear(to-r, red.500, orange.500)"
                        color="white"
                        fontWeight="semibold"
                        _hover={{
                          bgGradient: "linear(to-r, red.600, orange.600)",
                          boxShadow: "lg",
                          transform: "translateY(-3px) scale(1.03)",
                        }}
                        _active={{
                          bgGradient: "linear(to-r, red.700, orange.700)",
                          transform: "translateY(-1px) scale(1.00)"
                        }}
                        boxShadow="md"
                        transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
                        borderRadius="md"
                       >
                           Delete
                       </Button>
                   </AlertDialogFooter>
               </AlertDialogContent>
           </AlertDialogOverlay>
       </AlertDialog>
    </Container>
  );
}
