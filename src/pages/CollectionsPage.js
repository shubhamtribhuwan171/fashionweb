import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Spinner,
  Center,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  Spacer,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import axios from 'axios';
import CollectionCard from '../components/Collections/CollectionCard';
import CreateCollectionModal from '../components/Modals/CreateCollectionModal';
import { FaPlus } from 'react-icons/fa';
import { usePageHeader } from '../components/Layout/DashboardLayout';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Added missing function
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Skeleton Card Component (matches CollectionCard structure)
const SkeletonCollectionCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="180px" /> {/* Approximate image height */} 
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function CollectionsPage() {
  const { setHeader } = usePageHeader();
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const toast = useToast();
  const [error, setError] = useState(null);
  const currentWorkspaceId = getMockWorkspaceId(); // Placeholder
  const numSkeletons = 8; // Number of skeletons

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        setError("Authentication token not found.");
        return null;
    }
    setError(null);
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchCollections = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!config) {
      setIsLoading(false);
      setCollections([]);
      return; 
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/collections`, config);
      setCollections(response.data || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
      const errorMsg = err.response?.data?.message || "Failed to load collections";
      setError(errorMsg);
      setCollections([]);
      toast({ title: "Failed to load collections", description: errorMsg, status: "error", duration: 3000});
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [getAuthConfig, toast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    setHeader('My Collections', 'Organize your favorite generated looks.');
    return () => setHeader('', '');
  }, [setHeader]);

  const handleCreateCollection = async (collectionData) => {
    const config = getAuthConfig();
    if (!config) {
        return Promise.reject(new Error("Authentication required."));
    }
    if (!collectionData?.name?.trim()) {
        toast({ title: "Collection name cannot be empty", status: "warning"});
        return Promise.reject(new Error("Collection name required."));
    }

    return new Promise(async (resolve, reject) => {
      try {
        console.log("API: Creating collection:", collectionData);
        const payload = { name: collectionData.name.trim(), is_public: collectionData.is_public || false };
        const response = await axios.post(`${API_BASE_URL}/api/collections`, payload, config);
        
        toast({ title: "Collection created!", status: "success", duration: 2000 });
        await fetchCollections(false);
        resolve(response.data);
      } catch (err) {
        console.error("Failed to create collection:", err);
        const errorMsg = err.response?.data?.message || "Could not create collection.";
        toast({ title: "Creation Failed", description: errorMsg, status: "error", duration: 4000 });
        reject(new Error(errorMsg));
      }
    });
  };

  const handleDeleteCollection = async (collectionId) => {
    const config = getAuthConfig();
    if (!config || !collectionId) {
      toast({ title: "Cannot delete", description: "Auth or Collection ID missing.", status: "error" });
      return;
    }

    if (window.confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
        try {
            console.log(`API: Deleting collection ${collectionId}`);
            await axios.delete(`${API_BASE_URL}/api/collections/${collectionId}`, config);
            toast({ title: "Collection deleted", status: "success", duration: 2000 });
            setCollections(prev => prev.filter(c => c.id !== collectionId));
        } catch (err) {
            console.error("Failed to delete collection:", err);
            const errorMsg = err.response?.data?.message || "Could not delete collection.";
             toast({ title: "Deletion Failed", description: errorMsg, status: "error", duration: 4000 });
        }
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex mb={6} align="center" justifyContent="flex-end">
        <Button 
          leftIcon={<FaPlus />} 
          onClick={onCreateOpen}
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
          New Collection
        </Button>
      </Flex>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonCollectionCard key={index} />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      ) : collections.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {collections.map((collection) => (
            <CollectionCard 
              key={collection.id} 
              collection={collection} 
              onDelete={() => handleDeleteCollection(collection.id)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
           <Heading size="md" color="gray.500">
             You haven't created any collections yet.
           </Heading>
        </Center>
      )}

      <CreateCollectionModal 
        isOpen={isCreateOpen} 
        onClose={onCreateClose} 
        onCreateCollection={handleCreateCollection} 
      />
    </VStack>
  );
}