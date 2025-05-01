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
} from '@chakra-ui/react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { FaChevronRight, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import StyleCard from '../components/Styles/StyleCard';
import RenameCollectionModal from '../components/Modals/RenameCollectionModal';
import { getMockCollectionById, renameMockCollection, deleteMockCollection } from '../data/mockData';

export default function CollectionDetailPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCollectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const collectionData = await getMockCollectionById(collectionId);
      if (collectionData) {
        setCollection(collectionData);
      } else {
        setError('Collection not found');
      }
    } catch (err) {
      console.error("Error fetching collection details:", err);
      setError(err.message || 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollectionDetails();
  }, [fetchCollectionDetails]);

  const handleRenameSave = async (id, updatedData) => {
    console.log(`MOCK: Simulating rename for ${id} with data:`, updatedData);
    return new Promise(async (resolve, reject) => {
      try {
        const updatedCollection = await renameMockCollection(id, updatedData);
        setCollection(updatedCollection);
        resolve();
      } catch (err) {
        console.error("Rename failed:", err);
        reject(err);
      }
    });
  };

  const handleDeleteCollection = async () => {
    setIsDeleting(true);
    try {
      await deleteMockCollection(collectionId);
      toast({ title: "Collection deleted", status: "success", duration: 2000 });
      navigate('/app/collections', { replace: true });
    } catch (error) {
      console.error("Delete failed:", error);
      toast({ title: "Failed to delete collection", status: "error", duration: 3000 });
      setIsDeleting(false);
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

  const assets = collection.assets || [];

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
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={handleDeleteCollection}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete
          </Button>
        </HStack>
      </HStack>

      {assets.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {assets.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
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
        onRenameCollection={handleRenameSave}
      />
    </VStack>
  );
} 