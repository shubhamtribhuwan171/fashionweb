import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Image,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Button,
  Spinner,
  Text,
  Box,
  Input, 
  InputGroup,
  InputLeftElement,
  useDisclosure, 
  Center, 
  useColorModeValue,
  AspectRatio,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';

// TODO: Move to config
const API_BASE_URL = 'https://productmarketing-ai-f0e989e4e1ad.herokuapp.com';

// TODO: Replace with actual workspace ID from context/state management
const getMockWorkspaceId = () => '95d29ad4-47fa-48ee-85cb-cbf762eb400a';

// Simple clickable card specifically for the modal
function SelectableGarmentCard({ garment, onSelect, isSelected }) {
    const imageUrl = garment.reference_image_url || 'https://via.placeholder.com/150?text=No+Image'; 
    return (
        <Box 
            borderWidth="1px" 
            borderRadius="lg" 
            overflow="hidden" 
            bg={useColorModeValue('white', 'gray.700')} 
            _hover={{ shadow: 'md', cursor: 'pointer', borderColor: 'blue.400' }} 
            onClick={() => onSelect(garment)} 
            textAlign="center"
            borderColor={isSelected ? 'blue.400' : 'transparent'}
        >
            <AspectRatio ratio={1}>
                <Image 
                    src={imageUrl} 
                    alt={garment.name} 
                    objectFit="cover" 
                />
            </AspectRatio>
            <Box p={3}>
                <Text fontSize="xs" fontWeight="medium" noOfLines={1}>{garment.name}</Text>
            </Box>
        </Box>
    );
}

export default function GarmentSelectionModal({ isOpen, onClose, onSelectGarment }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [error, setError] = useState(null);
  const [selectedGarmentInternal, setSelectedGarmentInternal] = useState(null);
  const toast = useToast();
  const currentWorkspaceId = getMockWorkspaceId(); 

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast({ title: "Authentication Error", description: "Please log in.", status: "error" });
        return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [toast]);

  const fetchProductsForModal = useCallback(async () => {
    setLoading(true);
    setError(null);
    const config = getAuthConfig();
    if (!currentWorkspaceId || !config) {
        setError("Workspace ID or Authentication missing.");
        setLoading(false);
        setProducts([]);
        return;
    }
    
    try {
      // --- Real API Call --- 
      console.log(`Modal: Fetching products for workspace ${currentWorkspaceId}`);
      const response = await axios.get(`${API_BASE_URL}/api/products`, {
        ...config,
        params: { workspaceId: currentWorkspaceId } // Filter by workspace
      });
      setProducts(response.data || []);
    } catch (err) {
      console.error("Error fetching products for modal:", err);
      const errorMsg = err.response?.data?.message || "Failed to load garments";
      setError(errorMsg);
      toast({ title: "Error Loading Garments", description: errorMsg, status: "error", duration: 3000 });
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId, getAuthConfig, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchProductsForModal();
      setSelectedGarmentInternal(null);
    }
  }, [isOpen, fetchProductsForModal]); 

  const handleSelect = (product) => {
    setSelectedGarmentInternal(product);
  };

  const handleConfirmSelection = () => {
    if (selectedGarmentInternal) {
        onSelectGarment(selectedGarmentInternal);
    onClose(); 
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader 
          fontSize="lg" 
          fontWeight="semibold"
          borderBottomWidth="1px"
          borderColor="gray.100"
          py={4} px={6}
        >
          Select a Base Garment
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />
        <ModalBody pt={4} pb={6} px={6}>
           <InputGroup mb={5}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input 
                    placeholder="Search garments..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    borderRadius="md"
                />
           </InputGroup>
          {loading ? (
            <Center py={5}><Spinner /></Center>
          ) : error ? (
             <Center py={5}><Text color="red.500">Error: {error}</Text></Center>
          ) : filteredProducts.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={5}>
              {filteredProducts.map((product) => (
                <SelectableGarmentCard 
                    key={product.id} 
                    garment={product} 
                    onSelect={handleSelect} 
                    isSelected={selectedGarmentInternal?.id === product.id}
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No garments found{searchTerm ? ` matching "${searchTerm}"` : ''}.</Text></Center>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
          <Button 
            colorScheme="purple"
            onClick={handleConfirmSelection}
            isDisabled={!selectedGarmentInternal}
          >
            Select Garment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 