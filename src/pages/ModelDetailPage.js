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
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FaArrowLeft, FaTrash, FaChevronRight, FaUserCircle, FaEdit } from 'react-icons/fa';
import axios from 'axios'; 
import { usePageHeader } from '../components/Layout/DashboardLayout';
import EditModelModal from '../components/Models/EditModelModal';

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';
const currentWorkspaceId = getMockWorkspaceId();

// Helper to format date/time
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

// <<< Helper component for displaying details
const DetailItem = ({ label, value, textColor }) => {
  if (!value) return null;
  return (
    <HStack justify="space-between" align="start">
      <Text fontSize="sm" color={textColor} fontWeight="medium" flexShrink={0} mr={2}>{label}:</Text>
      <Text fontSize="sm" color={textColor} textAlign="right">{value}</Text>
    </HStack>
  );
};

export default function ModelDetailPage() {
  const { modelId } = useParams(); // Changed from garmentId
  const navigate = useNavigate();
  const [model, setModel] = useState(null); // Changed from product
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { setHeader } = usePageHeader();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const { isOpen: isPreviewModalOpen, onOpen: onOpenPreviewModal, onClose: onClosePreviewModal } = useDisclosure();

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

  const fetchModelDetails = useCallback(async () => {
    setError(null);
    const config = getAuthConfig();
    if (!config) {
      setError('Authentication required.');
      setIsLoading(false);
      return;
    }
    try {
      // Updated endpoint
      const response = await axios.get(`${API_BASE_URL}/api/model-images/${modelId}`, config);
      if (response.data) {
        setModel(response.data);
      } else {
        throw new Error('No data received for model.');
      }
    } catch (err) {
      console.error("Error fetching model:", err);
      setError(err.response?.data?.message || 'Failed to load model details');
      setModel(null);
    } finally {
      setIsLoading(false);
    }
  }, [modelId, getAuthConfig]);

  useEffect(() => {
    setIsLoading(true);
    fetchModelDetails();
  }, [fetchModelDetails]);

  useEffect(() => {
    const title = "Model Details";
    const subtitle = model ? `${model.name || 'Model'} (ID: ${model.id.substring(0,8)}...)` : "Loading model details...";
    setHeader(title, subtitle);
    return () => setHeader('', '');
  }, [model, setHeader]);

  const handleDelete = async () => {
    const config = getAuthConfig();
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this model image?')) {
      try {
        // Updated endpoint
        await axios.delete(`${API_BASE_URL}/api/model-images/${modelId}`, config);
        toast({ title: 'Model image deleted', status: 'success', duration: 2000 });
        navigate('/app/models'); // Navigate back to models list
      } catch (err) {
        console.error('Error deleting model:', err);
        const msg = err.response?.data?.message || 'Failed to delete model';
        toast({ title: 'Delete Failed', description: msg, status: 'error', duration: 4000 });
      }
    }
  };

  const handleSaveSuccess = () => {
    fetchModelDetails();
  };

  if (isLoading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error"><AlertIcon />{error}</Alert>
        <Button mt={4} onClick={() => navigate('/app/models')}>Go Back to Models</Button>
      </Container>
    );
  }

  if (!model) {
    return <Center py={10}><Text>Model data is unavailable.</Text></Center>;
  }

  // Determine if this model belongs to the current workspace
  const modelWorkspaceId = model.workspace_id ?? model.workspaceId;
  const isEditable = modelWorkspaceId === currentWorkspaceId;

  return (
    <Container maxW="container.xl" py={8}>
      <Flex mb={6} justify="space-between" align="center">
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/app/models">Models</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" isTruncated maxW="300px">{model.name || `Model ${model.id.substring(0,8)}...`}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <HStack spacing={2}>
          {/* Only show Edit/Delete when the model is in the current workspace */}
          {isEditable && (
            <>
              <Button
                leftIcon={<FaEdit />}
                onClick={onOpenEditModal}
                variant="outline"
                colorScheme="blue"
                size="sm"
              >Edit</Button>
              <Button
                leftIcon={<FaTrash />}
                onClick={handleDelete}
                variant="outline"
                colorScheme="red"
                size="sm"
              >Delete</Button>
            </>
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
        {/* Image */}
        <Box 
          flex={{ base: 'none', md: 1 }} 
          bg={cardBgColor} 
          p={4} 
          borderRadius="lg" 
          shadow="md" 
          maxW={{md: '400px'}}
          alignSelf="flex-start"
          cursor="pointer"
          onClick={onOpenPreviewModal}
          title="Click to enlarge image"
        >
          <Image
            src={model.storage_url || 'https://via.placeholder.com/400?text=No+Image'}
            alt={model.name || 'Model Image'}
            objectFit="contain"
            borderRadius="md"
            width="100%"
          />
        </Box>

        {/* Details */}
        <VStack flex={2} align="stretch" spacing={5} bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
          <Heading size="lg" color={headingColor} mb={1}>{model.name || `Model ID: ${model.id}`}</Heading>
          <Divider />

          <HStack spacing={6} align="flex-start" wrap="wrap" mt={3} justify="flex-start">
            <VStack align="start" spacing={0} minWidth="100px">
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Uploaded</Text>
              <Text fontSize="sm" color={textColor}>{formatDateTime(model.created_at)}</Text>
            </VStack>

            {model.gender && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Gender</Text>
                <Text fontSize="sm" color={textColor}>{model.gender}</Text>
              </VStack>
            )}

            {model.body_type && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Body Type</Text>
                <Text fontSize="sm" color={textColor}>{model.body_type}</Text>
              </VStack>
            )}

            {model.hair && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Hair</Text>
                <Text fontSize="sm" color={textColor}>{model.hair}</Text>
              </VStack>
            )}

            {model.skin_tone && (
              <VStack align="start" spacing={0} minWidth="100px">
                <Text fontSize="xs" fontWeight="medium" color={labelColor}>Skin Tone</Text>
                <Text fontSize="sm" color={textColor}>{model.skin_tone}</Text>
              </VStack>
            )}
          </HStack>

          {model.description && (
            <VStack align="stretch" spacing={1} pt={4}>
              <Text fontSize="xs" fontWeight="medium" color={labelColor}>Description</Text>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">{model.description}</Text>
            </VStack>
          )}

          {model.tags && model.tags.length > 0 && (
            <VStack align="stretch" spacing={1} pt={4}>
               <Text fontSize="xs" fontWeight="medium" color={labelColor}>Tags</Text>
               <Wrap spacing={2} pt={1}>
                 {model.tags.map((tag, index) => (
                   <WrapItem key={index}>
                     <Tag size="sm" variant="subtle" colorScheme="blue">{tag}</Tag>
                   </WrapItem>
                 ))}
               </Wrap>
            </VStack>
          )}
        </VStack>
      </Flex>

      {model && (
        <EditModelModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          model={model}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      <Modal isOpen={isPreviewModalOpen} onClose={onClosePreviewModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            <Image
              src={model.storage_url || 'https://via.placeholder.com/800?text=No+Image'}
              alt={model.name || 'Model Image Preview'}
              objectFit="contain"
              width="100%"
              maxH="85vh"
              borderRadius="md"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 