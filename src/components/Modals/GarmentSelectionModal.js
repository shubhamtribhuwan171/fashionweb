import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { getMockProducts } from '../../data/mockData'; 

// Simple clickable card specifically for the modal
function SelectableGarmentCard({ garment, onSelect }) {
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

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setLoading(true);
      setSearchTerm(''); // Reset search on open
      getMockProducts() // Use imported function
        .then(data => {
          if (isMounted) setProducts(data || []);
        })
        .catch(err => {
            console.error("Error fetching products for modal:", err);
             if (isMounted) setProducts([]);
        })
        .finally(() => {
           if (isMounted) setLoading(false);
        });
    }
    return () => { isMounted = false; };
  }, [isOpen]); 

  const handleSelect = (product) => {
    onSelectGarment(product); // Pass the full product object back
    onClose(); 
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
          ) : filteredProducts.length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={5}>
              {filteredProducts.map((product) => (
                <SelectableGarmentCard 
                    key={product.id} 
                    garment={product} 
                    onSelect={handleSelect} 
                />
              ))}
            </SimpleGrid>
          ) : (
             <Center py={5}><Text>No garments found{searchTerm ? ' matching "' + searchTerm + '"' : ''}.</Text></Center>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 