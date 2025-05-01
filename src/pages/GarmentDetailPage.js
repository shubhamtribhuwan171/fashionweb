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
} from '@chakra-ui/react';
import { FaArrowLeft, FaPaintBrush, FaChevronRight } from 'react-icons/fa';
// Corrected relative import path
import { getMockProductById } from '../data/mockData'; 

export default function GarmentDetailPage() {
  const { garmentId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme colors
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Use useCallback for the fetch function
  const fetchProductDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMockProductById(garmentId);
      if (data) {
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [garmentId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleUseForStyle = () => {
    if (!product) return;
    console.log('Navigating to create style with garment:', product.id);
    // Navigate to the create style page using the correct path
    navigate('/app/create-style', { state: { preselectedGarmentId: product.id } });
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

  return (
    <Container maxW="container.xl" py={8}>
        {/* Breadcrumbs & Back Button */}
        <Flex mb={6} justify="space-between" align="center">
            <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
                <BreadcrumbItem>
                  {/* Link back to the correct products list page */}
                  <BreadcrumbLink as={RouterLink} to="/app/products">Base Garments</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href="#" isTruncated maxW="300px">{product.name || 'Details'}</BreadcrumbLink>
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
            <Image
              // Use reference_image_url from API/mock data
              src={product.reference_image_url || 'https://via.placeholder.com/400?text=No+Image'}
              alt={product.name}
              objectFit="contain" // Use contain to see the whole image
              borderRadius="md"
            />
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
            colorScheme="blue" 
            leftIcon={<FaPaintBrush />} 
            onClick={handleUseForStyle}
            mt={4}
            size="lg"
          >
            Visualize with this Garment
          </Button>
        </VStack>
      </Flex>
    </Container>
  );
} 