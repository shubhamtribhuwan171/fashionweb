import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  useDisclosure,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
// Adjust import paths with correct casing
import GarmentCard from '../components/Garments/GarmentCard';
import AddGarmentModal from '../components/Modals/AddGarmentModal';
// Use mock data functions
import { getMockProducts, createMockProduct } from '../data/mockData';

function ProductsPage() { // Changed to named export
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed useAuth() for now, assume a default workspace or handle later
  const currentWorkspaceId = 'mock_workspace_1'; // Placeholder

  // --- Fetch Products Function --- 
  const fetchProducts = useCallback(async (showLoading = true) => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      setProducts([]);
      return;
    }

    if (showLoading) setIsLoading(true);
    try {
      // Use mock function
      const data = await getMockProducts(currentWorkspaceId);
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching mock products:", error);
      toast({
        title: 'Error fetching products',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProducts([]); // Clear products on error
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentWorkspaceId, toast]);

  // --- Initial Fetch --- 
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); 

  // --- Add Product Function --- 
  const handleAddGarment = async (newGarmentData) => {
    if (!currentWorkspaceId) {
      toast({ title: "Cannot add garment", description: "Workspace missing.", status: "error" });
      // Reject the promise so the modal knows it failed
      return Promise.reject(new Error("Workspace missing"));
    }
    
    const { name, reference_image_url } = newGarmentData;

    if (!name || !reference_image_url) {
        toast({ title: "Missing Information", description: "Both name and image URL are required.", status: "warning"});
        return Promise.reject(new Error("Missing information"));
    }

    // Return the promise from createMockProduct so the modal can await it
    return new Promise(async (resolve, reject) => {
      try {
        // Use mock function
        const createdProduct = await createMockProduct({
           name, 
           reference_image_url, 
           workspace_id: currentWorkspaceId 
        });

        // Add the new product to the start of the list for immediate feedback
        setProducts(prevProducts => [createdProduct, ...prevProducts]); 
        toast({ title: "Garment added successfully!", status: "success", duration: 2000 });
        // Don't close modal here, let the modal close itself on successful promise resolution
        resolve(createdProduct); // Resolve the promise on success

      } catch (error) {
        console.error("Error adding mock garment:", error);
        toast({
          title: 'Error adding garment',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        reject(error); // Reject the promise on failure
      }
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justifyContent="space-between">
        <Box>
          {/* Match heading from API reference/PRD */}
          <Heading size="lg">Base Garments</Heading> 
          <Text color="gray.500">Manage your base clothing items.</Text>
          {/* Example of showing limitation */}
          <Text fontSize="xs" color="gray.400" mt={1}>Note: Editing and deleting garments is not currently supported via the API.</Text>
        </Box>
        <Button colorScheme="blue" onClick={onOpen}>Add Garment</Button>
      </HStack>

      {!currentWorkspaceId ? (
        <Center py={10}><Text color="orange.500">Please select a workspace to view garments.</Text></Center>
      ) : isLoading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : products.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {products.map((product) => (
            <GarmentCard key={product.id} garment={product} />
          ))}
        </SimpleGrid>
      ) : (
        <Center py={10}><Text>No garments found for this workspace. Click 'Add Garment' to add your first one.</Text></Center>
      )}
      
      <AddGarmentModal isOpen={isOpen} onClose={onClose} onAddGarment={handleAddGarment} />
    </VStack>
  );
}

export default ProductsPage; // Add default export 