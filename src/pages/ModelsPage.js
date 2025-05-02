import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Center,
  useDisclosure,
  Flex,
  Spacer,
  Skeleton,
  SkeletonText,
  VStack,
  HStack
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import ModelCard from '../components/Models/ModelCard';
import UploadModelModal from '../components/Models/UploadModelModal';
import { usePageHeader } from '../components/Layout/DashboardLayout';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Skeleton Card Component (matches ModelCard structure)
const SkeletonModelCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="150px" /> {/* Approximate image height */} 
    <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function ModelsPage() {
  const { setHeader } = usePageHeader();
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId(); // Use placeholder
  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // Fetch Models
  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setError("Workspace ID or Authentication missing.");
      setIsLoading(false);
      setModels([]);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/model-images`, {
        ...config,
        params: { workspaceId: currentWorkspaceId }
      });
      setModels(response.data || []);
    } catch (err) {
      console.error("Error fetching models:", err);
      const errorMsg = err.response?.data?.message || "Failed to load models";
      setError(errorMsg);
      setModels([]);
      toast({ title: "Error Loading Models", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  useEffect(() => {
    setHeader('Models', 'Manage your model inventory.');
    fetchModels();
    return () => setHeader('', '');
  }, [setHeader, fetchModels]);

  // Handle Delete
  const handleDelete = async (modelId) => {
    const config = getAuthConfig();
    if (!config) return;

    // Optimistic UI update
    const originalModels = [...models];
    setModels(prevModels => prevModels.filter(m => m.id !== modelId));

    try {
      await axios.delete(`${API_BASE_URL}/api/model-images/${modelId}`, config);
      toast({ title: "Model Deleted", status: "info", duration: 2000 });
      // Refreshing might be safer than relying solely on optimistic update, but depends on UX choice
      // fetchModels(); 
    } catch (err) {
      console.error("Error deleting model:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete model image";
      setError(errorMsg);
      toast({ title: "Delete Failed", description: errorMsg, status: "error", duration: 3000 });
      setModels(originalModels); // Revert UI on error
    }
  };

  // Callback for successful upload
  const handleUploadSuccess = () => {
    fetchModels(); // Refresh the list
  };

  const numSkeletons = 12; // Number of skeletons to show

  return (
    <VStack spacing={6} align="stretch">
      <Flex mb={6} align="center" justifyContent="flex-end">
        <Button 
          leftIcon={<FaPlus />} 
          onClick={onOpenUploadModal}
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
          Upload Model
        </Button>
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonModelCard key={index} />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading models: {error}
        </Alert>
      ) : models.length > 0 ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {models.map(model => (
            <ModelCard key={model.id} model={model} onDelete={handleDelete} />
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
           <Heading size="md" color="gray.500">No models uploaded yet.</Heading>
        </Center>
      )}

      <UploadModelModal 
        isOpen={isUploadModalOpen} 
        onClose={onCloseUploadModal} 
        onUploadSuccess={handleUploadSuccess} 
      />
    </VStack>
  );
} 