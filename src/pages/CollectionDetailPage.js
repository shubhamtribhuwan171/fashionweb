import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
  Button,
  HStack,
  Icon,
  useDisclosure,
  Center,
  useToast,
  Flex,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import StyleCard from '../components/Styles/StyleCard';
import RenameCollectionModal from '../components/Modals/RenameCollectionModal';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Skeleton Card Component (matches StyleCard structure)
const SkeletonStyleCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="200px" /> {/* Adjust height based on StyleCard image */}
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function CollectionDetailPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [collection, setCollection] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const numSkeletons = 8;

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchCollectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!config) {
        setIsLoading(false);
        return;
    }

    try {
      // --- Real API Call --- 
      const response = await axios.get(`${API_BASE_URL}/api/collections/${collectionId}`, config);
      setCollection(response.data);
      setAssets(response.data.assets || []);
    } catch (err) {
      console.error("Error fetching collection details:", err);
      const errorMsg = err.response?.data?.message || 'Failed to load collection';
      setError(errorMsg);
      toast({ title: "Error Loading Collection", description: errorMsg, status: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, getAuthConfig]);

  useEffect(() => {
    fetchCollectionDetails();
  }, [fetchCollectionDetails]);

  // --- Rename Handler (will call modal's API function) --- 
  const handleRenameSave = async (id, updatedData) => {
    // This function is called by RenameCollectionModal after its successful API call
    // We just need to update the state here
    console.log("Updating collection state after successful rename:", updatedData);
    setCollection(prev => prev ? { ...prev, ...updatedData } : null);
    // Optionally, could refetch: fetchCollectionDetails();
    return Promise.resolve(); // Signal success back to modal
  };

  // --- Delete Collection Handler --- 
  const handleDeleteCollection = async () => {
    const config = getAuthConfig();
    if (!config) return;
    
    if (window.confirm("Are you sure you want to delete this collection?")) {
        setIsDeleting(true);
        try {
            // --- Real API Call --- 
            await axios.delete(`${API_BASE_URL}/api/collections/${collectionId}`, config);
            toast({ title: "Collection deleted", status: "success", duration: 2000 });
            navigate('/app/collections', { replace: true });
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMsg = error.response?.data?.message || "Failed to delete collection";
            toast({ title: "Failed to delete collection", description: errorMsg, status: "error", duration: 3000 });
            setIsDeleting(false);
        }
        // No finally needed as we navigate away on success
    }
  };

  // --- Remove Asset from Collection Handler --- 
  const handleRemoveAsset = async (assetIdToRemove) => {
    const config = getAuthConfig();
    if (!config || !collectionId || !assetIdToRemove) {
      toast({ title: "Cannot remove item", description: "Missing auth or IDs.", status: "error" });
      return;
    }

    // Optional confirmation
    // if (!window.confirm('Are you sure you want to remove this item from the collection?')) return;

    try {
      console.log(`API: Removing asset ${assetIdToRemove} from collection ${collectionId}`);
      // --- Real API Call --- 
      await axios.delete(`${API_BASE_URL}/api/collections/${collectionId}/items/${assetIdToRemove}`, config);
      
      // Update state locally for immediate feedback
      setAssets(prev => prev.filter(asset => asset.id !== assetIdToRemove));
      toast({ title: "Item removed", status: "success", duration: 1500 });

    } catch (error) {
      console.error("Failed to remove item from collection:", error);
      const errorMsg = error.response?.data?.message || "Could not remove item.";
      toast({ title: "Removal Failed", description: errorMsg, status: "error", duration: 3000 });
    }
  };

  if (isLoading) {
    return <Center py={10}><Spinner size="xl" /></Center>;
  }

  if (error) {
    return (
      <Center py={10}>
        <VStack>
          <Alert status="error">
            <AlertIcon />
            Error loading collection: {error}
          </Alert>
          <Button mt={4} onClick={() => navigate('/app/collections')} leftIcon={<FaArrowLeft />}>
            Back to Collections
          </Button>
        </VStack>
      </Center>
    );
  }

  if (!collection) {
    return <Center py={10}><Text>Collection not found.</Text></Center>;
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Breadcrumb spacing="8px" separator={<Icon as={FaChevronRight} color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/app/collections">Collections</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#" isTruncated maxW="300px">{collection.name || 'Details'}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Button
          leftIcon={<FaArrowLeft />}
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
        >
          Back
        </Button>
      </Flex>

      <HStack justifyContent="space-between">
        <VStack align="start">
          <Heading size="lg">{collection.name}</Heading>
          <Text color="gray.500" fontSize="sm">{assets.length} item(s) {collection.is_public ? '(Public)' : '(Private)'}</Text>
        </VStack>
        <HStack>
          <Button leftIcon={<FaPencilAlt />} onClick={onRenameOpen} variant="outline" size="sm" isLoading={isDeleting}>
            Edit
          </Button>
          <Button
            leftIcon={<FaTrashAlt />}
            size="sm"
            onClick={handleDeleteCollection}
            isLoading={isDeleting}
            loadingText="Deleting..."
            bgGradient="linear(to-r, red.500, orange.500)"
            color="white"
            fontWeight="semibold"
            _hover={{
              bgGradient: "linear(to-r, red.600, orange.600)",
              boxShadow: "lg",
              transform: "translateY(-3px) scale(1.03)",
            }}
            _active={{
              bgGradient: "linear(to-r, red.700, orange.700)",
              transform: "translateY(-1px) scale(1.00)"
            }}
            boxShadow="md"
            transition="all 0.25s cubic-bezier(.08,.52,.52,1)"
            borderRadius="md"
          >
            Delete
          </Button>
        </HStack>
      </HStack>

      {isLoading ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonStyleCard key={index} />
          ))}
        </SimpleGrid>
      ) : assets.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {assets.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              onRemoveFromCollection={() => handleRemoveAsset(style.id)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center py={10}>
          <Text color="gray.500">This collection is empty. Add some styles!</Text>
        </Center>
      )}

      <RenameCollectionModal
        isOpen={isRenameOpen}
        onClose={onRenameClose}
        collection={collection}
        onRenameSuccess={handleRenameSave}
      />
    </VStack>
  );
} 