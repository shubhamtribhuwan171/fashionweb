import React, { useState, useEffect, useCallback, useContext } from 'react';
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
  Alert,
  AlertIcon,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Skeleton,
  SkeletonText,
  ButtonGroup,
} from '@chakra-ui/react';
import axios from 'axios'; // Import axios
// Adjust import paths with correct casing
import GarmentCard from '../components/Garments/GarmentCard';
import AddGarmentModal from '../components/Modals/AddGarmentModal';
import { FaPlus, FaSafari } from 'react-icons/fa'; // Corrected icon import
import { usePageHeader } from '../components/Layout/DashboardLayout'; // Import hook

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// Skeleton Card Component (matches GarmentCard structure)
const SkeletonGarmentCard = () => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
    <Skeleton height="150px" /> {/* Approximate image height */} 
    <SkeletonText mt="4" noOfLines={2} spacing="4" skeletonHeight="2" />
  </Box>
);

export default function ProductsPage() {
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [garmentTypeFilter, setGarmentTypeFilter] = useState('all');
  // Placeholder - replace with actual workspace context
  const currentWorkspaceId = getMockWorkspaceId(); 
  const { setHeader } = usePageHeader(); // Use hook

  const numSkeletons = 12; // Number of skeletons

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  // --- Fetch Products Function --- 
  const fetchProducts = useCallback(async (showLoading = true) => {
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
      setIsLoading(false);
      setProducts([]);
      if (!config) setError("Authentication required.");
      else setError("No workspace selected."); // Assuming setError exists
      return;
    }
    // Clear error if config is valid
    // if (typeof setError === 'function') setError(null); 

    if (showLoading) setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        ...config, // Spread auth headers
        params: { workspaceId: currentWorkspaceId } // Pass workspaceId as query param
      });
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: 'Error fetching products',
        description: error.response?.data?.message || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setProducts([]); // Clear products on error
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentWorkspaceId, toast, getAuthConfig]); // Added getAuthConfig dependency

  // --- Initial Fetch --- 
  useEffect(() => {
    fetchProducts();
    setHeader('Virtual Closet', 'Manage your apparel items.'); // Updated header
    return () => setHeader('', ''); // Clear on unmount
  }, [fetchProducts, setHeader]); 

  // --- Add Product Function (with Upload) --- 
  const handleAddGarmentWithUpload = async (garmentData) => {
    const config = getAuthConfig();
    const { name, imageFile, garmentType, description, tags, is_favorite } = garmentData;

    if (!currentWorkspaceId || !config || !name || !imageFile || !garmentType) {
        toast({ title: "Cannot add garment", description: "Missing workspace, auth, name, image file, or garment type.", status: "error" });
        return Promise.reject(new Error("Missing information or auth"));
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: Upload image
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('workspaceId', currentWorkspaceId);
        
        console.log("Uploading image...");
        const uploadResponse = await axios.post(`${API_BASE_URL}/api/input-images/upload`, formData, {
           headers: {
             ...config.headers, // Spread auth headers
             'Content-Type': 'multipart/form-data', // Important for file uploads
           },
        });
        
        const imageUrl = uploadResponse.data?.storage_url;
        if (!imageUrl) {
          throw new Error("Image uploaded, but no URL was returned.");
        }
        console.log("Image uploaded successfully:", imageUrl);

        // Step 2: Create product using the uploaded image URL and NEW fields
        console.log("Creating product record via multipart/form-data with new fields...");
        const productForm = new FormData();
        productForm.append('name', name.trim());
        productForm.append('workspace_id', currentWorkspaceId);
        productForm.append('reference_image_url', imageUrl);
        productForm.append('garment_type', garmentType);
        if (description) {
            productForm.append('description', description);
        }
        if (tags && tags.length > 0) {
            productForm.append('tags', JSON.stringify(tags));
        }
        productForm.append('is_favorite', String(is_favorite));

        const createResponse = await axios.post(
          `${API_BASE_URL}/api/products`,
          productForm,
          {
            ...config,
            headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
          }
        );

        toast({ title: "Garment added successfully!", status: "success", duration: 2000 });
        fetchProducts(false); // Refresh list without full loading spinner
        resolve(createResponse.data); // Resolve promise with new product data

      } catch (error) {
        console.error("Error adding garment:", error);
        const errorMsg = error.response?.data?.message || error.message || "An unknown error occurred";
        toast({
          title: 'Error adding garment',
          description: errorMsg,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        reject(new Error(errorMsg)); // Reject the promise on failure
      }
    });
  };

  // --- Delete Product Function --- 
  const handleDeleteGarment = async (garmentId) => {
    const config = getAuthConfig();
    if (!config || !garmentId) {
        toast({ title: "Cannot delete garment", description: "Auth or Garment ID missing.", status: "error" });
        return;
    }

    // Confirmation dialog
    if (window.confirm('Are you sure you want to delete this base garment?')) {
        try {
            console.log(`Attempting to delete garment: ${garmentId}`);
            await axios.delete(`${API_BASE_URL}/api/products/${garmentId}`, config);
            toast({ title: "Garment deleted", status: "success", duration: 2000 });
            // Remove from state locally for instant feedback
            setProducts(prev => prev.filter(p => p.id !== garmentId));
            // Alternatively, refetch the list: fetchProducts(false);
        } catch (error) {
             console.error("Error deleting garment:", error);
            const errorMsg = error.response?.data?.message || error.message || "Could not delete garment.";
            toast({
                title: 'Error deleting garment',
                description: errorMsg,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }
  };

  const handleAddSuccess = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter(p => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = garmentTypeFilter === 'all' || p.garment_type === garmentTypeFilter;
    return nameMatch && typeMatch;
  });

  return (
    <VStack spacing={6} align="stretch">
      <Flex mb={6} align="center" wrap="wrap" gap={4}>
        {/* Filter Buttons */}
        <ButtonGroup size="sm" isAttached variant="outline" mr={4}>
            <Button
                onClick={() => setGarmentTypeFilter('all')}
                isActive={garmentTypeFilter === 'all'}
            >
                All
            </Button>
            <Button
                onClick={() => setGarmentTypeFilter('top')}
                isActive={garmentTypeFilter === 'top'}
            >
                Tops
            </Button>
            <Button
                onClick={() => setGarmentTypeFilter('bottom')}
                isActive={garmentTypeFilter === 'bottom'}
            >
                Bottoms
            </Button>
            {/* Add 'other' if needed */}
            {/* <Button 
                 onClick={() => setGarmentTypeFilter('other')}
                 isActive={garmentTypeFilter === 'other'}
             >
                 Other
             </Button> */}
        </ButtonGroup>

        {/* Search Input */}
        <InputGroup maxW={{ base: 'full', sm: '250px' }} flexGrow={1}>
          <InputLeftElement pointerEvents="none">
             <Icon as={FaSafari} color="gray.400" />
          </InputLeftElement>
          <Input
              placeholder="Search apparel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="md"
          />
        </InputGroup>

        <Spacer />

        {/* Add Apparel Button */}
        <Button
          leftIcon={<FaPlus />}
          onClick={onAddModalOpen}
          // Add custom styling
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
          Add Apparel
        </Button>
      </Flex>

      {!currentWorkspaceId ? (
        <Center py={10}><Text color="orange.500">Please select a workspace to view garments.</Text></Center>
      ) : isLoading ? (
        // Show Skeleton Grid while loading
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {Array.from({ length: numSkeletons }).map((_, index) => (
            <SkeletonGarmentCard key={index} />
          ))}
        </SimpleGrid>
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      ) : filteredProducts.length > 0 ? (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={6}>
          {filteredProducts.map((product) => (
            <GarmentCard 
              key={product.id} 
              garment={product} 
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center p={10} borderWidth="1px" borderRadius="md" borderStyle="dashed">
           <Heading size="md" color="gray.500">
             {searchTerm || garmentTypeFilter !== 'all'
                ? `No apparel found matching criteria.`
                : 'No apparel items yet.'
             }
           </Heading>
        </Center>
      )}
      
      <AddGarmentModal 
        isOpen={isAddModalOpen} 
        onClose={onAddModalClose} 
        onAddGarmentWithUpload={handleAddGarmentWithUpload} 
      />
    </VStack>
  );
}