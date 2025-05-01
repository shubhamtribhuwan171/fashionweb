import React, { useState, useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import CollectionCard from '../components/Collections/CollectionCard';
import CreateCollectionModal from '../components/Modals/CreateCollectionModal';
import { getMockCollections, createMockCollection } from '../data/mockData';

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const toast = useToast();

  const fetchCollections = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await getMockCollections();
      setCollections(data || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
      toast({ title: "Failed to load collections", status: "error", duration: 3000 });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleCreateCollection = async (collectionData) => {
    return new Promise(async (resolve, reject) => {
      try {
        await createMockCollection(collectionData);
        toast({ title: "Collection created!", status: "success", duration: 2000 });
        await fetchCollections(false);
        resolve();
      } catch (error) {
        console.error("Failed to create collection:", error);
        reject(error);
      }
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justifyContent="space-between">
        <Box>
          <Heading size="lg">Collections</Heading>
          <Text color="gray.500">Organize your visualized looks into collections.</Text>
        </Box>
        <Button colorScheme="blue" onClick={onCreateOpen}>Create Collection</Button>
      </HStack>

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : collections.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </SimpleGrid>
      ) : (
        <Center py={10}>
          <Text>No collections created yet. Click 'Create Collection' to start.</Text>
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

export default CollectionsPage; 