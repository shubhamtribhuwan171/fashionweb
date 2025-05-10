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
  useDisclosure
} from '@chakra-ui/react';
import { FaArrowLeft, FaTrash, FaChevronRight, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import EditAccessoryModal from '../components/Accessories/EditAccessoryModal';

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Global workspace for built-in (public) accessories
const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

// Helper to format date/time (same as before)
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOfInputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' }; 
    if (startOfInputDate.getTime() === startOfToday.getTime()) {
      return `Today ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else if (startOfInputDate.getTime() === startOfYesterday.getTime()) {
      return `Yesterday ${date.toLocaleTimeString(undefined, timeOptions)}`;
    } else {
      return date.toLocaleDateString(undefined, dateOptions);
    }
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; 
  }
};

export default function AccessoryDetailPage() {
  const { accessoryId } = useParams();
  const navigate = useNavigate();
  const [accessory, setAccessory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { setHeader } = usePageHeader();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();

  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const headingColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.500', 'gray.400');

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchAccessoryDetails = useCallback(async () => {
    setError(null);
    const config = getAuthConfig();
    if (!config) {
      setError('Authentication required.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/accessory-images/${accessoryId}`, config);
      if (response.data) {
        setAccessory(response.data);
      } else {
        throw new Error('No data received for accessory.');
      }
    } catch (err) {
      console.error("Error fetching accessory:", err);
      setError(err.response?.data?.message || 'Failed to load accessory details');
      setAccessory(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessoryId, getAuthConfig]);

  useEffect(() => {
    setIsLoading(true);
    fetchAccessoryDetails();
  }, [fetchAccessoryDetails]);

  useEffect(() => {
    const title = "Accessory Details";
    const subtitle = accessory ? `${accessory.name || 'Accessory'} (ID: ${accessory.id.substring(0,8)}...)` : "Loading accessory details...";
    setHeader(title, subtitle);
    return () => setHeader('', '');
  }, [accessory, setHeader]);

  const handleDelete = async () => {
    const config = getAuthConfig();
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this accessory image?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/accessory-images/${accessoryId}`, config);
        toast({ title: 'Accessory image deleted', status: 'success', duration: 2000 });
        navigate('/app/accessories');
      } catch (err) {
        console.error('Error deleting accessory:', err);
        const msg = err.response?.data?.message || 'Failed to delete accessory';
        toast({ title: 'Delete Failed', description: msg, status: 'error', duration: 4000 });
      }
    }
  };

  const handleSaveSuccess = () => {
    fetchAccessoryDetails();
  };

  if (isLoading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error"><AlertIcon />{error}</Alert>
        <Button mt={4} onClick={() => navigate('/app/accessories')}>Go Back to Accessories</Button>
      </Container>
    );
  }

  if (!accessory) {
    return <Center py={10}><Text>Accessory data is unavailable.</Text></Center>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex mb={6} justify="space-between" align="center">
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/app/accessories">Accessories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" isTruncated maxW="300px">{accessory.name || `Accessory ${accessory.id.substring(0,8)}...`}</BreadcrumbLink>
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
          {/* Only show delete for private accessories */}
          {accessory.workspace_id !== GLOBAL_WORKSPACE_ID && (
            <Button
              leftIcon={<FaTrash />}
              onClick={handleDelete}
              variant="outline"
              colorScheme="red"
              size="sm"
            >
              Delete
            </Button>
          )}
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
        <Box flex={{ base: 'none', md: 1 }} bg={cardBgColor} p={4} borderRadius="lg" shadow="md" overflow="hidden" maxW={{md: '400px'}}>
          <AspectRatio ratio={1}>
            <Image
              src={accessory.storage_url || 'https://via.placeholder.com/400?text=No+Image'}
              alt={accessory.name || 'Accessory Image'}
              objectFit="contain"
              borderRadius="md"
            />
          </AspectRatio>
        </Box>

        <VStack flex={2} align="stretch" spacing={5} bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
          <Heading size="lg" color={headingColor} mb={1}>{accessory.name || 'Unnamed Accessory'}</Heading>
          <Divider />

          <HStack spacing={6} align="flex-start" wrap="wrap" mt={3} justify="flex-start">
            <VStack align="start" spacing={0} minWidth="100px">
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Uploaded</Text>
              <Text fontSize="sm" color={textColor}>{formatDateTime(accessory.created_at)}</Text>
            </VStack>

            {accessory.category && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Category</Text>
                <Tag size="md" colorScheme="green" textTransform="capitalize" mt={1}>{accessory.category}</Tag>
              </VStack>
            )}
          </HStack>

          {accessory.description && (
            <VStack align="stretch" spacing={1} pt={4}>
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Description</Text>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">{accessory.description}</Text>
            </VStack>
          )}

          {accessory.tags && accessory.tags.length > 0 && (
            <VStack align="stretch" spacing={1} pt={4}>
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Tags</Text>
              <Wrap spacing={2} pt={1}>
                {accessory.tags.map((tag, index) => (
                  <WrapItem key={index}>
                    <Tag size="sm" variant="subtle" colorScheme="blue">{tag}</Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          )}

        </VStack>
      </Flex>

      {accessory && (
        <EditAccessoryModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          accessory={accessory}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </Container>
  );
} 