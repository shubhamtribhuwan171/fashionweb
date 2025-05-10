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
import { FaHeart, FaRegHeart, FaTrash, FaPlus, FaEllipsisV, FaArrowLeft, FaImage, FaTshirt, FaFolderPlus, FaChevronRight, FaUserCircle, FaBoxOpen, FaShoppingBag, FaPaintBrush, FaDownload, FaCrop } from 'react-icons/fa';
import axios from 'axios';
import AddToCollectionModal from '../components/Modals/AddToCollectionModal';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import InputPreviewModal from '../components/Modals/InputPreviewModal';
import ImageCropModal from '../components/Modals/ImageCropModal';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import MaskEditorModal from './MaskEditorModal';

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
    const now = new Date();

    // Reset time parts for day comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfInputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true }; // e.g., 3:05 PM
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' }; // e.g., May 3, 2025

    if (startOfInputDate.getTime() === startOfToday.getTime()) {
      return `Today ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else if (startOfInputDate.getTime() === startOfYesterday.getTime()) {
      return `Yesterday ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else {
      return date.toLocaleDateString(undefined, dateOptions);
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // Fallback to original string
  }
};

// --- NEW: Helper to calculate aspect ratio from size string ---
const calculateAspectRatio = (sizeString) => {
  if (!sizeString || typeof sizeString !== 'string') return 1; // Default to 1:1
  const parts = sizeString.split('x').map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1]) || parts[0] <= 0 || parts[1] <= 0) {
    return 1; // Invalid format, default to 1:1
  }
  return parts[0] / parts[1]; // width / height
};

// --- Input Details Display Component --- 
const InputDetailCard = ({ label, icon, name, imageUrl }) => {
  const cardBg = useColorModeValue('gray.100', 'gray.700');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');

  return (
    <HStack 
      bg={cardBg} 
      p={2} 
      borderRadius="md" 
      spacing={3} 
      alignItems="center" 
      _hover={{ bg: hoverBg }}
    >
      <Icon as={icon} color="purple.500" />
      <VStack align="start" spacing={0} flex={1} overflow="hidden">
        <Text fontSize="xs" color="gray.500">{label}</Text>
        <Text fontSize="sm" fontWeight="medium" noOfLines={1} title={name}>{name}</Text>
      </VStack>
      {imageUrl && (
        <Image src={imageUrl} alt={label} boxSize="30px" borderRadius="sm" objectFit="cover" />
      )}
    </HStack>
  );
};

// --- NEW: Detail Item for Grid --- 
const DetailItem = ({ label, children }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>{label}</Text>
      <Box>{children}</Box> {/* Allow rendering complex children like Tags */} 
    </Box>
  );
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
  const { isOpen: isCropModalOpen, onOpen: onCropModalOpen, onClose: onCropModalClose } = useDisclosure();
  const { setHeader } = usePageHeader();
  const cancelRef = useRef();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { 
    isOpen: isPreviewModalOpen, 
    onOpen: onOpenPreviewModal, 
    onClose: onClosePreviewModal 
  } = useDisclosure();
  const [selectedInputForPreview, setSelectedInputForPreview] = useState(null);
  const { isOpen: isMaskEditorOpen, onOpen: onMaskEditorOpen, onClose: onMaskEditorClose } = useDisclosure();

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

  // Effect to set page header
  useEffect(() => {
    const title = "Look Details";
    const subtitle = asset ? (asset.prompt ? `Prompt: "${asset.prompt.substring(0, 50)}..."` : `ID: ${asset.id}`) : "Loading look details...";
    setHeader(title, subtitle);
    return () => setHeader('', ''); // Cleanup on unmount
  }, [asset, setHeader]);

  // --- NEW: Remix Function ---
  const handleRemix = () => {
    if (!asset) {
      toast({ title: "Cannot Remix", description: "Asset data not loaded yet.", status: "warning" });
      return;
    }
    // Navigate to the create page, passing the full asset object
    console.log("Remixing asset, passing full object to Create Style page.");
    navigate('/app/create', { state: { remixAsset: asset } });
  };

  // --- NEW: Handle Direct Download ---
  const handleDownload = async () => {
    if (!asset) {
      toast({ title: "Cannot Download", description: "Asset data not loaded yet.", status: "warning" });
      return;
    }
    const imageUrl = getDisplayImageUrl();
    if (!imageUrl || imageUrl.startsWith('https://via.placeholder.com')) {
        toast({ title: "Download Error", description: "Image URL is not available.", status: "error" });
        return;
    }

    const fileName = asset.prompt ? asset.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) + '.png' : `asset_${asset.id}.png`;
    
    toast({ title: "Preparing Download...", status: "info", duration: 1500 });

    try {
      // Fetch the image data as a blob
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      
      // Create an object URL from the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // Suggest a filename
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the object URL to free up resources
      window.URL.revokeObjectURL(blobUrl);

      toast({ title: "Downloading Started!", description: `Image ${fileName} should be downloading.`, status: "success", duration: 3000 });

    } catch (error) {
      console.error("Error downloading image:", error);
      toast({ 
        title: "Download Failed", 
        description: error.message || "Could not download the image. The server might be preventing direct downloads or there was a network issue.", 
        status: "error", 
        duration: 4000 
      });
    }
  };

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

  // --- Handle opening the input preview modal --- 
  const handleOpenInputPreview = (details) => {
    setSelectedInputForPreview(details);
    onOpenPreviewModal();
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

  const handleGenerateWithMask = (maskDataUrl, prompt) => {
    // This is where you would send the data to your backend
    console.log("Generate called with:");
    console.log("Asset ID:", asset.id);
    console.log("Original Image URL:", asset.image_url);
    // console.log("Mask Data URL:", maskDataUrl); // Mask is a large base64 string
    console.log("Prompt:", prompt);
    // Close the modal after submission for now
    onMaskEditorClose();
    // TODO: Handle API call to backend, display new results etc.
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
  // Get generation params and size
  const generationParams = asset.generation_params || {};
  const size = generationParams.size || asset.size || 'N/A'; // Prefer generation_params.size, fallback
  // Derive aspect ratio from size string (e.g., '1024x1536' -> '1024:1536' -> simplified '2:3')
  const ratioString = size && size.includes('x') ? size.replace('x', ':') : null;
  const simplifiedRatio = ratioString ? simplifyAspectRatio(ratioString) : 'N/A';
  const formattedCreationDate = formatDateTime(asset.created_at);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex mb={6} justify="space-between" align="center">
        {/* Breadcrumbs */}
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/app/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">Look Details</BreadcrumbLink>
            </BreadcrumbItem>
        </Breadcrumb>
        {/* Action Buttons */}
        <HStack spacing={2}>
          {/* Back Button */}
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
          >
            Back
          </Button>

          {/* Remix Button */}
          <Button
            leftIcon={<FaPaintBrush />}
            onClick={handleRemix}
            variant="outline"
            colorScheme="purple" // Use a distinct color
            size="sm"
            isDisabled={!asset} // Disable if asset data isn't loaded
          >
            Remix
          </Button>

          {/* Download Button */}
          <Button
            leftIcon={<FaDownload />}
            onClick={handleDownload}
            variant="outline"
            colorScheme="green"
            size="sm"
            isDisabled={!asset}
          >
            Download
          </Button>

          {/* Crop Button */}
          <Button
            leftIcon={<FaCrop />}
            onClick={onCropModalOpen} // Placeholder for now
            variant="outline"
            colorScheme="teal"
            size="sm"
            isDisabled={!asset}
          >
            Crop & Download
          </Button>

          {/* Add to Collection Button */}
          <Button
            leftIcon={<FaFolderPlus />}
            onClick={onAddToCollectionOpen}
            variant="outline"
            colorScheme="blue"
            size="sm"
            isDisabled={!asset} // Disable if asset data isn't loaded
          >
            Add to Collection
          </Button>

          {/* Like Button */}
          <IconButton
            icon={asset?.is_liked ? <FaHeart color="red" /> : <FaRegHeart />}
            aria-label={asset?.is_liked ? 'Unlike' : 'Like'}
            onClick={handleLikeToggle}
            isLoading={isLiking}
            variant="ghost"
            size="sm"
            isDisabled={!asset} // Disable if asset data isn't loaded
          />

          {/* Delete Button */}
          <IconButton
            icon={<FaTrash />}
            aria-label="Delete Asset"
            onClick={onDeleteOpen}
            colorScheme="red"
            variant="ghost"
            size="sm"
            isDisabled={!asset} // Disable if asset data isn't loaded
          />

          {/* Mask Editor Button */}
          <Button
            colorScheme="purple"
            onClick={onMaskEditorOpen}
            size="sm"
            isDisabled={!asset}
          >
            AI Mask Edit
          </Button>
        </HStack>
      </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Left Side: Image & Actions */}
        <VStack flex={1} spacing={4} align="stretch">
            <Box 
              bg={cardBgColor} 
              p={4} 
              borderRadius="lg" 
              shadow="md" 
              overflow="hidden" 
              cursor="pointer" 
              onClick={() => setIsLightboxOpen(true)}
              alignSelf="flex-start" // Keep the box aligned top
            >
                <Image
                    src={displayImageUrl}
                    alt={asset.prompt || 'Generated Style'}
                    objectFit="contain" // Keep contain
                    borderRadius="md"
                    _hover={{ opacity: 0.85 }}
                    transition="opacity 0.2s ease-in-out"
                    width="100%" // Ensure image fills container width
                    // Removed forced aspect ratio
                />
            </Box>
        </VStack>

        {/* Right Side: Details */}
        <VStack flex={2} spacing={6} align="stretch">
            <Box bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
                <Heading size="lg" color={headingColor} mb={4}>Style Details</Heading>
                <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium">Prompt:</Text>
                    <Text fontSize="sm" color={textColor}>{asset.prompt || 'No prompt provided.'}</Text>
                    {asset.revised_prompt && (
                        <>
                            <Text fontWeight="medium" mt={2}>Revised Prompt:</Text>
                            <Text fontSize="sm" fontStyle="italic" color={textColor}>{asset.revised_prompt}</Text>
                        </>
                    )}
                    <Divider />
                    {/* --- NEW: Details Grid --- */}
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacingX={6} spacingY={4}>
                      <DetailItem label="Created"> 
                        <Text fontSize="sm" color={textColor}>{formatDateTime(asset.created_at)}</Text>
                      </DetailItem>
                      <DetailItem label="Aspect Ratio">
                        <Text fontSize="sm" color={textColor}>{simplifiedRatio}</Text>
                      </DetailItem>
                      <DetailItem label="Size"> 
                        <Text fontSize="sm" color={textColor}>{asset.size || 'N/A'}</Text>
                      </DetailItem>
                      {/* Conditionally render optional fields */} 
                      {asset.garment_focus && (
                        <DetailItem label="Garment Focus"> 
                          <Tag size="sm" colorScheme="green">{asset.garment_focus}</Tag>
                        </DetailItem>
                      )}
                      {asset.quality && (
                        <DetailItem label="Quality"> 
                          <Tag size="sm" colorScheme={asset.quality === 'hd' ? 'purple' : 'gray'}>{asset.quality}</Tag>
                        </DetailItem>
                      )}
                    </SimpleGrid>
                    {/* --- Collections Section --- */}
                    {asset.collections && asset.collections.length > 0 && (
                        <>
                            <Divider pt={2} />
                            <Text fontWeight="medium" pt={2}>In Collections:</Text>
                            <Wrap spacing={2} pt={1}>
                                {asset.collections.map((collection) => (
                                    <WrapItem key={collection.id}>
                                        <Link as={RouterLink} to={`/app/collections/${collection.id}`} _hover={{ textDecoration: 'none' }}>
                                            <Tag size="sm" variant="subtle" colorScheme="blue" cursor="pointer" _hover={{ bg: 'blue.100' }}>
                                                {collection.name}
                                            </Tag>
                                        </Link>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </>
                    )}
                </VStack>
            </Box>

            {/* --- NEW: Input Details Section --- */}
            <Box bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
                <Heading size="md" color={headingColor} mb={4}>Inputs Used</Heading>
                {asset.input_details && Object.keys(asset.input_details).some(key => asset.input_details[key]) ? (
                    // Display the grid if there are actual input details
                    <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                        {asset.input_details.model && (
                            <Box cursor="pointer" onClick={() => handleOpenInputPreview({ label: 'Model', name: asset.input_details.model.name, imageUrl: asset.input_details.model.storage_url })}>
                                <InputDetailCard 
                                    label="Model" 
                                    icon={FaUserCircle} 
                                    name={asset.input_details.model.name || 'Unnamed Model'}
                                    imageUrl={asset.input_details.model.storage_url}
                                />
                            </Box>
                        )}
                        {asset.input_details.top_garment && (
                            <Box cursor="pointer" onClick={() => handleOpenInputPreview({ label: 'Top Garment', name: asset.input_details.top_garment.name, imageUrl: asset.input_details.top_garment.reference_image_url })}>
                                <InputDetailCard 
                                    label="Top Garment" 
                                    icon={FaTshirt} 
                                    name={asset.input_details.top_garment.name || 'Unnamed Garment'}
                                    imageUrl={asset.input_details.top_garment.reference_image_url}
                                />
                            </Box>
                        )}
                        {asset.input_details.bottom_garment && (
                            <Box cursor="pointer" onClick={() => handleOpenInputPreview({ label: 'Bottom Garment', name: asset.input_details.bottom_garment.name, imageUrl: asset.input_details.bottom_garment.reference_image_url })}>
                                <InputDetailCard 
                                    label="Bottom Garment" 
                                    icon={FaShoppingBag} // Example icon for bottom wear
                                    name={asset.input_details.bottom_garment.name || 'Unnamed Garment'}
                                    imageUrl={asset.input_details.bottom_garment.reference_image_url}
                                />
                            </Box>
                        )}
                        {asset.input_details.pose && (
                            <Box cursor="pointer" onClick={() => handleOpenInputPreview({ label: 'Pose', name: asset.input_details.pose.name, imageUrl: asset.input_details.pose.storage_url })}>
                                <InputDetailCard 
                                    label="Pose" 
                                    icon={FaPaintBrush} // Example icon for pose
                                    name={asset.input_details.pose.name || 'Unnamed Pose'}
                                    imageUrl={asset.input_details.pose.storage_url}
                                />
                            </Box>
                        )}
                        {asset.input_details.accessories && asset.input_details.accessories.length > 0 && (
                            asset.input_details.accessories.map(acc => (
                                <Box cursor="pointer" key={acc.id} onClick={() => handleOpenInputPreview({ label: `Accessory (${acc.category || 'Other'})`, name: acc.name, imageUrl: acc.storage_url })}>
                                    <InputDetailCard 
                                        key={acc.id} // Key should be on the mapped element
                                        label={`Accessory (${acc.category || 'Other'})`} 
                                        icon={FaBoxOpen} // Example icon for accessory
                                        name={acc.name || 'Unnamed Accessory'}
                                        imageUrl={acc.storage_url}
                                    />
                                </Box>
                            ))
                        )}
                        {asset.input_details.input_image && (
                            <Box cursor="pointer" onClick={() => handleOpenInputPreview({ label: 'Reference Image', name: asset.input_details.input_image.name || 'Uploaded Image', imageUrl: asset.input_details.input_image.storage_url })}>
                                <InputDetailCard 
                                    label="Reference Image" 
                                    icon={FaImage} 
                                    name={asset.input_details.input_image.name || 'Uploaded Image'}
                                    imageUrl={asset.input_details.input_image.storage_url}
                                />
                            </Box>
                        )}
                    </SimpleGrid>
                 ) : (
                    // Empty state when no input details are available
                    <Center minH="60px"> 
                        <Text fontSize="sm" color="gray.500">No specific inputs were recorded for this generation (e.g., Text-to-Image).</Text>
                    </Center>
                 )}
            </Box>

        </VStack>

      </Flex>

      {/* Add To Collection Modal */}
      {asset && (
        <AddToCollectionModal 
            isOpen={isAddToCollectionOpen} 
            onClose={onAddToCollectionClose} 
            styleId={asset.id} 
        />
      )}

      {/* Input Preview Modal */}
      <InputPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={onClosePreviewModal}
        inputDetails={selectedInputForPreview}
      />

      {/* Image Crop Modal */}
      {asset && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={onCropModalClose}
          imageUrl={getDisplayImageUrl()} // Pass the main display image URL
          imageName={asset.prompt ? asset.prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) + '_cropped.png' : `asset_${asset.id}_cropped.png`}
          // fixedAspect={1} // Example: for a square crop, or remove/set to undefined for freeform
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Look
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={isDeleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Lightbox Component */}
      {asset && (
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={[{ src: displayImageUrl, alt: asset.prompt || 'Generated Style' }]} // Array with one slide
          // Optional: Add more features like zoom, thumbnails if needed
          // render={{ slide: YourCustomSlideComponent }} // For advanced customization
        />
      )}

      {/* Mask Editor Modal */}
      {asset && (
        (() => {
          console.log('[AssetDetailPage] Rendering MaskEditorModal. isMaskEditorOpen:', isMaskEditorOpen, 'imageUrl:', asset.image_url);
          return (
            <MaskEditorModal
              isOpen={isMaskEditorOpen}
              onClose={onMaskEditorClose}
              imageUrl={asset.image_url} // Make sure this is the intended high-res URL
              assetName={asset.prompt ? asset.prompt.substring(0, 50) : `Asset ${asset.id}`}
              onGenerate={handleGenerateWithMask}
            />
          );
        })()
      )}
    </Container>
  );
}
