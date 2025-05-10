import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Image,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  useColorModeValue,
  Flex,
  Divider,
  Center,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  AspectRatio,
  useToast,
  HStack,
  Tag,
  Wrap,
  WrapItem,
  useDisclosure,
  Spacer,
} from '@chakra-ui/react';
import { FaArrowLeft, FaPaintBrush, FaChevronRight, FaTrash, FaEdit, FaStar, FaRegStar } from 'react-icons/fa';
import axios from 'axios';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import EditGarmentModal from '../components/Garments/EditGarmentModal';

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Helper to format date/time (copied from AssetDetailPage)
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

export default function GarmentDetailPage() {
  const { garmentId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { setHeader } = usePageHeader();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();

  // Theme colors
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const headingColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  // --- Define getAuthConfig first ---
  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // --- Define fetchProductDetails after getAuthConfig ---
  const fetchProductDetails = useCallback(async () => {
    setError(null);
    const config = getAuthConfig();
    if (!config) {
      setError('Authentication required. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/${garmentId}`, config);
      if (response.data) {
           setProduct(response.data);
      } else {
          setError('Failed to load garment details: No data received.');
          setProduct(null);
      }
    } catch (err) {
      console.error("Error fetching garment:", err);
      setError(err.response?.data?.message || 'Failed to load garment details');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [garmentId, getAuthConfig]);

  useEffect(() => {
    setIsLoading(true);
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Effect to set page header
  useEffect(() => {
    const title = "Apparel Details";
    const subtitle = product ? `Item: ${product.name}` : "Loading apparel details...";
    setHeader(title, subtitle);
    return () => setHeader('', '');
  }, [product, setHeader]);

  // --- Navigate to Create Style Page ---
  const handleUseForStyle = () => {
    if (!product) return;
    navigate('/app/create', { state: { selectedGarmentId: product.id } });
  };

  // --- Delete Handler ---
  const handleDelete = async () => {
    const config = getAuthConfig();
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this garment?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/products/${garmentId}`, config);
        toast({ title: 'Garment deleted', status: 'success', duration: 2000 });
        navigate('/app/products');
      } catch (err) {
        console.error('Error deleting garment:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to delete garment';
        toast({ title: 'Delete Failed', description: msg, status: 'error', duration: 4000 });
      }
    }
  };

  // --- Callback for successful save from Edit Modal ---
  const handleSaveSuccess = () => {
    fetchProductDetails(); // Refetch after editing
  };

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
        <Button mt={4} onClick={() => navigate('/app/products')}>Go Back to Garments</Button>
      </Container>
    );
  }

  if (!product) {
    // Should be caught by error state, but as a fallback
    return <Center py={10}><Text>Garment data is unavailable.</Text></Center>;
  }

  console.log('Garment State before render:', product); // Log state before render

  return (
    <Container maxW="container.xl" py={8}>
        {/* Breadcrumbs & Action Buttons */}
        <Flex mb={6} justify="space-between" align="center">
            <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
                <BreadcrumbItem>
                  <BreadcrumbLink as={RouterLink} to="/app/products">Virtual Closet</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href="#" isTruncated maxW="300px">{product.name || 'Apparel Detail'}</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>
            <HStack spacing={2}>
              <Button
                leftIcon={<FaEdit />}
                onClick={onOpenEditModal}
                variant="outline"
                colorScheme="blue"
                size="sm"
              >
                Edit
              </Button>
              <Button
                leftIcon={<FaTrash />}
                onClick={handleDelete}
                variant="outline"
                colorScheme="red"
                size="sm"
              >
                Delete
              </Button>
              <Button
                leftIcon={<FaArrowLeft />}
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
              >
                Back
              </Button>
            </HStack>
        </Flex>

      <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
        {/* Left Side: Image */}
        <Box flex={{ base: 'none', md: 1 }} bg={cardBgColor} p={4} borderRadius="lg" shadow="md" overflow="hidden" maxW={{md: '400px'}}>
          <AspectRatio ratio={1}>
            <Box>
              <Image
                src={product.reference_image_url || 'https://via.placeholder.com/400?text=No+Image'}
                alt={product.name}
                objectFit="contain"
                borderRadius="md"
              />
            </Box>
          </AspectRatio>
        </Box>

        {/* Right Side: Details & Actions */}
        <VStack flex={2} align="stretch" spacing={5} bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
          <Flex justify="space-between" align="center" mb={1}>
            <Heading size="lg" color={headingColor}>{product.name}</Heading>
            <Icon 
              as={product.is_favorite ? FaStar : FaRegStar} 
              color={product.is_favorite ? "yellow.400" : "gray.400"} 
              boxSize={5}
              title={product.is_favorite ? "Favorite" : "Not Favorite"}
            />
          </Flex>
          <Divider />

          {/* Label-Above-Value Layout */}
          <HStack spacing={6} align="flex-start" wrap="wrap" mt={3} justify="flex-start">
            <VStack align="start" spacing={0} minWidth="100px">
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Added</Text>
              <Text fontSize="sm" color={textColor}>{formatDateTime(product.created_at)}</Text>
            </VStack>

            {product.garment_type && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Type</Text>
                <Tag size="md" colorScheme={product.garment_type === 'top' ? 'teal' : product.garment_type === 'bottom' ? 'blue' : 'gray'} textTransform="capitalize" mt={1}>
                    {product.garment_type}
                </Tag>
              </VStack>
            )}
          </HStack>

          {/* Description */}
          {product.description && (
            <VStack align="stretch" spacing={1} pt={4}>
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Description</Text>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">{product.description}</Text>
            </VStack>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <VStack align="stretch" spacing={1} pt={4}>
               <Text fontSize="xs" fontWeight="medium" color={labelColor}>Tags</Text>
               <Wrap spacing={2} pt={1}>
                 {product.tags.map((tag, index) => (
                   <WrapItem key={index}>
                     <Tag size="sm" variant="subtle" colorScheme="blue">{tag}</Tag>
                   </WrapItem>
                 ))}
               </Wrap>
            </VStack>
          )}
          
          {/* Add spacer to push button to bottom */}
          <Spacer />

          {/* Action Button - Use for Style */}
           <Button
              leftIcon={<FaPaintBrush />}
              onClick={handleUseForStyle}
              bgGradient="linear(to-r, teal.400, purple.500, blue.500)"
              color="white"
              size="lg"
              mt={6}
              fontWeight="semibold"
              _hover={{
                bgGradient: "linear(to-r, teal.500, purple.600, blue.600)",
                boxShadow: "lg",
              }}
           > 
                Use for Styling
            </Button>

        </VStack>
      </Flex>

      {/* Render Edit Modal */}
      {product && (
          <EditGarmentModal
              isOpen={isEditModalOpen}
              onClose={onCloseEditModal}
              garment={product}
              onSaveSuccess={handleSaveSuccess}
          />
      )}
    </Container>
  );
} 