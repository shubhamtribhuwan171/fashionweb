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
} from '@chakra-ui/react';
import { FaArrowLeft, FaPaintBrush, FaChevronRight } from 'react-icons/fa';
// Corrected relative import path
import { getMockProductById } from '../data/mockData'; 
import axios from 'axios'; 

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

export default function GarmentDetailPage() {
  const { garmentId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Theme colors
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

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
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig(); // Now defined
    if (!config) {
      setError('Authentication required. Please log in.');
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Fetching garment details for ID: ${garmentId}`); // Log Start
      const response = await axios.get(`${API_BASE_URL}/api/products/${garmentId}`, config);
      
      // --- Add Logging Here --- 
      console.log('>>> API Response Data:', response.data);
      // Check if response.data is null or undefined before setting state
      if (response.data) {
           console.log('Setting garment state with received data.');
           setProduct(response.data);
      } else {
          console.error('API returned null or undefined data for garment.');
          setError('Failed to load garment details: No data received.');
          setProduct(null); // Ensure garment state is null if data is bad
      }
      // --- End Logging ---

    } catch (err) {
      console.error("Error fetching garment:", err);
      setError(err.response?.data?.message || 'Failed to load garment details');
      setProduct(null); // Ensure garment state is null on error
    } finally {
      setIsLoading(false);
    }
  }, [garmentId, getAuthConfig]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleUseForStyle = () => {
    if (!product) return;
    console.log('Navigating to create style with garment:', product.id);
    // Navigate to the create style page using the correct path and state key
    navigate('/app/create', { state: { selectedGarmentId: product.id } });
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
        {/* Navigate back to the correct products list page */}
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
        {/* Breadcrumbs & Back Button */}
        <Flex mb={6} justify="space-between" align="center">
            <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
                <BreadcrumbItem>
                  {/* Link back to the Virtual Closet */}
                  <BreadcrumbLink as={RouterLink} to="/app/products">Virtual Closet</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  {/* Refer to it as Apparel Detail maybe? Or keep Name */}
                  <BreadcrumbLink href="#" isTruncated maxW="300px">{product.name || 'Apparel Detail'}</BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>
             <Button 
                leftIcon={<FaArrowLeft />} 
                onClick={() => navigate(-1)} // Go back in history
                variant="ghost"
                size="sm"
            >
                Back
            </Button>
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
          <Heading size="xl" color={headingColor} mb={2}>{product.name}</Heading>
          <Divider />

          <VStack align="stretch" spacing={3} flexGrow={1}> 
            {/* Using Text instead of Heading for Description based on API */}
            <Text fontWeight="bold">Description</Text>
            <Text fontSize="md" color={textColor}>{(product.description || 'No description available.')}</Text>
            {/* Add other details from mock/API like created_at */} 
            <Text fontSize="sm" color={textColor} mt={4}>Added: {new Date(product.created_at).toLocaleDateString()}</Text>
          </VStack>

          <Divider />

          {/* Action Buttons */}
          <Button 
            leftIcon={<FaPaintBrush />} 
            onClick={handleUseForStyle}
            mt={4}
            size="lg"
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
            Visualize with this Apparel
          </Button>
        </VStack>
      </Flex>
    </Container>
  );
} 