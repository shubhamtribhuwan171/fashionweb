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
  useColorModeValue,
  Icon,
  Tag,
  Wrap,
  WrapItem,
  useDisclosure,
  Flex,
  Spacer,
  Skeleton,
  SkeletonText,
  VStack,
  HStack
} from '@chakra-ui/react';
import { FaPlus, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import AccessoryCard from '../components/Accessories/AccessoryCard';
import UploadAccessoryModal from '../components/Accessories/UploadAccessoryModal';
import { usePageHeader } from '../components/Layout/DashboardLayout';
import StyledSelect from '../components/Common/StyledSelect';

// TODO: Move to config or central place
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Define accessory categories (match API documentation)
const ACCESSORY_CATEGORIES = ['hats', 'bags', 'jewelry', 'shoes', 'scarves', 'other'];

// Skeleton Card Component (matches AccessoryCard structure)
const SkeletonAccessoryCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="120px" /> {/* Approximate image height */} 
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function AccessoriesPage() {
  const { setHeader } = usePageHeader();
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId();
  const { isOpen: isUploadModalOpen, onOpen: onOpenUploadModal, onClose: onCloseUploadModal } = useDisclosure();
  const numSkeletons = 12; // Number of skeletons to show

  useEffect(() => {
    setHeader('Accessories', 'Manage your accessory inventory.');
    return () => setHeader('', '');
  }, [setHeader]);

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({ title: "Authentication Error", description: "Please log in.", status: "error", duration: 3000 });
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // Fetch Accessories
  const fetchAccessories = useCallback(async (category = '') => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setError("Workspace ID or Authentication missing.");
      setIsLoading(false);
      setAccessories([]);
      return;
    }

    const params = { workspaceId: currentWorkspaceId };
    if (category) {
      params.category = category;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/accessory-images`, {
        ...config,
        params
      });
      setAccessories(response.data || []);
    } catch (err) {
      console.error("Error fetching accessories:", err);
      const errorMsg = err.response?.data?.message || "Failed to load accessories";
      setError(errorMsg);
      setAccessories([]);
      toast({ title: "Error Loading Accessories", description: errorMsg, status: "error", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  // Fetch initially and when filter changes
  useEffect(() => {
    fetchAccessories(filterCategory);
  }, [fetchAccessories, filterCategory]);

  // Handle Delete
  const handleDelete = async (accessoryId) => {
    const config = getAuthConfig();
    if (!config) return;

    const originalAccessories = [...accessories];
    setAccessories(prevAccessories => prevAccessories.filter(a => a.id !== accessoryId));

    try {
      await axios.delete(`${API_BASE_URL}/api/accessory-images/${accessoryId}`, config);
      toast({ title: "Accessory Deleted", status: "info", duration: 2000 });
    } catch (err) {
      console.error("Error deleting accessory:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete accessory image";
      setError(errorMsg);
      toast({ title: "Delete Failed", description: errorMsg, status: "error", duration: 3000 });
      setAccessories(originalAccessories); // Revert UI on error
    }
  };

  // Callback for successful upload
  const handleUploadSuccess = () => {
    fetchAccessories(filterCategory);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex mb={6} align="center" wrap="wrap" justifyContent="flex-end">
        <Flex align="center" gap={4} >
          <StyledSelect
            placeholder="Filter by Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            maxWidth={{ base: "150px", md: "200px" }}
            _hover={{ borderColor: 'teal.400', boxShadow: 'md', transform: 'scale(1.02)' }}
          >
            <option value="">All Categories</option>
            {ACCESSORY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </StyledSelect>
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
            Upload Accessory
          </Button>
        </Flex>
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonAccessoryCard key={index} />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading accessories: {error}
        </Alert>
      ) : accessories.length > 0 ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {accessories.map(acc => (
            <AccessoryCard key={acc.id} accessory={acc} onDelete={handleDelete} />
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
           <Heading size="md" color="gray.500">
            {filterCategory ? `No accessories found for category: ${filterCategory}` : 'No accessories uploaded yet.'}
           </Heading>
        </Center>
      )}

      <UploadAccessoryModal
        isOpen={isUploadModalOpen}
        onClose={onCloseUploadModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </VStack>
  );
} 