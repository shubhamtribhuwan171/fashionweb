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
  HStack,
  Card,
  CardBody,
  Image,
  Stack,
  CardFooter,
  Link as ChakraLink,
  useColorModeValue,
  AspectRatio,
  Text,
  Wrap,
  WrapItem,
  Tag,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import ModelCard from '../components/Models/ModelCard';
import UploadModelModal from '../components/Models/UploadModelModal';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Global workspace for built-in (public) models
const GLOBAL_WORKSPACE_ID = '11111111-2222-3333-4444-555555555555';

// Skeleton Card Component (matches ModelCard structure)
const SkeletonModelCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="150px" /> {/* Approximate image height */} 
    <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function ModelsPage() {
  const { setHeader } = usePageHeader();
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId(); // Use placeholder
  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();
  const navigate = useNavigate();

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
      // Fetch both private (personal) and public (global) models
      const [privateRes, publicRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/model-images`, {
          ...config,
          params: { workspaceId: currentWorkspaceId }
        }),
        axios.get(`${API_BASE_URL}/api/model-images`, {
          ...config,
          params: { workspaceId: GLOBAL_WORKSPACE_ID }
        })
      ]);
      const privateModels = privateRes.data || [];
      const publicModels = publicRes.data || [];
      // Tag each model with visibility
      const combined = [
        ...privateModels.map(m => ({ ...m, visibility: 'private' })),
        ...publicModels.map(m => ({ ...m, visibility: 'public' }))
      ];
      setModels(combined);
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

  // Filter models based on the selected tab
  const filteredModels = models.filter(model => {
    if (tabIndex === 1) return model.visibility === 'public';
    if (tabIndex === 2) return model.visibility === 'private';
    return true; // tabIndex === 0 (All)
  });

  return (
    <VStack spacing={6} align="stretch">
      <Flex mb={0} align="center" justifyContent="space-between">
        {/* Tabs for filtering */}
        <Tabs onChange={(index) => setTabIndex(index)} variant="soft-rounded" colorScheme="purple">
          <TabList>
            <Tab>All</Tab>
            <Tab>Public</Tab>
            <Tab>Private</Tab>
          </TabList>
        </Tabs>

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
      ) : filteredModels.length > 0 ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {filteredModels.map(model => (
            <RouterLink key={model.id} to={`/app/models/${model.id}`} style={{ textDecoration: 'none' }}>
              <Card 
                bg={cardBg}
                shadow="md" 
                borderRadius="lg" 
                overflow="hidden" 
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
              >
                <CardBody p={0}>
                  <AspectRatio ratio={1}>
                    <Image
                      src={model.thumbnail_url || model.storage_url || 'https://via.placeholder.com/150?text=No+Model'}
                      alt={model.name || 'Model'}
                      objectFit="cover"
                      objectPosition="top"
                      fallbackSrc="https://via.placeholder.com/150?text=Loading..."
                    />
                  </AspectRatio>
                  <Stack mt='2' p={3} spacing='1'>
                    <Heading size='xs' noOfLines={1}>{model.name || 'Unnamed Model'}</Heading>
                    <Wrap spacing={2} mt={1}>
                      {model.gender && (
                        <WrapItem>
                          <Tag size="sm" variant="subtle" colorScheme="blue">{model.gender}</Tag>
                        </WrapItem>
                      )}
                      {model.skin_tone && (
                        <WrapItem>
                          <Tag size="sm" variant="subtle" colorScheme="orange">{model.skin_tone}</Tag>
                        </WrapItem>
                      )}
                      {/* Visibility tag: Public vs Private */}
                      <WrapItem>
                        <Tag size="sm" variant="subtle" colorScheme={model.visibility === 'public' ? 'blue' : 'green'}>
                          {model.visibility === 'public' ? 'Public' : 'Private'}
                        </Tag>
                      </WrapItem>
                    </Wrap>
                  </Stack>
                </CardBody>
              </Card>
            </RouterLink>
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
           <Heading size="md" color="gray.500">
             {tabIndex === 0 && "No models found."}
             {tabIndex === 1 && "No public models found."}
             {tabIndex === 2 && "No private models found."}
           </Heading>
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