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
import EditPoseModal from '../components/Poses/EditPoseModal';

const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Global workspace for built-in (public) poses
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

// Helper component for displaying details (can reuse from ModelDetailPage)
const DetailItem = ({ label, value, textColor }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <HStack justify="space-between" align="start">
      <Text fontSize="sm" color={textColor} fontWeight="medium" flexShrink={0} mr={2}>{label}:</Text>
      <Text fontSize="sm" color={textColor} textAlign="right">{value}</Text>
    </HStack>
  );
};

export default function PoseDetailPage() {
  const { poseId } = useParams();
  const navigate = useNavigate();
  const [pose, setPose] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { setHeader } = usePageHeader();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();

  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.800', 'white');

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchPoseDetails = useCallback(async () => {
    setError(null);
    const config = getAuthConfig();
    if (!config) {
      setError('Authentication required.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/poses/${poseId}`, config);
      if (response.data) {
        setPose(response.data);
      } else {
        throw new Error('No data received for pose.');
      }
    } catch (err) {
      console.error("Error fetching pose:", err);
      setError(err.response?.data?.message || 'Failed to load pose details');
      setPose(null);
    } finally {
      setIsLoading(false);
    }
  }, [poseId, getAuthConfig]);

  useEffect(() => {
    setIsLoading(true);
    fetchPoseDetails();
  }, [fetchPoseDetails]);

  useEffect(() => {
    const title = "Pose Details";
    const subtitle = pose ? `${pose.name || 'Pose'} (ID: ${pose.id.substring(0,8)}...)` : "Loading pose details...";
    setHeader(title, subtitle);
    return () => setHeader('', '');
  }, [pose, setHeader]);

  const handleDelete = async () => {
    const config = getAuthConfig();
    if (!config) return;
    if (window.confirm('Are you sure you want to delete this pose image?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/poses/${poseId}`, config);
        toast({ title: 'Pose image deleted', status: 'success', duration: 2000 });
        navigate('/app/poses');
      } catch (err) {
        console.error('Error deleting pose:', err);
        const msg = err.response?.data?.message || 'Failed to delete pose';
        toast({ title: 'Delete Failed', description: msg, status: 'error', duration: 4000 });
      }
    }
  };

  const handleSaveSuccess = () => {
    fetchPoseDetails();
  };

  if (isLoading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return (
      <Container centerContent py={10}>
        <Alert status="error"><AlertIcon />{error}</Alert>
        <Button mt={4} onClick={() => navigate('/app/poses')}>Go Back to Poses</Button>
      </Container>
    );
  }

  if (!pose) {
    return <Center py={10}><Text>Pose data is unavailable.</Text></Center>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex mb={6} justify="space-between" align="center">
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/app/poses">Poses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" isTruncated maxW="300px">{pose.name || `Pose ${pose.id.substring(0,8)}...`}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <HStack spacing={2}>
          {/* Only show Edit/Delete for private poses */}
          {pose.workspace_id !== GLOBAL_WORKSPACE_ID && (
            <>
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
        <Box flex={{ base: 'none', md: 1 }} bg={cardBgColor} p={4} borderRadius="lg" shadow="md" overflow="hidden" maxW={{md: '400px'}}>
          <Image
            src={pose.storage_url || 'https://via.placeholder.com/400?text=No+Image'}
            alt={`Pose ${pose.id}`}
            objectFit="contain" 
            borderRadius="md"
            maxW="100%"
            h="auto"
          />
        </Box>

        <VStack flex={2} align="stretch" spacing={4} bg={cardBgColor} p={6} borderRadius="lg" shadow="md">
          <Heading size="lg" color={headingColor} mb={2}>{pose.name || `Pose ID: ${pose.id}`}</Heading>
          <Divider mb={2} />

          <DetailItem label="Uploaded" value={formatDateTime(pose.created_at)} textColor={textColor} />

          {pose.description && (
            <VStack align="stretch" spacing={1} pt={2}>
              <Text fontSize="sm" color={textColor} fontWeight="medium">Description:</Text>
              <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">{pose.description}</Text>
            </VStack>
          )}

          {(() => {
            const tagsArray = getTagsArray(pose.tags);
            return tagsArray.length > 0 && (
              <VStack align="stretch" spacing={1} pt={2}>
                <Text fontSize="sm" color={textColor} fontWeight="medium">Tags:</Text>
                <Wrap spacing={2}>
                  {tagsArray.map((tag, index) => (
                    <WrapItem key={index}>
                      <Tag size="sm" variant="subtle" colorScheme="purple">{tag}</Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </VStack>
            );
          })()}

        </VStack>
      </Flex>

      {pose && (
        <EditPoseModal
          isOpen={isEditModalOpen}
          onClose={onCloseEditModal}
          pose={pose}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </Container>
  );
}

// Helper function to safely get tags as an array
const getTagsArray = (tags) => {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse tags string:", e);
      // Optionally return the string itself as a single tag
      // return [tags]; 
    }
  }
  return []; // Return empty array if not an array or parseable string
}; 